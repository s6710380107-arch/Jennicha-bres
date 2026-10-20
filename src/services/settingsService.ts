import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SiteConfig } from '../types';

const SETTINGS_DOC_ID = 'siteConfig';
const COLLECTION_NAME = 'settings';

export const DEFAULT_CATEGORIES = [
  'คอมพิวเตอร์และเทคโนโลยี',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และดาราศาสตร์',
  'ฟิสิกส์ เคมี และชีววิทยา',
  'ภาษาไทยและการสื่อสาร',
  'ภาษาอังกฤษและภาษาต่างประเทศ',
  'สังคมศึกษา ประวัติศาสตร์ และภูมิศาสตร์',
  'ศิลปะ ดนตรี และการออกแบบ',
  'การงานอาชีพ เทคโนโลยีสารสนเทศ และธุรกิจ',
  'สุขศึกษา พลศึกษา และการแพทย์เบื้องต้น',
  'ทักษะชีวิตและการพัฒนาตนเอง',
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'คลังปัญญา (KlangPanya)',
  siteDescription: 'แพลตฟอร์มรวบรวมและแบ่งปันสื่อการเรียนรู้ บทเรียน และคลังความรู้สำหรับนักเรียน นักศึกษา และครูอาจารย์',
  announcement: '📢 ยินดีต้อนรับสู่ คลังปัญญา! พื้นที่แบ่งปันและค้นพบสื่อการเรียนรู้เพื่อทุกคน สามารถร่วมโพสต์และบันทึกสื่อที่คุณชื่นชอบได้ทันที',
  logoUrl: '',
  categories: DEFAULT_CATEGORIES,
};

export const subscribeToSiteConfig = (
  callback: (config: SiteConfig) => void,
  onError?: (err: Error) => void
) => {
  const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteConfig;
        callback({
          ...DEFAULT_SITE_CONFIG,
          ...data,
          categories: data.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES,
        });
      } else {
        // Init default
        callback(DEFAULT_SITE_CONFIG);
      }
    },
    (error) => {
      console.warn('Config snapshot listener:', error);
      if (onError) onError(error);
    }
  );
};

export const updateSiteConfig = async (
  newConfig: Partial<SiteConfig>,
  adminUid: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
  try {
    await setDoc(
      docRef,
      {
        ...newConfig,
        updatedBy: adminUid,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${SETTINGS_DOC_ID}`);
    throw error;
  }
};
