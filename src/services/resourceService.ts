import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { ResourceItem } from '../types';

const COLLECTION_NAME = 'resources';

export const subscribeToResources = (
  callback: (resources: ResourceItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ResourceItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ResourceItem, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      console.error('Snapshot error in resources:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
};

export const createResource = async (
  data: Omit<ResourceItem, 'id' | 'viewCount' | 'likesCount' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      viewCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const updateResource = async (
  id: string,
  data: Partial<Omit<ResourceItem, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
};

export const deleteResource = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
};

export const incrementViewCount = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      viewCount: increment(1),
    });
  } catch (error) {
    // Non-blocking for UI
    console.warn('Could not increment view count:', error);
  }
};

export const incrementLikeCount = async (id: string, delta: number): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      likesCount: increment(delta),
    });
  } catch (error) {
    console.warn('Could not update likes count:', error);
  }
};

export const uploadResourceFile = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ downloadUrl: string; fileName: string; fileSize: number }> => {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `resources/${userId}/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          fileName: file.name,
          fileSize: file.size,
        });
      }
    );
  });
};
