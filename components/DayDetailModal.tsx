import React, { useState } from 'react';
import { X, Calendar, Flame, TrendingUp } from 'lucide-react';
import { Translation, HistoryItem } from '../types';
import HistoryCard from './HistoryCard';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  history: HistoryItem[];
  texts: Translation;
  lang: 'en' | 'pt';
  onItemClick: (item: HistoryItem) => void;
}

type ViewMode = 'day' | 'week' | 'month';

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  water: number; // Placeholder for water tracking
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  history, 
  texts, 
  lang,
  onItemClick 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  if (!isOpen || !date) return null;

  // Helper functions to get date ranges
  const getWeekStart = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const getWeekEnd = (d: Date): Date => {
    const weekStart = getWeekStart(new Date(d));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // End of day
    return weekEnd;
  };

  const getMonthStart = (d: Date): Date => {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getMonthEnd = (d: Date): Date => {
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  // Filter history based on view mode
  let filteredHistory: HistoryItem[] = [];
  let dateRange: string = '';

  if (viewMode === 'day') {
    const dateString = date.toDateString();
    filteredHistory = history.filter(
      item => new Date(item.timestamp).toDateString() === dateString
    );
    dateRange = date.toLocaleDateString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
  } else if (viewMode === 'week') {
    const weekStart = getWeekStart(new Date(date));
    const weekEnd = getWeekEnd(new Date(date));
    filteredHistory = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
    dateRange = `${weekStart.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else if (viewMode === 'month') {
    const monthStart = getMonthStart(new Date(date));
    const monthEnd = getMonthEnd(new Date(date));
    filteredHistory = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= monthStart && itemDate <= monthEnd;
    });
    dateRange = date.toLocaleDateString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { month: 'long', year: 'numeric' }
    );
  }

  // Calculate totals
  const totals: DayTotals = filteredHistory.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
      sugar: acc.sugar + item.sugar,
      water: acc.water + 0, // Placeholder - can be extended later
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, water: 0 }
  );

  return (
    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-brand-500" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {texts.dayDetails}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{dateRange}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                viewMode === 'day'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {texts.day}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {texts.week}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                viewMode === 'month'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {texts.month}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Totals Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-brand-500" />
              <h4 className="font-bold text-slate-800 dark:text-white">{texts.dailyTotals}</h4>
            </div>

            {/* Calories */}
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/30 rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-brand-600 dark:text-brand-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{texts.calories}</span>
                </div>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {totals.calories.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  {texts.protein}
                </span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {totals.protein.toFixed(1)}g
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  {texts.carbs}
                </span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {totals.carbs.toFixed(1)}g
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  {texts.fat}
                </span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {totals.fat.toFixed(1)}g
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  {texts.sugar}
                </span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {totals.sugar.toFixed(1)}g
                </p>
              </div>
            </div>

            {/* Fiber */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                {texts.fiber}
              </span>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {totals.fiber.toFixed(1)}g
              </p>
            </div>
          </div>

          {/* History Items */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">
              {texts.foodItems} ({filteredHistory.length})
            </h4>
            {filteredHistory.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredHistory.map(item => (
                  <HistoryCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    onClick={() => {
                      onItemClick(item);
                      onClose();
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                <p>{texts.noDataForDay}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;

