import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isSuspended: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfile: (displayName: string, bio?: string, photoURL?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAIL = 's6710380107@pkru.ac.th';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or initialize user profile in Firestore
  const syncUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userDocRef);
      const isSuperAdminEmail = (user.email || '').toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If user is superadmin email but not marked admin yet, auto-elevate
        if (isSuperAdminEmail && data.role !== 'admin') {
          await updateDoc(userDocRef, {
            role: 'admin',
            updatedAt: new Date().toISOString(),
          });
          data.role = 'admin';
          // Ensure admins collection doc exists for security rules
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            assignedAt: new Date().toISOString(),
          }, { merge: true });
        }
        setUserProfile(data);
      } else {
        const initialRole: UserRole = isSuperAdminEmail ? 'admin' : 'member';
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: initialRole,
          status: 'active',
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newProfile);
        if (isSuperAdminEmail) {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            assignedAt: new Date().toISOString(),
          }, { merge: true });
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Failed to sync user profile:', err);
      // Fallback local representation to prevent UI crash
      const fallbackRole: UserRole = (user.email || '').toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'admin' : 'member';
      setUserProfile({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
        email: user.email || '',
        role: fallbackRole,
        status: 'active',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(res.user);
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName });
    try {
      await sendEmailVerification(res.user);
    } catch (e) {
      console.warn('Could not send verification email automatically:', e);
    }
    await syncUserProfile(res.user);
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(res.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateUserProfile = async (displayName: string, bio?: string, photoURL?: string) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const updates: Partial<UserProfile> = {
      displayName,
      updatedAt: new Date().toISOString(),
    };
    if (bio !== undefined) updates.bio = bio;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    try {
      await updateDoc(userDocRef, updates);
      await updateProfile(currentUser, { displayName, photoURL: photoURL || currentUser.photoURL });
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const isSuperAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || userProfile?.role === 'admin';
  const isModerator = isAdmin || userProfile?.role === 'moderator';
  const isSuspended = userProfile?.status === 'suspended';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isModerator,
        isSuspended,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
