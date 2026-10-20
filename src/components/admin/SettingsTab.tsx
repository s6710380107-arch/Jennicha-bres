import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Check, X, Megaphone, Sliders, Globe } from 'lucide-react';
import { SiteConfig } from '../../types';
import { updateSiteConfig } from '../../services/settingsService';
import { recordModerationLog } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';

interface SettingsTabProps {
  config: SiteConfig;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ config }) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [siteName, setSiteName] = useState(config.siteName);
  const [siteDescription, setSiteDescription] = useState(config.siteDescription);
  const [announcement, setAnnouncement] = useState(config.announcement);
  const [categories, setCategories] = useState<string[]>(config.categories || []);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = () => {
    const val = newCatInput.trim();
    if (!val) return;
    if (categories.includes(val)) {
      showError('มีหมวดหมู่นี้อยู่ในระบบแล้ว');
      return;
    }
    setCategories([...categories, val]);
    setNewCatInput('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleSaveEdit = (index: number) => {
    const val = editingValue.trim();
    if (!val) return;
    const updated = [...categories];
    updated[index] = val;
    setCategories(updated);
    setEditingIndex(null);
  };

  const handleDeleteCategory = (index: number) => {
    if (categories.length <= 1) {
      showError('ระบบต้องมีอย่างน้อย 1 หมวดหมู่');
      return;
    }
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!siteName.trim()) {
      showError('กรุณากรอกชื่อเว็บไซต์');
      return;
    }

    try {
      setIsSaving(true);
      await updateSiteConfig(
        {
          siteName: siteName.trim(),
          siteDescription: siteDescription.trim(),
          announcement: announcement.trim(),
          categories,
        },
        currentUser.uid
      );

      await recordModerationLog({
        action: 'แก้ไขการตั้งค่าเว็บไซต์และหมวดหมู่',
        targetType: 'site_settings',
        targetId: 'siteConfig',
        targetTitle: siteName.trim(),
        performedByUid: currentUser.uid,
        performedByEmail: currentUser.email || '',
        reason: 'บันทึกการตั้งค่าระบบใหม่ผ่านหน้า Admin Dashboard',
      });

      showSuccess('บันทึกการตั้งค่าสำเร็จ!', 'ข้อมูลระบบและหมวดหมู่ถูกอัปเดตเรียบร้อย');
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAllSettings} className="space-y-6">
      {/* Site Identity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">ข้อมูลทั่วไปของเว็บไซต์</h3>
            <p className="text-xs text-slate-500">ปรับเปลี่ยนชื่อ คำอธิบาย เพื่อการแสดงผลที่หน้าแรก</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อเว็บไซต์ (Site Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              คำอธิบายเว็บไซต์ (Description)
            </label>
            <textarea
              rows={2}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" /> คำประกาศระบบ (Announcement Banner)
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="ข้อความประกาศที่จะขึ้นแถบด้านบนสุดของหน้าเว็บ..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">จัดการหมวดหมู่ความรู้ ({categories.length})</h3>
              <p className="text-xs text-slate-500">เพิ่ม ลบ หรือแก้ไขหมวดหมู่วิชา โดยไม่ต้องแก้โค้ดโปรแกรม</p>
            </div>
          </div>
        </div>

        {/* Add new category bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="พิมพ์ชื่อหมวดหมู่ใหม่ เช่น ดาราศาสตร์ หรือ ปัญญาประดิษฐ์ (AI)..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
          </button>
        </div>

        {/* Category list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              {editingIndex === idx ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white rounded border border-blue-400 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(idx)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-slate-800 truncate">{cat}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="แก้ไขชื่อ"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="ลบหมวดหมู่นี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังบันทึกลง Firestore...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลงทั้งหมด
            </>
          )}
        </button>
      </div>
    </form>
  );
};
