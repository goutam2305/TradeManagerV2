
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  viewName: string;
}

const Header: React.FC<HeaderProps> = ({ viewName }) => {
  return (
    <header className="h-16 border-b border-border-ui flex items-center justify-between px-8 bg-background-main/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {viewName.replace('_', ' ')}
        </h2>
        <div className="h-4 w-px bg-border-ui"></div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live tracking</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-card-bg border border-border-ui rounded-lg px-3 py-1.5">
          <span className="text-[10px] font-bold text-slate-500">UNITS:</span>
          <select className="bg-transparent border-none text-[10px] font-bold text-primary focus:ring-0 p-0 cursor-pointer appearance-none">
            <option value="usd">USD ($)</option>
            <option value="percent">PERCENT (%)</option>
          </select>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-slate-900 text-[10px] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm font-bold">download</span> EXPORT
        </button>
      </div>
    </header>
  );
};

export default Header;
