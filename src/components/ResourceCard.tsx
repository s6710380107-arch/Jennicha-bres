import React from 'react';
import {
  FileText,
  Video,
  Globe,
  Presentation,
  BookOpen,
  Heart,
  Eye,
  ExternalLink,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  Download,
  GraduationCap,
} from 'lucide-react';
import { ResourceItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface ResourceCardProps {
  resource: ResourceItem;
  isFavorited: boolean;
  onOpenDetail: (resource: ResourceItem) => void;
  onToggleFavorite: (resource: ResourceItem) => void;
  onEdit?: (resource: ResourceItem) => void;
  onDelete?: (resource: ResourceItem) => void;
  onReport?: (resource: ResourceItem) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isFavorited,
  onOpenDetail,
  onToggleFavorite,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { currentUser, isAdmin, isModerator } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isAuthor = currentUser?.uid === resource.authorId;
  const canManage = isAuthor || isModerator || isAdmin;

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'วิดีโอ (YouTube/Vimeo)':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'เว็บไซต์ / บทความ':
        return <Globe className="w-4 h-4 text-emerald-500" />;
      case 'สื่อนำเสนอ (Slides)':
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case 'เอกสาร / PDF':
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Banner Status */}
      {resource.isHidden && (
        <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 text-center">
          สื่อนี้ถูกซ่อนโดยผู้ดูแลระบบ
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100/80">
              {resource.category}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-slate-400" />
              {resource.level}
            </span>
          </div>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 text-xs font-medium animate-in fade-in"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {canManage && onEdit && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(resource);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" /> แก้ไขสื่อ
                  </button>
                )}
                {canManage && onDelete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(resource);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> ลบสื่อ
                  </button>
                )}
                {currentUser && !isAuthor && onReport && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onReport(resource);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-500" /> รายงานปัญหา
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetail(resource)}
          className="font-bold text-base text-slate-800 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {resource.title}
        </h3>

        {/* Excerpt Description */}
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>

        {/* Media indicator pill */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-600">
          <div className="p-1 rounded-md bg-slate-100 shrink-0">
            {getMediaIcon(resource.mediaType)}
          </div>
          <span className="font-medium truncate">{resource.mediaType}</span>
          {resource.fileName && (
            <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
              📎 {resource.fileName}
            </span>
          )}
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">
            {resource.authorName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-700 truncate text-[11px]">{resource.authorName}</p>
            <p className="text-[10px] text-slate-400">{formatDate(resource.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Eye className="w-3.5 h-3.5" /> {resource.viewCount}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Heart className={`w-3.5 h-3.5 ${resource.likesCount > 0 ? 'text-red-400 fill-red-400' : ''}`} />{' '}
            {resource.likesCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(resource)}
            className={`p-2 rounded-xl transition-all ${
              isFavorited
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
            }`}
            title={isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* View Details */}
          <button
            onClick={() => onOpenDetail(resource)}
            className="px-3 py-1.5 rounded-xl font-semibold text-xs bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 transition-all shadow-2xs"
          >
            ดูเนื้อหา
          </button>
        </div>
      </div>
    </div>
  );
};
