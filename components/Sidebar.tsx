
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: 'grid_view' },
    { view: AppView.TRADEMANAGER, label: 'Trademanager', icon: 'manage_accounts' },
    { view: AppView.SESSION_LOG, label: 'Session Log', icon: 'history' },
    { view: AppView.SETTINGS, label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-background-main border-r border-border-ui flex flex-col hidden lg:flex shrink-0">
      <div className="p-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">insights</span>
        <h1 className="text-xl font-bold tracking-tight text-white uppercase">Trade<span className="text-primary">Flow</span></h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.view
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {user && (
        <div className="p-6 border-t border-border-ui">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-border-ui flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-left text-[10px] font-bold text-slate-500 hover:text-danger uppercase tracking-widest flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
