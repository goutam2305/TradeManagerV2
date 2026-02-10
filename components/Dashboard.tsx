
import React from 'react';
import { Session } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  sessions: Session[];
}

const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const netPnL = sessions.reduce((sum, s) => sum + (s.finalBalance - s.initialCapital), 0);
  const winRate = sessions.length > 0 
    ? (sessions.filter(s => s.finalBalance > s.initialCapital).length / sessions.length) * 100 
    : 0;

  // Mock data for equity curve if no sessions
  const chartData = sessions.length > 0 
    ? sessions.map((s, i) => ({ name: `S${i+1}`, balance: s.finalBalance }))
    : [
        { name: 'Start', balance: 500 },
        { name: 'S1', balance: 512 },
        { name: 'S2', balance: 508 },
        { name: 'S3', balance: 525 },
        { name: 'S4', balance: 515 },
        { name: 'S5', balance: 540 }
      ];

  const stats = [
    { label: 'Net P&L', value: `$${netPnL.toLocaleString()}`, trend: '+14.2%', icon: 'payments', color: 'primary' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, progress: winRate, icon: 'adjust', color: 'primary' },
    { label: 'Profit Factor', value: '2.84', sub: 'Gross Win / Gross Loss', icon: 'scale', color: 'primary' },
    { label: 'Avg Daily Return', value: '$412.10', trend: '-2.4%', icon: 'query_stats', color: 'danger' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card-bg border border-border-ui p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{stat.label}</span>
              <div className={`bg-${stat.color}/10 p-1.5 rounded-lg border border-${stat.color}/20`}>
                <span className={`material-symbols-outlined text-${stat.color} text-xl`}>{stat.icon}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              {stat.trend && (
                <span className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-primary' : 'text-danger'}`}>
                  <span className="material-symbols-outlined text-[12px] fill-1">{stat.trend.startsWith('+') ? 'trending_up' : 'trending_down'}</span>
                  {stat.trend} This Month
                </span>
              )}
              {stat.progress !== undefined && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${stat.progress}%` }}></div>
                </div>
              )}
              {stat.sub && (
                <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wide">{stat.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-card-bg border border-border-ui rounded-xl overflow-hidden shadow-lg flex flex-col h-[500px]">
          <div className="p-6 border-b border-border-ui flex justify-between items-center bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Equity Curve Growth</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-border-ui rounded-lg">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-[10px] font-bold text-slate-400">Balance</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-card-bg border border-border-ui rounded-xl overflow-hidden shadow-lg flex flex-col h-[500px]">
          <div className="p-6 border-b border-border-ui flex justify-between items-center bg-slate-800/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Trading Calendar</h3>
            <div className="relative">
              <select className="bg-slate-800 border border-border-ui text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg focus:ring-0 cursor-pointer appearance-none pr-8">
                <option value="8-2024">AUGUST 2024</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="p-8 flex flex-col h-full justify-between">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-wider">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-2 flex-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold ${
                  i === 15 ? 'bg-white text-slate-900 shadow-lg' : 
                  [4, 8, 12, 18].includes(i) ? 'bg-primary/20 text-primary border border-primary/20' :
                  [5, 13, 22].includes(i) ? 'bg-danger/20 text-danger border border-danger/20' :
                  'border border-border-ui text-slate-600'
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest px-1 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary/40 rounded-sm"></span>
                <span className="text-slate-400">WIN DAY</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-danger/40 rounded-sm"></span>
                <span className="text-slate-400">LOSS DAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
