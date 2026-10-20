import React from 'react';
import { BookOpen, Heart, ShieldCheck, Database, Award } from 'lucide-react';
import { SiteConfig } from '../types';

interface FooterProps {
  siteConfig: SiteConfig;
  onNavigateCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ siteConfig, onNavigateCategory }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">{siteConfig.siteName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {siteConfig.siteDescription ||
                'แพลตฟอร์มศูนย์รวมและแบ่งปันสื่อการเรียนรู้ บทเรียน และคลังความรู้สำหรับนักเรียน นักศึกษา และครูอาจารย์'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-blue-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ฐานข้อมูลจริง Cloud Firestore & Auth</span>
            </div>
          </div>

          {/* Col 2: Categories Shortcuts */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">หมวดหมู่ยอดนิยม</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              {(siteConfig.categories || []).slice(0, 5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigateCategory(cat)}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Role & Community */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">สิทธิ์การใช้งาน</h4>
            <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-200">1. บุคคลทั่วไป:</strong> ค้นหา เปิดดูสื่อ และดาวน์โหลดเอกสารได้ฟรี
              </p>
              <p>
                <strong className="text-slate-200">2. สมาชิก (Member):</strong> โพสต์สื่อ บันทึกรายการโปรด และรายงานปัญหา
              </p>
              <p>
                <strong className="text-slate-200">3. ผู้ดูแล (Admin/Mod):</strong> จัดการรายงาน ระงับบัญชี และตั้งค่าหมวดหมู่
              </p>
            </div>
          </div>

          {/* Col 4: Quality & Integrity */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">มาตรฐานชุมชน</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              เรามุ่งมั่นสร้างพื้นที่แห่งการแบ่งปันความรู้ที่ปลอดภัย ไร้สแปม และเคารพลิขสิทธิ์ทางปัญญา หากพบเนื้อหาไม่เหมาะสมสามารถกดปุ่ม "รายงาน" ได้ทันที
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-400 space-y-1">
              <p className="text-slate-300 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> มั่นใจในข้อมูล
              </p>
              <p>รองรับการตรวจสอบและกรองข้อมูลแบบ Zero-Trust Security</p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.siteName}. สงวนลิขสิทธิ์เพื่อการศึกษาไทย</p>
          <p className="flex items-center gap-1">
            ร่วมสร้างสรรค์ด้วยความใส่ใจเพื่อการศึกษา <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
