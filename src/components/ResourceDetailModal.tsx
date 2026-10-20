import React, { useEffect, useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Flag,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Edit,
  Trash2,
  FileText,
  Video,
  Check,
} from 'lucide-react';
import { ResourceItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { incrementViewCount } from '../services/resourceService';

interface ResourceDetailModalProps {
  isOpen: boolean;
  resource: ResourceItem | null;
  isFavorited: boolean;
  onClose: () => void;
  onToggleFavorite: (resource: ResourceItem) => void;
  onEdit?: (resource: ResourceItem) => void;
  onDelete?: (resource: ResourceItem) => void;
  onReport?: (resource: ResourceItem) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  isOpen,
  resource,
  isFavorited,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { currentUser, isAdmin, isModerator } = useAuth();
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      incrementViewCount(resource.id);
    }
  }, [isOpen, resource?.id]);

  if (!isOpen || !resource) return null;

  const isAuthor = currentUser?.uid === resource.authorId;
  const canManage = isAuthor || isModerator || isAdmin;

  // Extract YouTube ID if valid
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '?resourceId=' + resource.id);
    setCopied(true);
    showSuccess('คัดลอกลิงก์สื่อแล้ว', 'คุณสามารถส่งต่อเพื่อแบ่งปันให้เพื่อนหรือนักเรียนได้ทันที');
    setTimeout(() => setCopied(false), 2500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700">
                {resource.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200/70 text-slate-700 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {resource.level}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700">
                {resource.mediaType}
              </span>
              {resource.isHidden && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700">
                  ซ่อนโดยผู้ดูแล
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              {resource.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* YouTube Embed Player if applicable */}
          {embedUrl && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-black">
              <iframe
                src={embedUrl}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              รายละเอียดและเนื้อหา
            </h3>
            <div className="text-sm md:text-base text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              {resource.description}
            </div>
          </div>

          {/* Attachments / External Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              แหล่งข้อมูลและไฟล์แนบ
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-900">เปิดลิงก์สื่อภายนอก</p>
                      <p className="text-[11px] text-blue-700 truncate max-w-[200px] sm:max-w-xs">{resource.url}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              )}

              {resource.fileAttachmentUrl && (
                <a
                  href={resource.fileAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={resource.fileName || 'learning-resource'}
                  className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-900">ดาวน์โหลดเอกสาร / สื่อ</p>
                      <p className="text-[11px] text-emerald-700 truncate max-w-[200px] sm:max-w-xs">
                        {resource.fileName || 'ไฟล์แนบจากระบบ'}
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Author & Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                {resource.authorName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{resource.authorName}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> เผยแพร่เมื่อ {formatDate(resource.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                {resource.viewCount} ครั้ง
              </span>
              <span className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                {resource.likesCount} ชื่นชอบ
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 md:px-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                isFavorited
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isFavorited ? 'บันทึกแล้ว' : 'บันทึกในรายการโปรด'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'แชร์'}</span>
            </button>

            {onReport && currentUser && !isAuthor && (
              <button
                onClick={() => onReport(resource)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                title="รายงานสื่อนี้"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>รายงาน</span>
              </button>
            )}
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>แก้ไขสื่อ</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(resource)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบสื่อ</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
