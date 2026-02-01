
import React from 'react';
import { HistoryItem, Language } from '../types';
import { Clock, Flame, Trash2 } from 'lucide-react';

interface HistoryCardProps {
  item: HistoryItem;
  lang: Language;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, lang, onClick, onDelete }) => {
  const date = new Date(item.timestamp).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item.id);
    }
  };

  // Logic to determine which text to show
  // If we have the specific language string, use it. Otherwise fall back to the generic one.
  const displayName = lang === 'pt' 
    ? (item.foodNamePt || item.foodName) 
    : (item.foodNameEn || item.foodName);

  const displayDescription = lang === 'pt'
    ? (item.descriptionPt || item.description)
    : (item.descriptionEn || item.description);

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
    >
      <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
        <Flame size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-1">{displayName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{displayDescription}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="block font-bold text-brand-600 dark:text-brand-400">{item.calories}</span>
        <div className="flex items-center justify-end text-xs text-slate-400 gap-1">
          <Clock size={10} />
          <span>{date}</span>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={handleDelete}
          className="p-2 -mr-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
          aria-label="Delete"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

export default HistoryCard;