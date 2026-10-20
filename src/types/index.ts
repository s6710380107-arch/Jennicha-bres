export type UserRole = 'member' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EducationLevel =
  | 'ทุกระดับชั้น'
  | 'ประถมศึกษา'
  | 'มัธยมศึกษาตอนต้น'
  | 'มัธยมศึกษาตอนปลาย'
  | 'อาชีวศึกษา (ปวช./ปวส.)'
  | 'อุดมศึกษา / มหาวิทยาลัย'
  | 'ประชาชนทั่วไป';

export type MediaType =
  | 'ทั้งหมด'
  | 'เอกสาร / PDF'
  | 'วิดีโอ (YouTube/Vimeo)'
  | 'เว็บไซต์ / บทความ'
  | 'สื่อนำเสนอ (Slides)'
  | 'แบบฝึกหัด / ข้อสอบ'
  | 'คอร์สเรียน / แหล่งเรียนรู้อื่นๆ';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  mediaType: string;
  url?: string;
  fileAttachmentUrl?: string;
  fileName?: string;
  fileSize?: number;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorPhotoURL?: string;
  isHidden: boolean;
  viewCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  resourceMediaType: string;
  resourceLevel: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reason: string;
  details: string;
  reporterId: string;
  reporterEmail: string;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ModerationLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  performedByUid: string;
  performedByEmail: string;
  reason: string;
  timestamp: string;
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  announcement: string;
  logoUrl: string;
  categories: string[];
  updatedBy?: string;
  updatedAt?: string;
}
