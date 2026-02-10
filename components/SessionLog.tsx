
import React from 'react';
import { Session } from '../types';

interface SessionLogProps {
  sessions: Session[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const SessionLog: React.FC<SessionLogProps> = ({ sessions, onDelete, onClearAll }) => {
  const totalPnL = sessions.reduce((sum, s) => sum + (s.finalBalance - s.initialCapital), 0);
  const totalWins = sessions.reduce((sum, s) => sum + s.totalWin, 0);
  const totalLoss = sessions.reduce((sum, s) => sum + s.totalLoss, 0);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <button onClick={onClearAll} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-4 py-2 rounded-lg border border-border-ui">CLEAR ALL</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-bg border border-border-ui p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Total P&L</span>
            <span className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-danger'}`}>
              {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString()}
            </span>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
        </div>
        <div className="bg-card-bg border border-border-ui p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Win Percentage</span>
            <span className="text-3xl font-bold text-white">
              {totalWins + totalLoss > 0 ? ((totalWins / (totalWins + totalLoss)) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
        <div className="bg-card-bg border border-border-ui p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Win / Loss</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{totalWins}</span>
              <span className="text-xl font-bold text-slate-600">/</span>
              <span className="text-3xl font-bold text-danger">{totalLoss}</span>
            </div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg border border-border-ui">
            <span className="material-symbols-outlined text-slate-400">compare_arrows</span>
          </div>
        </div>
        <div className="bg-card-bg border border-border-ui p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Total Sessions</span>
            <span className="text-3xl font-bold text-white">{sessions.length}</span>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg border border-border-ui">
            <span className="material-symbols-outlined text-slate-400">history</span>
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-border-ui rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-800/50 border-b border-border-ui">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-r border-border-ui w-12">Ses.</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-border-ui">Date</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-border-ui">Initial Cap.</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-border-ui">Ending Bal.</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-border-ui">Result</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-ui">
              {sessions.map((session, i) => {
                const profit = session.finalBalance - session.initialCapital;
                return (
                  <tr key={session.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-3 text-center text-xs font-bold text-slate-400 border-r border-border-ui">{sessions.length - i}</td>
                    <td className="p-3 text-xs text-slate-300 border-r border-border-ui">{session.date}</td>
                    <td className="p-3 text-xs font-medium text-slate-300 border-r border-border-ui">${session.initialCapital.toLocaleString()}</td>
                    <td className="p-3 text-xs font-bold text-white border-r border-border-ui">${session.finalBalance.toLocaleString()}</td>
                    <td className={`p-3 text-xs font-bold border-r border-border-ui ${profit >= 0 ? 'text-primary' : 'text-danger'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => onDelete(session.id)}
                        className="p-1.5 text-slate-600 hover:text-danger transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-600 text-xs font-bold uppercase">No sessions logged yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionLog;
