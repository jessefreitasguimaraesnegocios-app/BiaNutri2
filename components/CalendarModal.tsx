import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Translation, HistoryItem } from '../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  texts: Translation;
  lang: 'en' | 'pt';
  onDayClick: (date: Date) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, history, texts, lang, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterMode, setFilterMode] = useState<'all' | 'hasData' | 'noData'>('all');

  if (!isOpen) return null;

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Calculate calories for each day
  const getDayCalories = (day: number): number => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toDateString();
    
    return history
      .filter(item => new Date(item.timestamp).toDateString() === dateString)
      .reduce((sum, item) => sum + item.calories, 0);
  };

  // Check if day has data
  const hasData = (day: number): boolean => {
    return getDayCalories(day) > 0;
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get month name
  const monthNames = lang === 'pt' 
    ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = lang === 'pt'
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDayClick(date);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-brand-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{texts.calendar}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            {monthName} {year}
          </h4>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 overflow-y-auto">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const calories = getDayCalories(day);
              const hasDayData = hasData(day);
              const isToday = 
                day === new Date().getDate() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear();

              // Apply filter
              if (filterMode === 'hasData' && !hasDayData) {
                return (
                  <div
                    key={day}
                    className="aspect-square rounded-lg opacity-30 cursor-not-allowed"
                  />
                );
              }
              if (filterMode === 'noData' && hasDayData) {
                return (
                  <div
                    key={day}
                    className="aspect-square rounded-lg opacity-30 cursor-not-allowed"
                  />
                );
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg transition-all relative
                    ${hasDayData 
                      ? 'bg-brand-100 dark:bg-brand-900/30 hover:bg-brand-200 dark:hover:bg-brand-900/50 border-2 border-brand-500' 
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }
                    ${isToday ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                  `}
                >
                  <span className={`
                    text-sm font-semibold
                    ${hasDayData ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'}
                    ${isToday ? 'text-brand-600 dark:text-brand-400' : ''}
                  `}>
                    {day}
                  </span>
                  {hasDayData && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                        {calories}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setFilterMode(filterMode === 'hasData' ? 'all' : 'hasData')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'hasData'
                  ? 'bg-brand-100 dark:bg-brand-900/30 border-2 border-brand-500 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <div className="w-4 h-4 rounded bg-brand-100 dark:bg-brand-900/30 border-2 border-brand-500" />
              <span>{texts.hasData}</span>
            </button>
            <button
              onClick={() => setFilterMode(filterMode === 'noData' ? 'all' : 'noData')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'noData'
                  ? 'bg-slate-200 dark:bg-slate-700 border-2 border-slate-400 dark:border-slate-500 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <div className="w-4 h-4 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <span>{texts.noData}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;

