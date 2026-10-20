import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ModerationLogItem, UserProfile, UserRole, UserStatus } from '../types';

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<UserProfile, 'uid'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
    throw error;
  }
};

export const subscribeToUsers = (
  callback: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users: UserProfile[] = snapshot.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<UserProfile, 'uid'>),
      }));
      callback(users);
    },
    (error) => {
      console.error('Error subscribing to users:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'users');
    }
  );
};

export const updateUserRole = async (
  targetUid: string,
  newRole: UserRole,
  adminUser: { uid: string; email: string }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    // Update admins collection accordingly
    const adminDocRef = doc(db, 'admins', targetUid);
    if (newRole === 'admin') {
      await setDoc(adminDocRef, {
        assignedAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      try {
        await deleteDoc(adminDocRef);
      } catch (e) {
        // May not exist, fine
      }
    }

    // Record moderation log
    await recordModerationLog({
      action: `เปลี่ยนสิทธิ์สมาชิกเป็น ${newRole}`,
      targetType: 'user',
      targetId: targetUid,
      targetTitle: `UID: ${targetUid}`,
      performedByUid: adminUser.uid,
      performedByEmail: adminUser.email,
      reason: `ปรับเปลี่ยนบทบาทผู้ใช้เป็น ${newRole}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    throw error;
  }
};

export const updateUserStatus = async (
  targetUid: string,
  newStatus: UserStatus,
  adminUser: { uid: string; email: string },
  reason: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    // Record moderation log
    await recordModerationLog({
      action: newStatus === 'suspended' ? 'ระงับบัญชีผู้ใช้' : 'ปลดระงับบัญชีผู้ใช้',
      targetType: 'user',
      targetId: targetUid,
      targetTitle: `UID: ${targetUid}`,
      performedByUid: adminUser.uid,
      performedByEmail: adminUser.email,
      reason: reason || (newStatus === 'suspended' ? 'ระงับเนื่องจากทำผิดกฎ' : 'ปลดการระงับการใช้งาน'),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    throw error;
  }
};

export const recordModerationLog = async (
  data: Omit<ModerationLogItem, 'id' | 'timestamp'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'moderationLogs'), {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'moderationLogs');
    throw error;
  }
};

export const subscribeToModerationLogs = (
  callback: (logs: ModerationLogItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, 'moderationLogs'), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ModerationLogItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ModerationLogItem, 'id'>),
      }));
      callback(logs);
    },
    (error) => {
      console.error('Error subscribing to moderation logs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'moderationLogs');
    }
  );
};
