import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Compass,
  Heart,
  Filter,
  PlusCircle,
  GraduationCap,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileText,
  Video,
  ExternalLink,
  Users,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Breadcrumb, BreadcrumbItem } from './components/Breadcrumb';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ResourceFormModal } from './components/ResourceFormModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  subscribeToResources,
  deleteResource,
  createResource,
} from './services/resourceService';
import {
  subscribeToUserFavorites,
  toggleFavorite,
} from './services/favoriteService';
import {
  subscribeToSiteConfig,
  DEFAULT_SITE_CONFIG,
} from './services/settingsService';
import {
  ResourceItem,
  FavoriteItem,
  SiteConfig,
  EducationLevel,
  MediaType,
} from './types';

type ActiveView = 'home' | 'explore' | 'favorites' | 'admin' | 'my-resources';

// Sample starter resources to seed if database is brand new
const INITIAL_STARTER_RESOURCES: Array<
  Omit<ResourceItem, 'id' | 'viewCount' | 'likesCount' | 'createdAt' | 'updatedAt'>
> = [
  {
    title: 'สรุปสูตรและแนวข้อสอบคณิตศาสตร์ ม.ปลาย (ตรีโกณมิติและแคลคูลัส)',
    description: 'เอกสารรวบรวมสรุปสูตรสำคัญ พร้อมตัวอย่างโจทย์และวิธีทำอย่างละเอียด เหมาะสำหรับการเตรียมสอบ A-Level และข้อสอบเข้ามหาวิทยาลัย มีแบบฝึกหัดท้ายบทเพื่อทดสอบความเข้าใจ',
    category: 'คณิตศาสตร์',
    level: 'มัธยมศึกษาตอนปลาย',
    mediaType: 'เอกสาร / PDF',
    url: 'https://drive.google.com/file/d/sample-math-summary',
    fileName: 'สรุปสูตรคณิตศาสตร์_ม.ปลาย.pdf',
    authorId: 'system-seed',
    authorName: 'อ.วิชัย เกียรติวิทยา',
    authorEmail: 'wichai@school.ac.th',
    isHidden: false,
  },
  {
    title: 'คอร์สเรียนพื้นฐานการเขียนโปรแกรม Python สำหรับผู้เริ่มต้นและนักเรียน',
    description: 'วิดีโอสอนตั้งแต่พื้นฐานการติดตั้ง โปรแกรม ไวยากรณ์พื้นฐาน ตัวแปร เงื่อนไข วนลูป จนถึงการเขียนฟังก์ชันและการประยุกต์ใช้งานเบื้องต้น มีแบบฝึกหัดให้ฝึกเขียนโค้ดจริง',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    level: 'ทุกระดับชั้น',
    mediaType: 'วิดีโอ (YouTube/Vimeo)',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    authorId: 'system-seed',
    authorName: 'ทีมพัฒนานวัตกรรมดิจิทัลเพื่อการศึกษา',
    authorEmail: 'edtech@education.or.th',
    isHidden: false,
  },
  {
    title: 'คู่มือเทคนิคจำคำศัพท์และไวยากรณ์ภาษาอังกฤษ Essential English Grammar',
    description: 'รวบรวมหลักการจำ Tenses ทั้ง 12 กาล รูปแบบประโยค Passive Voice และคำเชื่อมสำคัญ พร้อมเทคนิค Mind Map เพื่อช่วยให้จดจำและสื่อสารได้อย่างถูกต้อง',
    category: 'ภาษาอังกฤษและภาษาต่างประเทศ',
    level: 'มัธยมศึกษาตอนต้น',
    mediaType: 'เอกสาร / PDF',
    url: 'https://drive.google.com/file/d/sample-english-grammar',
    fileName: 'Essential_Grammar_Techniques.pdf',
    authorId: 'system-seed',
    authorName: 'ครูเจนนี่ English Corner',
    authorEmail: 'jenny.eng@school.ac.th',
    isHidden: false,
  },
  {
    title: 'ชุดภาพอินโฟกราฟิก: ระบบสุริยะและกำเนิดจักรวาลวิทยาเบื้องต้น',
    description: 'สื่อการสอนดาราศาสตร์รูปแบบภาพสีสันสดใส เข้าใจง่าย อธิบายการโคจรของดาวเคราะห์ในระบบสุริยะ ดวงจันทร์บริวาร และปรากฏการณ์สุริยุปราคา-จันทรุปราคา',
    category: 'วิทยาศาสตร์และดาราศาสตร์',
    level: 'ประถมศึกษา',
    mediaType: 'สื่อนำเสนอ (Slides)',
    url: 'https://canva.com/design/sample-solar-system',
    authorId: 'system-seed',
    authorName: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์',
    authorEmail: 'science-hub@school.ac.th',
    isHidden: false,
  },
];

const MainApp: React.FC = () => {
  const { currentUser, userProfile, isAdmin, isModerator } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Navigation and Views
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  // Data states
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [selectedLevel, setSelectedLevel] = useState<string>('ทั้งหมด');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('ทั้งหมด');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'likes'>('newest');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [reportResource, setReportResource] = useState<ResourceItem | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleOpenAuth = (view: 'login' | 'register') => {
    setAuthInitialView(view);
    setAuthModalOpen(true);
  };

  // Subscribe to siteConfig
  useEffect(() => {
    const unsub = subscribeToSiteConfig((config) => {
      setSiteConfig(config);
    });
    return () => unsub();
  }, []);

  // Subscribe to resources
  useEffect(() => {
    const unsub = subscribeToResources(
      (items) => {
        setResources(items);
        setLoadingResources(false);
      },
      (error) => {
        console.error('Resources subscription error:', error);
        setLoadingResources(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to favorites if user is authenticated
  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToUserFavorites(
        currentUser.uid,
        (items) => {
          setFavorites(items);
        },
        (error) => {
          console.error('Favorites subscription error:', error);
        }
      );
      return () => unsub();
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  // Check URL query parameters on initial mount (e.g. ?resourceId=xyz)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resourceIdParam = params.get('resourceId');
    if (resourceIdParam && resources.length > 0) {
      const found = resources.find((r) => r.id === resourceIdParam);
      if (found) {
        setDetailResource(found);
      }
    }
  }, [resources]);

  // Favorite map lookup
  const favoriteMap = useMemo(() => {
    const map = new Set<string>();
    favorites.forEach((fav) => map.add(fav.resourceId));
    return map;
  }, [favorites]);

  // Handle Favorite toggle
  const handleToggleFavorite = async (resource: ResourceItem) => {
    if (!currentUser) {
      setAuthInitialView('login');
      setAuthModalOpen(true);
      showInfo('กรุณาเข้าสู่ระบบก่อนทำการบันทึกรายการโปรด');
      return;
    }

    const isFav = favoriteMap.has(resource.id);
    try {
      const nowFav = await toggleFavorite(currentUser.uid, resource, isFav);
      if (nowFav) {
        showSuccess('บันทึกในรายการโปรดแล้ว', `"${resource.title}" ถูกเก็บในรายการโปรดของคุณ`);
      } else {
        showInfo('นำออกจากรายการโปรดแล้ว');
      }
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถบันทึกรายการโปรดได้');
    }
  };

  // Seed sample data if database is empty
  const handleSeedSampleData = async () => {
    if (!currentUser) {
      setAuthInitialView('login');
      setAuthModalOpen(true);
      showInfo('กรุณาเข้าสู่ระบบก่อนเพิ่มสื่อเริ่มต้น');
      return;
    }

    try {
      setIsSeeding(true);
      for (const item of INITIAL_STARTER_RESOURCES) {
        await createResource({
          ...item,
          authorId: currentUser.uid,
          authorName: userProfile?.displayName || currentUser.displayName || 'ผู้แบ่งปันความรู้',
          authorEmail: currentUser.email || '',
        });
      }
      showSuccess('เพิ่มสื่อการเรียนรู้ตัวอย่างสำเร็จ!', 'ระบบได้เพิ่มสื่อคุณภาพ 4 รายการลงในฐานข้อมูล Firestore แล้ว');
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถเพิ่มข้อมูลตัวอย่างได้');
    } finally {
      setIsSeeding(false);
    }
  };

  // Confirm delete resource
  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    try {
      await deleteResource(resourceToDelete.id);
      showSuccess('ลบสื่อการเรียนรู้เรียบร้อยแล้ว');
      if (detailResource?.id === resourceToDelete.id) {
        setDetailResource(null);
      }
      setResourceToDelete(null);
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถลบสื่อได้');
    }
  };

  // Filtered resources list
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // If hidden, only visible to moderators/admins or the author
      if (res.isHidden) {
        const canSeeHidden = isModerator || isAdmin || res.authorId === currentUser?.uid;
        if (!canSeeHidden) return false;
      }

      // My resources view filter
      if (currentView === 'my-resources') {
        if (res.authorId !== currentUser?.uid) return false;
      }

      // Favorites view filter
      if (currentView === 'favorites') {
        if (!favoriteMap.has(res.id)) return false;
      }

      // Category filter
      if (selectedCategory !== 'ทั้งหมด' && res.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'ทั้งหมด' && res.level !== selectedLevel) {
        return false;
      }

      // Media type filter
      if (selectedMediaType !== 'ทั้งหมด' && res.mediaType !== selectedMediaType) {
        return false;
      }

      // Search query filter (title, description, author, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (res.title || '').toLowerCase().includes(q);
        const inDesc = (res.description || '').toLowerCase().includes(q);
        const inAuthor = (res.authorName || '').toLowerCase().includes(q);
        const inCat = (res.category || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inAuthor && !inCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [
    resources,
    currentView,
    currentUser,
    favoriteMap,
    selectedCategory,
    selectedLevel,
    selectedMediaType,
    searchQuery,
    sortBy,
    isModerator,
    isAdmin,
  ]);

  // Breadcrumbs items calculation
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const list: BreadcrumbItem[] = [
      { label: 'หน้าแรก', onClick: () => setCurrentView('home') },
    ];
    if (currentView === 'explore') {
      list.push({ label: 'สำรวจคลังความรู้', active: selectedCategory === 'ทั้งหมด' });
      if (selectedCategory !== 'ทั้งหมด') {
        list.push({ label: selectedCategory, active: true });
      }
    } else if (currentView === 'favorites') {
      list.push({ label: 'รายการโปรดของฉัน', active: true });
    } else if (currentView === 'my-resources') {
      list.push({ label: 'สื่อการเรียนรู้ของฉัน', active: true });
    } else if (currentView === 'admin') {
      list.push({ label: 'ศูนย์ควบคุมและดูแลระบบ (Admin)', active: true });
    }
    return list;
  }, [currentView, selectedCategory]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ทั้งหมด');
    setSelectedLevel('ทั้งหมด');
    setSelectedMediaType('ทั้งหมด');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Prompt',sans-serif]">
      {/* Global Announcement Banner */}
      {siteConfig.announcement && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-xs flex items-center justify-center gap-2">
          <span>{siteConfig.announcement}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        siteConfig={siteConfig}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'explore' || view === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAuth={handleOpenAuth}
        onOpenCreate={() => {
          setResourceToEdit(null);
          setFormModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* App Content */}
      <main className="flex-1">
        {/* Render Admin Dashboard View */}
        {currentView === 'admin' && isModerator ? (
          <AdminDashboard
            resources={resources}
            siteConfig={siteConfig}
            onBack={() => setCurrentView('home')}
            onOpenResource={(res) => setDetailResource(res)}
          />
        ) : (
          <div>
            {/* View Breadcrumb (Except on Home view hero) */}
            {currentView !== 'home' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}

            {/* HOME VIEW HERO */}
            {currentView === 'home' && (
              <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
                {/* Decorative background glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>แพลตฟอร์มแบ่งปันความรู้เพื่อการศึกษาไทย</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                    ค้นพบและแบ่งปัน <br />
                    <span className="bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
                      สื่อการเรียนรู้คุณภาพ
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    แหล่งรวบรวมบทเรียน เอกสารสรุป แบบฝึกหัด วิดีโอ และคลังความรู้สำหรับนักเรียน นิสิต นักศึกษา
                    และคุณครู เชื่อมต่อฐานข้อมูลจริงครบวงจร
                  </p>

                  {/* Large Hero Search Bar */}
                  <div className="max-w-2xl mx-auto pt-2">
                    <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20">
                      <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentView('explore');
                          }
                        }}
                        placeholder="ค้นหาชื่อวิชา เช่น ฟิสิกส์, สรุปคณิต, ภาษาอังกฤษ, เขียนโค้ด Python..."
                        className="w-full px-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-hidden bg-transparent"
                      />
                      <button
                        onClick={() => setCurrentView('explore')}
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-md"
                      >
                        <span>ค้นหา</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Popular Category Chips */}
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">หมวดหมู่ยอดนิยม:</span>
                    {(siteConfig.categories || []).slice(0, 5).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentView('explore');
                        }}
                        className="px-3 py-1 rounded-xl text-xs bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors backdrop-blur-xs"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Stats Counter Bar */}
                  <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xs">
                      <p className="text-xl sm:text-2xl font-bold text-white">{resources.length}</p>
                      <p className="text-[11px] text-slate-400">สื่อความรู้ในระบบ</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xs">
                      <p className="text-xl sm:text-2xl font-bold text-sky-400">
                        {siteConfig.categories?.length || 0}
                      </p>
                      <p className="text-[11px] text-slate-400">หมวดหมู่วิชา</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xs">
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                        {resources.reduce((sum, r) => sum + (r.viewCount || 0), 0)}
                      </p>
                      <p className="text-[11px] text-slate-400">ครั้งที่มีการเข้าศึกษา</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xs">
                      <p className="text-xl sm:text-2xl font-bold text-amber-400">
                        {resources.reduce((sum, r) => sum + (r.likesCount || 0), 0)}
                      </p>
                      <p className="text-[11px] text-slate-400">รายการบันทึกโปรด</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Header Title for Current View */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    {currentView === 'home' && (
                      <>
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <span>สื่อการเรียนรู้แนะนำล่าสุด</span>
                      </>
                    )}
                    {currentView === 'explore' && (
                      <>
                        <Compass className="w-6 h-6 text-blue-600" />
                        <span>คลังความรู้และการค้นคว้า</span>
                      </>
                    )}
                    {currentView === 'favorites' && (
                      <>
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        <span>รายการโปรดของคุณ ({favorites.length})</span>
                      </>
                    )}
                    {currentView === 'my-resources' && (
                      <>
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <span>สื่อการเรียนรู้ที่คุณแบ่งปัน</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentView === 'home' && 'สำรวจสื่อการเรียนรู้ที่เพื่อนๆ และคุณครูนำมาแบ่งปันเพื่อการเรียนรู้'}
                    {currentView === 'explore' && 'กรองตามระดับชั้น หมวดหมู่วิชา และประเภทสื่อที่คุณต้องการ'}
                    {currentView === 'favorites' && 'สื่อและบทเรียนที่คุณบันทึกไว้เพื่อกลับมาทบทวนได้ทุกที่ทุกเวลา'}
                    {currentView === 'my-resources' && 'จัดการสื่อที่คุณเคยโพสต์ สามารถแก้ไขข้อมูล หรือลบสื่อได้ที่นี่'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!currentUser) handleOpenAuth('login');
                      else {
                        setResourceToEdit(null);
                        setFormModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>แบ่งปันสื่อใหม่</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS (Always available on explore & home) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                {/* Search query input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="พิมพ์คำค้นหา เช่น ฟิสิกส์ ม.ปลาย, ตะลุยโจทย์, เอกสารสรุป หรือชื่อผู้โพสต์..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Selectors Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      หมวดหมู่วิชา
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-hidden"
                    >
                      <option value="ทั้งหมด">ทั้งหมดทุกหมวดหมู่</option>
                      {(siteConfig.categories || []).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ระดับชั้น
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-hidden"
                    >
                      <option value="ทั้งหมด">ทุกระดับชั้น</option>
                      <option value="ประถมศึกษา">ประถมศึกษา</option>
                      <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
                      <option value="มัธยมศึกษาตอนปลาย">มัธยมศึกษาตอนปลาย</option>
                      <option value="อาชีวศึกษา (ปวช./ปวส.)">อาชีวศึกษา (ปวช./ปวส.)</option>
                      <option value="อุดมศึกษา / มหาวิทยาลัย">อุดมศึกษา / มหาวิทยาลัย</option>
                      <option value="ประชาชนทั่วไป">ประชาชนทั่วไป</option>
                    </select>
                  </div>

                  {/* Media Type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ประเภทสื่อ
                    </label>
                    <select
                      value={selectedMediaType}
                      onChange={(e) => setSelectedMediaType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-hidden"
                    >
                      <option value="ทั้งหมด">ทุกประเภทสื่อ</option>
                      <option value="เอกสาร / PDF">เอกสาร / PDF</option>
                      <option value="วิดีโอ (YouTube/Vimeo)">วิดีโอ (YouTube/Vimeo)</option>
                      <option value="เว็บไซต์ / บทความ">เว็บไซต์ / บทความ</option>
                      <option value="สื่อนำเสนอ (Slides)">สื่อนำเสนอ (Slides)</option>
                      <option value="แบบฝึกหัด / ข้อสอบ">แบบฝึกหัด / ข้อสอบ</option>
                      <option value="คอร์สเรียน / แหล่งเรียนรู้อื่นๆ">คอร์สเรียน / อื่นๆ</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      เรียงลำดับตาม
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 outline-hidden"
                    >
                      <option value="newest">เผยแพร่ล่าสุด</option>
                      <option value="views">ยอดเปิดดูสูงสุด</option>
                      <option value="likes">ชื่นชอบมากที่สุด</option>
                    </select>
                  </div>
                </div>

                {/* Filter info and reset button */}
                {(selectedCategory !== 'ทั้งหมด' ||
                  selectedLevel !== 'ทั้งหมด' ||
                  selectedMediaType !== 'ทั้งหมด' ||
                  searchQuery) && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      พบ <strong>{filteredResources.length}</strong> รายการตามเงื่อนไข
                    </span>
                    <button
                      onClick={handleResetFilters}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                )}
              </div>

              {/* RESOURCE GRID / LOADING / EMPTY STATES */}
              {loadingResources ? (
                /* Skeleton Loading State */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
                    >
                      <div className="flex gap-2">
                        <div className="w-20 h-5 bg-slate-200 rounded-md" />
                        <div className="w-16 h-5 bg-slate-100 rounded-md" />
                      </div>
                      <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-slate-100 rounded" />
                        <div className="w-5/6 h-3 bg-slate-100 rounded" />
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between">
                        <div className="w-24 h-4 bg-slate-200 rounded" />
                        <div className="w-16 h-6 bg-slate-200 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredResources.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {resources.length === 0
                        ? 'ยังไม่มีสื่อการเรียนรู้ในระบบ'
                        : 'ไม่พบสื่อที่ตรงกับเงื่อนไขการค้นหา'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      {resources.length === 0
                        ? 'คุณสามารถเป็นคนแรกที่ร่วมแบ่งปันความรู้ สื่อการสอน หรือเริ่มต้นด้วยการนำเข้าชุดสื่อตัวอย่าง'
                        : 'ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูสื่อการเรียนรู้ทั้งหมด'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {resources.length === 0 ? (
                      <button
                        onClick={handleSeedSampleData}
                        disabled={isSeeding}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
                      >
                        {isSeeding ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังนำเข้าข้อมูล...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> นำเข้าสื่อตัวอย่างคุณภาพ (4 รายการ)
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        ล้างตัวกรองทั้งหมด
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (!currentUser) handleOpenAuth('login');
                        else {
                          setResourceToEdit(null);
                          setFormModalOpen(true);
                        }
                      }}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      + แบ่งปันสื่อใหม่
                    </button>
                  </div>
                </div>
              ) : (
                /* Resource Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      isFavorited={favoriteMap.has(res.id)}
                      onOpenDetail={(r) => setDetailResource(r)}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(r) => {
                        setResourceToEdit(r);
                        setFormModalOpen(true);
                      }}
                      onDelete={(r) => setResourceToDelete(r)}
                      onReport={(r) => setReportResource(r)}
                    />
                  ))}
                </div>
              )}

              {/* HOME VIEW: Category Highlights Grid */}
              {currentView === 'home' && (
                <div className="pt-10 border-t border-slate-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">สำรวจตามหมวดหมู่วิชา</h3>
                      <p className="text-xs text-slate-500">เลือกดูสื่อการเรียนรู้ตามสาขาวิชาที่คุณสนใจ</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('explore')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(siteConfig.categories || []).map((cat) => {
                      const count = resources.filter((r) => r.category === cat).length;
                      return (
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCurrentView('explore');
                          }}
                          className="p-4 bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-2xl cursor-pointer transition-all duration-200 group flex items-start justify-between"
                        >
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 line-clamp-1">
                              {cat}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1">{count} สื่อการเรียนรู้</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HOME VIEW: Why KlangPanya Community */}
              {currentView === 'home' && (
                <div className="pt-8 border-t border-slate-200">
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="max-w-2xl space-y-4 relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        ร่วมเป็นส่วนหนึ่งของเครือข่ายแบ่งปันความรู้
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                        ไม่ว่าคุณจะเป็นครูผู้สอนที่มีสื่อการสอนดีๆ หรือเป็นนักเรียนที่ทำสรุปบทเรียน
                        คุณสามารถอัปโหลดไฟล์ แนบลิงก์คลิป หรือคอร์สเรียน เพื่อส่งต่อความรู้ให้เพื่อนๆ ทั่วประเทศ
                      </p>
                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            if (!currentUser) handleOpenAuth('register');
                            else setFormModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-colors"
                        >
                          {currentUser ? '+ โพสต์สื่อการเรียนรู้' : 'สมัครสมาชิกฟรี'}
                        </button>
                        <button
                          onClick={() => setCurrentView('explore')}
                          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-colors"
                        >
                          สำรวจคลังความรู้
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Main Footer */}
      <Footer
        siteConfig={siteConfig}
        onNavigateCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('explore');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialView={authInitialView}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 2. Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* 3. Resource Form Modal (Create / Edit) */}
      <ResourceFormModal
        isOpen={formModalOpen}
        categories={siteConfig.categories || []}
        resourceToEdit={resourceToEdit}
        onClose={() => {
          setFormModalOpen(false);
          setResourceToEdit(null);
        }}
        onSuccess={() => {
          setFormModalOpen(false);
          setResourceToEdit(null);
        }}
      />

      {/* 4. Resource Detail Modal */}
      <ResourceDetailModal
        isOpen={!!detailResource}
        resource={detailResource}
        isFavorited={detailResource ? favoriteMap.has(detailResource.id) : false}
        onClose={() => setDetailResource(null)}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(res) => {
          setDetailResource(null);
          setResourceToEdit(res);
          setFormModalOpen(true);
        }}
        onDelete={(res) => {
          setResourceToDelete(res);
        }}
        onReport={(res) => {
          setReportResource(res);
        }}
      />

      {/* 5. Report Issue Modal */}
      <ReportModal
        isOpen={!!reportResource}
        resource={reportResource}
        onClose={() => setReportResource(null)}
      />

      {/* 6. Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!resourceToDelete}
        title="ยืนยันการลบสื่อการเรียนรู้"
        message={`คุณต้องการลบ "${resourceToDelete?.title}" ออกจากคลังความรู้หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้`}
        confirmLabel="ยืนยันการลบ"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setResourceToDelete(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
