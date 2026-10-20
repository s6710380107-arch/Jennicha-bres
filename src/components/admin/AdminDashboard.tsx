import React, { useState } from 'react';
import { Shield, Flag, Users, Settings, History, ArrowLeft } from 'lucide-react';
import { ResourceItem, SiteConfig } from '../../types';
import { ReportsTab } from './ReportsTab';
import { UsersTab } from './UsersTab';
import { SettingsTab } from './SettingsTab';
import { AuditLogsTab } from './AuditLogsTab';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  resources: ResourceItem[];
  siteConfig: SiteConfig;
  onBack: () => void;
  onOpenResource: (resource: ResourceItem) => void;
}

type TabType = 'reports' | 'users' | 'settings' | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  resources,
  siteConfig,
  onBack,
  onOpenResource,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const { isAdmin, isModerator } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับสู่หน้าหลักคลังปัญญา
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ศูนย์ควบคุมและดูแลระบบ (Admin Dashboard)</h1>
              <p className="text-xs text-blue-200">
                จัดการรายงานความปลอดภัย บัญชีผู้ใช้งาน และตั้งค่าหมวดหมู่การเรียนรู้
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs text-blue-200 font-semibold">
            {isAdmin ? '🛡️ ผู้ดูแลระบบสูงสุด (Super Admin)' : '🛡️ ผู้ช่วยดูแลเนื้อหา (Moderator)'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>รายงานปัญหาเนื้อหา</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการสมาชิก</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่าเว็บไซต์ & หมวดหมู่</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติการดูแลระบบ</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'reports' && (
          <ReportsTab resources={resources} onOpenResource={onOpenResource} />
        )}
        {activeTab === 'users' && isAdmin && <UsersTab />}
        {activeTab === 'settings' && isAdmin && <SettingsTab config={siteConfig} />}
        {activeTab === 'logs' && <AuditLogsTab />}
      </div>
    </div>
  );
};
