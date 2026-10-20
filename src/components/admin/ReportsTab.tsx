import React, { useState, useEffect } from 'react';
import { Flag, CheckCircle, XCircle, Eye, EyeOff, Trash2, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { ReportItem, ResourceItem } from '../../types';
import { subscribeToReports, updateReportStatus } from '../../services/reportService';
import { updateResource, deleteResource } from '../../services/resourceService';
import { recordModerationLog } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';

interface ReportsTabProps {
  resources: ResourceItem[];
  onOpenResource: (resource: ResourceItem) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ resources, onOpenResource }) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [selectedReportForDelete, setSelectedReportForDelete] = useState<{ report: ReportItem; resource: ResourceItem } | null>(null);

  useEffect(() => {
    const unsub = subscribeToReports(
      (items) => {
        setReports(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleToggleHide = async (report: ReportItem, resource: ResourceItem) => {
    if (!currentUser) return;
    try {
      const willHide = !resource.isHidden;
      await updateResource(resource.id, { isHidden: willHide });
      await recordModerationLog({
        action: willHide ? 'ซ่อนสื่อจากสาธารณะ' : 'ยกเลิกการซ่อนสื่อ',
        targetType: 'resource',
        targetId: resource.id,
        targetTitle: resource.title,
        performedByUid: currentUser.uid,
        performedByEmail: currentUser.email || '',
        reason: `ดำเนินการตามรายงาน: ${report.reason}`,
      });
      showSuccess(willHide ? 'ซ่อนสื่อเรียบร้อยแล้ว' : 'ยกเลิกการซ่อนสื่อแล้ว');
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถดำเนินการได้');
    }
  };

  const handleStatusChange = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!currentUser) return;
    try {
      await updateReportStatus(
        reportId,
        status,
        status === 'resolved' ? 'ผู้ดูแลได้ตรวจสอบและดำเนินการเรียบร้อย' : 'ยกเลิกรายงานเนื่องจากข้อมูลไม่ตรงเงื่อนไข'
      );
      await recordModerationLog({
        action: status === 'resolved' ? 'ปิดรายงาน (Resolved)' : 'ปฏิเสธรายงาน (Dismissed)',
        targetType: 'report',
        targetId: reportId,
        targetTitle: `รายงาน ID: ${reportId}`,
        performedByUid: currentUser.uid,
        performedByEmail: currentUser.email || '',
        reason: status === 'resolved' ? 'แก้ไขหรือตรวจสอบเสร็จสิ้น' : 'รายงานไม่เข้าเกณฑ์',
      });
      showSuccess(status === 'resolved' ? 'บันทึกการแก้ไขรายงานสำเร็จ' : 'ยกเลิกรายงานแล้ว');
    } catch (err) {
      console.error(err);
      showError('เกิดข้อผิดพลาดในการปรับสถานะ');
    }
  };

  const confirmDeleteResource = async () => {
    if (!selectedReportForDelete || !currentUser) return;
    const { report, resource } = selectedReportForDelete;
    try {
      await deleteResource(resource.id);
      await updateReportStatus(report.id, 'resolved', 'ลบสื่อการเรียนรู้ออกจากระบบถาวร');
      await recordModerationLog({
        action: 'ลบสื่อการเรียนรู้ถาวร',
        targetType: 'resource',
        targetId: resource.id,
        targetTitle: resource.title,
        performedByUid: currentUser.uid,
        performedByEmail: currentUser.email || '',
        reason: `ลบเนื่องจากถูกรายงาน: ${report.reason} (${report.details || '-'})`,
      });
      showSuccess('ลบสื่อการเรียนรู้และปิดรายงานแล้ว');
      setSelectedReportForDelete(null);
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถลบสื่อได้');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">กำลังโหลดข้อมูลรายงาน...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">รายการรายงานปัญหา ({filteredReports.length})</h3>
          <p className="text-xs text-slate-500">ตรวจสอบและจัดการสื่อที่ได้รับการแจ้งเตือนจากสมาชิก</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'pending' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รอดำเนินการ ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'resolved' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            จัดการแล้ว ({reports.filter((r) => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('dismissed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'dismissed' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ยกเลิก ({reports.filter((r) => r.status === 'dismissed').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === 'all' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({reports.length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h4 className="font-semibold text-slate-700">ไม่มีรายการรายงานในหมวดหมู่นี้</h4>
          <p className="text-xs text-slate-400 mt-1">คลังความรู้สะอาดและเป็นระเบียบเรียบร้อย</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const targetResource = resources.find((res) => res.id === report.resourceId);

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        report.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : report.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {report.status === 'pending' && '⚠️ รอดำเนินการ'}
                      {report.status === 'resolved' && '✓ จัดการแล้ว'}
                      {report.status === 'dismissed' && '✕ ยกเลิกรายงาน'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(report.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    ผู้รายงาน: <span className="font-semibold text-slate-700">{report.reporterEmail || 'สมาชิก'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      สื่อที่ถูกรายงาน
                    </p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {targetResource ? targetResource.title : report.resourceTitle}
                    </p>
                    {targetResource ? (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-500">
                          ผู้เขียน: {targetResource.authorName} ({targetResource.authorEmail})
                        </span>
                        <button
                          onClick={() => onOpenResource(targetResource)}
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> ดูสื่อ
                        </button>
                      </div>
                    ) : (
                      <p className="text-red-500 italic">สื่อนี้ถูกลบออกจากระบบแล้ว</p>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                    <p className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                      สาเหตุการรายงาน
                    </p>
                    <p className="font-semibold text-amber-900">{report.reason}</p>
                    {report.details && (
                      <p className="text-slate-600 mt-1 bg-white/80 p-2 rounded-lg border border-amber-200/50">
                        {report.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Moderator Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {targetResource && (
                      <>
                        <button
                          onClick={() => handleToggleHide(report, targetResource)}
                          className={`px-3 py-1.5 rounded-xl font-medium border flex items-center gap-1.5 transition-colors ${
                            targetResource.isHidden
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {targetResource.isHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" /> แสดงสื่อคืนสู่สาธารณะ
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> ซ่อนสื่อนี้ชั่วคราว
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedReportForDelete({ report, resource: targetResource })}
                          className="px-3 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบสื่อถาวร
                        </button>
                      </>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        ยกเลิกรายงาน
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors"
                      >
                        ทำเครื่องหมายว่าจัดการแล้ว
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={!!selectedReportForDelete}
        title="ยืนยันการลบสื่อการเรียนรู้ถาวร"
        message={`คุณต้องการลบสื่อ "${selectedReportForDelete?.resource.title}" ออกจากระบบหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันการลบ"
        isDestructive={true}
        onConfirm={confirmDeleteResource}
        onClose={() => setSelectedReportForDelete(null)}
      />
    </div>
  );
};
