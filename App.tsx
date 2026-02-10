
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, AppState, Session } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeManager from './components/TradeManager';
import SessionLog from './components/SessionLog';
import Landing from './components/Landing';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('tradeflow_state');
    if (saved) return JSON.parse(saved);
    return {
      view: AppView.LANDING,
      user: null,
      sessions: [],
      activeSession: null
    };
  });

  useEffect(() => {
    localStorage.setItem('tradeflow_state', JSON.stringify(state));
  }, [state]);

  const setView = useCallback((view: AppView) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const login = useCallback((email: string) => {
    setState(prev => ({
      ...prev,
      view: AppView.DASHBOARD,
      user: { name: 'John Doe', role: 'PRO TRADER' }
    }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, user: null, view: AppView.LANDING }));
  }, []);

  const updateActiveSession = useCallback((session: Session | null) => {
    setState(prev => ({ ...prev, activeSession: session }));
  }, []);

  const saveSession = useCallback((session: Session) => {
    setState(prev => {
      // Avoid duplicates by ID if auto-log and manual log are both triggered
      const exists = prev.sessions.find(s => s.id === session.id);
      if (exists) {
        return {
          ...prev,
          sessions: prev.sessions.map(s => s.id === session.id ? session : s),
          activeSession: null,
          view: AppView.SESSION_LOG
        };
      }
      return {
        ...prev,
        sessions: [session, ...prev.sessions],
        activeSession: null,
        view: AppView.SESSION_LOG
      };
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
     setState(prev => ({
       ...prev,
       sessions: prev.sessions.filter(s => s.id !== id)
     }));
  }, []);

  const clearAllSessions = useCallback(() => {
    setState(prev => ({ ...prev, sessions: [] }));
  }, []);

  const renderContent = () => {
    if (!state.user && state.view === AppView.LANDING) return <Landing onStart={() => setView(AppView.SIGNUP)} onLogin={() => setView(AppView.LOGIN)} />;
    if (!state.user && state.view === AppView.LOGIN) return <Auth mode="login" onAuth={login} onSwitch={() => setView(AppView.SIGNUP)} />;
    if (!state.user && state.view === AppView.SIGNUP) return <Auth mode="signup" onAuth={login} onSwitch={() => setView(AppView.LOGIN)} />;

    switch (state.view) {
      case AppView.DASHBOARD:
        return <Dashboard sessions={state.sessions} />;
      case AppView.TRADEMANAGER:
        return (
          <TradeManager 
            activeSession={state.activeSession} 
            sessions={state.sessions}
            onUpdateSession={updateActiveSession}
            onSaveSession={saveSession}
          />
        );
      case AppView.SESSION_LOG:
        return (
          <SessionLog 
            sessions={state.sessions} 
            onDelete={deleteSession} 
            onClearAll={clearAllSessions}
          />
        );
      case AppView.SETTINGS:
        return (
          <div className="p-8 text-center text-slate-500">
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="mt-4">User profile and system configurations.</p>
          </div>
        );
      default:
        return <Dashboard sessions={state.sessions} />;
    }
  };

  if (!state.user && [AppView.LANDING, AppView.LOGIN, AppView.SIGNUP].includes(state.view)) {
    return renderContent();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentView={state.view} 
        onNavigate={setView} 
        user={state.user} 
        onLogout={logout}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background-main">
        <Header viewName={state.view} />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
