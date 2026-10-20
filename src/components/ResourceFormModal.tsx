import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  BookOpen,
  FileText,
  Video,
  Layers,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { createResource, updateResource, uploadResourceFile } from '../services/resourceService';
import { EducationLevel, MediaType, ResourceItem } from '../types';

interface ResourceFormModalProps {
  isOpen: boolean;
  categories: string[];
  resourceToEdit?: ResourceItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EDUCATION_LEVELS: EducationLevel[] = [
  'ทุกระดับชั้น',
  'ประถมศึกษา',
  'มัธยมศึกษาตอนต้น',
  'มัธยมศึกษาตอนปลาย',
  'อาชีวศึกษา (ปวช./ปวส.)',
  'อุดมศึกษา / มหาวิทยาลัย',
  'ประชาชนทั่วไป',
];

const MEDIA_TYPES: MediaType[] = [
  'เอกสาร / PDF',
  'วิดีโอ (YouTube/Vimeo)',
  'เว็บไซต์ / บทความ',
  'สื่อนำเสนอ (Slides)',
  'แบบฝึกหัด / ข้อสอบ',
  'คอร์สเรียน / แหล่งเรียนรู้อื่นๆ',
];

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  isOpen,
  categories,
  resourceToEdit,
  onClose,
  onSuccess,
}) => {
  const { currentUser, userProfile, isSuspended } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const isEditMode = !!resourceToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
  const [level, setLevel] = useState<EducationLevel>('ทุกระดับชั้น');
  const [mediaType, setMediaType] = useState<MediaType>('เอกสาร / PDF');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAttachmentUrl, setFileAttachmentUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setDescription(resourceToEdit.description);
      setCategory(resourceToEdit.category);
      setLevel(resourceToEdit.level as EducationLevel);
      setMediaType(resourceToEdit.mediaType as MediaType);
      setUrl(resourceToEdit.url || '');
      setFileAttachmentUrl(resourceToEdit.fileAttachmentUrl || '');
      setFileName(resourceToEdit.fileName || '');
      setFileSize(resourceToEdit.fileSize);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
      setLevel('ทุกระดับชั้น');
      setMediaType('เอกสาร / PDF');
      setUrl('');
      setSelectedFile(null);
      setFileAttachmentUrl('');
      setFileName('');
      setFileSize(undefined);
      setUploadProgress(null);
    }
  }, [resourceToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit to 25MB for safety
      if (file.size > 25 * 1024 * 1024) {
        showError('ไฟล์มีขนาดใหญ่เกินไป', 'กรุณาอัปโหลดไฟล์ที่มีขนาดไม่เกิน 25 MB หรือแนบเป็นลิงก์ Google Drive');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showError('กรุณาเข้าสู่ระบบก่อนทำการโพสต์');
      return;
    }

    if (isSuspended) {
      showError('บัญชีของคุณถูกระงับการใช้งาน', 'ไม่สามารถโพสต์สื่อการเรียนรู้ได้ในขณะนี้');
      return;
    }

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      showError('กรุณาระบุชื่อสื่อการเรียนรู้', 'ชื่อสื่อต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      showError('กรุณาระบุคำอธิบายสื่อการเรียนรู้', 'คำอธิบายควรมีอย่างน้อย 10 ตัวอักษร เพื่อให้เข้าใจเนื้อหา');
      return;
    }

    if (!url.trim() && !selectedFile && !fileAttachmentUrl) {
      showError('กรุณาแนบลิงก์สื่อ หรืออัปโหลดไฟล์แนบอย่างน้อย 1 อย่าง');
      return;
    }

    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      showError('รูปแบบลิงก์ไม่ถูกต้อง', 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalFileUrl = fileAttachmentUrl;
      let finalFileName = fileName;
      let finalFileSize = fileSize;

      // Upload file to Firebase Storage if selected
      if (selectedFile) {
        setUploadProgress(10);
        const uploadResult = await uploadResourceFile(
          selectedFile,
          currentUser.uid,
          (progress) => setUploadProgress(progress)
        );
        finalFileUrl = uploadResult.downloadUrl;
        finalFileName = uploadResult.fileName;
        finalFileSize = uploadResult.fileSize;
      }

      if (isEditMode && resourceToEdit) {
        await updateResource(resourceToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          level,
          mediaType,
          url: url.trim() || undefined,
          fileAttachmentUrl: finalFileUrl || undefined,
          fileName: finalFileName || undefined,
          fileSize: finalFileSize || undefined,
        });
        showSuccess('แก้ไขสื่อการเรียนรู้สำเร็จ');
      } else {
        await createResource({
          title: title.trim(),
          description: description.trim(),
          category,
          level,
          mediaType,
          url: url.trim() || undefined,
          fileAttachmentUrl: finalFileUrl || undefined,
          fileName: finalFileName || undefined,
          fileSize: finalFileSize || undefined,
          authorId: currentUser.uid,
          authorName: userProfile?.displayName || currentUser.displayName || 'ผู้แบ่งปัน',
          authorEmail: currentUser.email || '',
          authorPhotoURL: userProfile?.photoURL || currentUser.photoURL || undefined,
          isHidden: false,
        });
        showSuccess('โพสต์สื่อการเรียนรู้สำเร็จ!', 'สื่อของคุณพร้อมให้ทุกคนร่วมเรียนรู้แล้ว');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถบันทึกข้อมูลได้', 'โปรดตรวจสอบข้อมูลและสิทธิ์การเข้าถึง');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {isEditMode ? 'แก้ไขสื่อการเรียนรู้' : 'แบ่งปันสื่อการเรียนรู้ใหม่'}
              </h3>
              <p className="text-xs text-blue-200">
                ร่วมแบ่งปันความรู้ สื่อการสอน และบทเรียนเพื่อนักเรียนและคุณครูทั่วประเทศ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อสื่อ / หัวข้อความรู้ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปสูตรตรีโกณมิติ ม.ปลาย หรือ คอร์สเรียน Python ฉบับเริ่มต้น"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หมวดหมู่วิชา / หัวข้อ <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระดับชั้นเป้าหมาย <span className="text-red-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทสื่อการเรียนรู้ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEDIA_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMediaType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors flex items-center gap-2 ${
                    mediaType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="truncate">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> ลิงก์ภายนอก (YouTube, Drive, เว็บไซต์)
              </span>
              <span className="text-slate-400 font-normal text-xs">เลือกแนบลิงก์ หรืออัปโหลดไฟล์</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... หรือ https://drive.google.com/..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          {/* File Upload to Firebase Storage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-blue-600" /> อัปโหลดไฟล์เอกสาร / สื่อ (Firebase Storage)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {selectedFile || fileName ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {selectedFile ? selectedFile.name : fileName}
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      {selectedFile
                        ? `ขนาด ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB พร้อมอัปโหลด`
                        : 'มีไฟล์แนบอยู่แล้ว (คลิกเพื่อเปลี่ยน)'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700">คลิกหรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-[11px] text-slate-400">รองรับ PDF, Word, PowerPoint, MP4, รูปภาพ (ไม่เกิน 25 MB)</p>
                  </div>
                )}
              </div>
            </div>

            {uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>กำลังอัปโหลดไฟล์ขึ้น Firebase Storage...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              คำอธิบายรายละเอียด <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายว่าสื่อนี้เกี่ยวกับอะไร เหมาะกับใคร แนะนำวิธีการศึกษา หรือสารบัญเบื้องต้น..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึกลง Firestore...
                </>
              ) : (
                isEditMode ? 'บันทึกการแก้ไข' : 'เผยแพร่สื่อการเรียนรู้'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
