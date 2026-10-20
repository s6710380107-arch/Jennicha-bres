import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs md:text-sm text-slate-500 py-3" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
        <li className="inline-flex items-center">
          <button
            onClick={() => items[0]?.onClick?.()}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าแรก</span>
          </button>
        </li>
        {items.slice(1).map((item, index) => (
          <li key={index} className="inline-flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
            {item.active || !item.onClick ? (
              <span className="font-semibold text-blue-600 max-w-[200px] truncate">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="font-medium text-slate-600 hover:text-blue-600 transition-colors max-w-[160px] truncate"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
