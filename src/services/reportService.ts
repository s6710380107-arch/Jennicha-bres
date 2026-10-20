import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ReportItem } from '../types';

const COLLECTION_NAME = 'reports';

export const submitReport = async (
  data: Omit<ReportItem, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const subscribeToReports = (
  callback: (reports: ReportItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReportItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ReportItem, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      console.error('Error fetching reports:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
};

export const updateReportStatus = async (
  reportId: string,
  status: 'pending' | 'resolved' | 'dismissed',
  actionTaken?: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, reportId);
    await updateDoc(docRef, {
      status,
      actionTaken: actionTaken || '',
      resolvedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${reportId}`);
    throw error;
  }
};
