import React, { useState, useEffect } from 'react';
import { History, Shield, Calendar, User, Info } from 'lucide-react';
import { ModerationLogItem } from '../../types';
import { subscribeToModerationLogs } from '../../services/adminService';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ModerationLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToModerationLogs(
      (items) => {
        setLogs(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('th-TH', {
        dateStyle: 'medium',
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
        <p className="text-sm">กำลังโหลดประวัติการดูแลระบบ...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">บันทึกประวัติการดูแลระบบ ({logs.length})</h3>
            <p className="text-xs text-slate-500">ตรวจสอบความโปร่งใสและการกระทำของผู้ดูแลทุกขั้นตอน</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ยังไม่มีบันทึกประวัติการกระทำของผู้ดูแล
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {log.action}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 font-medium">เป้าหมาย: {log.targetTitle}</span>
                </div>
                {log.reason && (
                  <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    เหตุผล: {log.reason}
                  </p>
                )}
              </div>

              <div className="flex sm:flex-col items-end gap-1 text-[11px] text-slate-400 shrink-0">
                <span className="font-medium text-slate-600 flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-500" />
                  {log.performedByEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(log.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
