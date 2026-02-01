import React from 'react';
import { Calendar } from 'lucide-react';
import { Translation } from '../types';

interface FooterProps {
  texts: Translation;
  onClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ texts, onClick }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-center">
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full shadow-lg shadow-brand-500/30 transition-all active:scale-95"
          aria-label={texts.calendar}
        >
          <Calendar size={20} />
          <span>{texts.calendar}</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;

