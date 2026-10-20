import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FavoriteItem, ResourceItem } from '../types';
import { incrementLikeCount } from './resourceService';

const COLLECTION_NAME = 'favorites';

export const getFavoriteDocId = (userId: string, resourceId: string) => `${userId}_${resourceId}`;

export const subscribeToUserFavorites = (
  userId: string,
  callback: (favorites: FavoriteItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: FavoriteItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FavoriteItem, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      console.error('Error in favorites subscription:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
};

export const toggleFavorite = async (
  userId: string,
  resource: ResourceItem,
  isCurrentlyFavorited: boolean
): Promise<boolean> => {
  const docId = getFavoriteDocId(userId, resource.id);
  const docRef = doc(db, COLLECTION_NAME, docId);

  try {
    if (isCurrentlyFavorited) {
      await deleteDoc(docRef);
      await incrementLikeCount(resource.id, -1);
      return false;
    } else {
      const favoriteData: Omit<FavoriteItem, 'id'> = {
        userId,
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceCategory: resource.category,
        resourceMediaType: resource.mediaType,
        resourceLevel: resource.level,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, favoriteData);
      await incrementLikeCount(resource.id, 1);
      return true;
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isCurrentlyFavorited ? OperationType.DELETE : OperationType.WRITE,
      `${COLLECTION_NAME}/${docId}`
    );
    throw error;
  }
};
