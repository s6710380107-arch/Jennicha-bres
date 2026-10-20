import React, { useState } from 'react';
import { X, User, Mail, Shield, CheckCircle, AlertTriangle, FileText, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, updateUserProfile, resendVerificationEmail, isAdmin, isModerator } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingVerify, setIsSendingVerify] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showError('กรุณากรอกชื่อแสดงในระบบ');
      return;
    }
    try {
      setIsSaving(true);
      await updateUserProfile(displayName.trim(), bio.trim());
      showSuccess('บันทึกข้อมูลส่วนตัวสำเร็จ');
      onClose();
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถบันทึกข้อมูลได้', 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsSendingVerify(true);
      await resendVerificationEmail();
      showSuccess('ส่งอีเมลยืนยันตัวตนแล้ว', `โปรดตรวจสอบกล่องข้อความที่ ${currentUser.email}`);
    } catch (err: any) {
      console.error(err);
      showError('ไม่สามารถส่งอีเมลได้', err.message);
    } finally {
      setIsSendingVerify(false);
    }
  };

  const roleLabel = isAdmin ? 'ผู้ดูแลระบบสูงสุด (Admin)' : isModerator ? 'ผู้ช่วยดูแล (Moderator)' : 'สมาชิกทั่วไป (Member)';
  const isEmailVerified = currentUser.emailVerified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">ข้อมูลบัญชีผู้ใช้</h3>
              <p className="text-xs text-slate-500">จัดการข้อมูลโปรไฟล์และสถานะความปลอดภัย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Status Bar */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                ระดับสิทธิ์:
              </span>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-purple-100 text-purple-700' : isModerator ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {roleLabel}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                สถานะอีเมล:
              </span>
              {isEmailVerified ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> ยืนยันแล้ว
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> ยังไม่ยืนยัน
                  </span>
                  <button
                    type="button"
                    disabled={isSendingVerify}
                    onClick={handleResendVerification}
                    className="text-blue-600 hover:underline font-semibold text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> ส่งใหม่
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อแสดงในระบบ (Display Name) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ชื่อ-นามสกุล หรือนามแฝง"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมล (แก้ไขไม่ได้)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={currentUser.email || ''}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-hidden cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประวัติย่อ / สังกัดสถานศึกษา
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เช่น ครูผู้สอนวิชาคอมพิวเตอร์ โรงเรียน... หรือ นักศึกษาคณะวิทยาศาสตร์ มหาวิทยาลัย..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึกข้อมูล'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
