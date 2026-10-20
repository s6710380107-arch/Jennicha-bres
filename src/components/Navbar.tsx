import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Heart,
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Compass,
  Search,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SiteConfig } from '../types';

interface NavbarProps {
  siteConfig: SiteConfig;
  currentView: 'home' | 'explore' | 'favorites' | 'admin' | 'my-resources';
  onNavigate: (view: 'home' | 'explore' | 'favorites' | 'admin' | 'my-resources') => void;
  onOpenAuth: (view: 'login' | 'register') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteConfig,
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenCreate,
  onOpenProfile,
  favoritesCount,
}) => {
  const { currentUser, userProfile, logout, isAdmin, isModerator, isSuspended } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo / Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight block leading-tight">
                {siteConfig.siteName || 'คลังปัญญา'}
              </span>
              <span className="text-[10px] text-blue-600 font-medium block">
                แหล่งเรียนรู้และแบ่งปันความรู้
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              หน้าแรก
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'explore'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>สำรวจคลังความรู้</span>
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('favorites')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentView === 'favorites'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>รายการโปรด</span>
                {favoritesCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {isModerator && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>แผงผู้ดูแล</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share / Post Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth('login');
                } else {
                  onOpenCreate();
                }
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แบ่งปันความรู้</span>
            </button>

            {currentUser ? (
              /* User Menu Dropdown */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-100 border border-slate-200/70 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {(userProfile?.displayName || currentUser.displayName || 'U').charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {userProfile?.displayName || currentUser.displayName || 'สมาชิก'}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {isAdmin ? 'แอดมิน' : isModerator ? 'ผู้ดูแล' : 'สมาชิก'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-12 sm:top-14 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-medium animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {userProfile?.displayName || currentUser.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      {isSuspended && (
                        <p className="text-[10px] text-red-600 font-semibold mt-1">⚠️ บัญชีถูกระงับการใช้งาน</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('my-resources');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
                    >
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>สื่อการเรียนรู้ของฉัน</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('favorites');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>รายการโปรด ({favoritesCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>แก้ไขข้อมูลโปรไฟล์</span>
                    </button>

                    {isModerator && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-700 flex items-center gap-2.5 font-semibold"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>แผงผู้ดูแลระบบ</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Login & Register Buttons */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2 text-sm font-medium text-slate-700">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>หน้าแรก</span>
            </button>

            <button
              onClick={() => {
                onNavigate('explore');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>สำรวจคลังความรู้</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth('login');
                else onOpenCreate();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แบ่งปันสื่อการเรียนรู้ใหม่</span>
            </button>

            {currentUser && (
              <>
                <button
                  onClick={() => {
                    onNavigate('favorites');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>รายการโปรด</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onNavigate('my-resources');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>สื่อของฉัน</span>
                </button>
              </>
            )}

            {isModerator && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>แผงผู้ดูแลระบบ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
