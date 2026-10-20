import React, { useState } from 'react';
import { Flag, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { submitReport } from '../services/reportService';
import { ResourceItem } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  resource: ResourceItem | null;
  onClose: () => void;
}

const REPORT_REASONS = [
  'ลิงก์เสีย ไฟล์เสียหาย หรือเปิดไม่ได้',
  'ละเมิดลิขสิทธิ์ / นำผลงานผู้อื่นมาลงโดยไม่ได้รับอนุญาต',
  'เนื้อหาไม่เหมาะสม หยาบคาย หรือผิดศีลธรรม',
  'ข้อมูลไม่ถูกต้อง วิชาการคลาดเคลื่อน หรือหลอกลวง',
  'การโฆษณาขายสินค้า หรือสแปม (Spam)',
  'อื่นๆ',
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, resource, onClose }) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showError('กรุณาเข้าสู่ระบบก่อนรายงานเนื้อหา');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReport({
        resourceId: resource.id,
        resourceTitle: resource.title,
        reason,
        details: details.trim(),
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email || '',
      });
      showSuccess('ส่งรายงานเรียบร้อยแล้ว', 'ผู้ดูแลระบบจะดำเนินการตรวจสอบโดยเร็วที่สุด');
      onClose();
      setDetails('');
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถส่งรายงานได้', 'โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">รายงานเนื้อหาที่ไม่เหมาะสม</h3>
              <p className="text-xs text-slate-500 line-clamp-1">สื่อ: {resource.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              เหตุผลในการรายงาน <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ระบุข้อเท็จจริง เช่น ลิงก์เข้าไม่ได้ตั้งแต่วันที่... หรือพบข้อความไม่เหมาะสมในนาทีที่..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่งรายงาน'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
