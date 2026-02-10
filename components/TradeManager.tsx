import React, { useState, useMemo, useEffect } from 'react';
import { Session, Trade, SessionConfig } from '../types';
import { computeAnalytics } from '../analyticsEngine';

interface TradeManagerProps {
  activeSession: Session | null;
  sessions: Session[];
  onUpdateSession: (session: Session | null) => void;
  onSaveSession: (session: Session) => void;
}

const DEFAULT_CONFIG: SessionConfig = {
  initialCapital: 100.00,
  totalTrades: 5,
  winTradesGoal: 4,
  payoutPercent: 92,
  currency: 'USD ($)',
  stopLossPercent: 10,
  targetGainPercent: 0,
  profitTarget: 2,
  dailyGoalFormat: '%',
  stopLossAlert: 10,
  sessionEndAlert: true,
  lowTradeAlert: true,
  autoCopyBalance: true,
  autoLogSession: true,
  autoCountSession: true,
};

// Analytics Kernel is now imported from ../analyticsEngine.ts

const TradeManager: React.FC<TradeManagerProps> = ({ activeSession, sessions, onUpdateSession, onSaveSession }) => {
  const [config, setConfig] = useState<SessionConfig>(() => {
    const saved = localStorage.getItem('tradeflow_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [counter, setCounter] = useState(() => {
    const saved = localStorage.getItem('tradeflow_counter');
    return saved ? parseInt(saved) : 9;
  });

  useEffect(() => {
    localStorage.setItem('tradeflow_config', JSON.stringify(config));
    localStorage.setItem('tradeflow_counter', counter.toString());
  }, [config, counter]);

  // ---------------------------------------------------------------------------
  // 2️⃣ STRATEGY CALCULATIONS
  // Calculates stakes only. No simulated analytics/outcomes.
  // ---------------------------------------------------------------------------
  const { strategyBullets, maxLossLimit, minCapitalRequired, isCompounding } = useMemo(() => {
    const currentCap = activeSession?.initialCapital || config.initialCapital;
    const payout = config.payoutPercent / 100;
    const n = config.totalTrades;
    const w = Math.min(config.winTradesGoal, n > 0 ? n : 1);

    // Max Loss Limit (Lives)
    const maxLosses = Math.max(1, n - w + 1);
    const compounding = w > 1;

    let bullets: number[] = [];
    let calcMinCap = 0;

    // Strategy Logic to generate Bullets
    if (compounding) {
      // Geometric Split for Compounding
      const ratio = 1 + payout;
      const geometricSumFactor = (Math.pow(ratio, maxLosses) - 1) / payout;
      const lastBullet = currentCap / geometricSumFactor;

      for (let i = 0; i < maxLosses; i++) {
        bullets.push(lastBullet * Math.pow(ratio, maxLosses - 1 - i));
      }

      const firstBulletFactor = Math.pow(ratio, maxLosses - 1);
      calcMinCap = geometricSumFactor / firstBulletFactor;

    } else {
      // Martingale-ish for Recovery (Win 1)
      let accumulatedLossCoeff = 0;
      let totalInvestedCoeff = 0;
      const targetUnit = 1;
      let coeffs: number[] = [];

      for (let i = 0; i < maxLosses; i++) {
        const stakeCoeff = (targetUnit + accumulatedLossCoeff) / payout;
        coeffs.push(stakeCoeff);
        totalInvestedCoeff += stakeCoeff;
        accumulatedLossCoeff += stakeCoeff;
      }

      const profitUnit = currentCap / totalInvestedCoeff;
      bullets = coeffs.map(c => c * profitUnit);

      if (coeffs.length > 0) calcMinCap = totalInvestedCoeff / coeffs[0];
    }

    return {
      strategyBullets: bullets,
      maxLossLimit: maxLosses,
      minCapitalRequired: calcMinCap,
      isCompounding: compounding
    };
  }, [config.initialCapital, config.totalTrades, config.winTradesGoal, config.payoutPercent, activeSession]);


  // ---------------------------------------------------------------------------
  // 4️⃣ ACTUAL SESSION ANALYTICS
  // Derived strictly from active session rows
  // ---------------------------------------------------------------------------
  const currentStats = useMemo(() => {
    if (!activeSession) return computeAnalytics([]);
    return computeAnalytics(activeSession.trades);
  }, [activeSession]);


  // ---------------------------------------------------------------------------
  // TRADE EXECUTION
  // ---------------------------------------------------------------------------
  const calculateTradeAmount = (prevTrades: Trade[]) => {
    const losses = prevTrades.filter(t => t.pnl < 0).length;
    const wins = prevTrades.filter(t => t.pnl > 0).length;

    if (wins >= config.winTradesGoal) return 0;
    if (losses >= maxLossLimit) return 0;

    const bulletIndex = losses;
    if (bulletIndex >= strategyBullets.length) return 0;

    const baseStake = strategyBullets[bulletIndex];

    if (isCompounding) {
      let streak = 0;
      for (let i = prevTrades.length - 1; i >= 0; i--) {
        if (prevTrades[i].pnl > 0) streak++;
        else break;
      }
      if (streak > 0) {
        return parseFloat((baseStake * Math.pow(1 + config.payoutPercent / 100, streak)).toFixed(2));
      }
    }
    return parseFloat(baseStake.toFixed(2));
  };

  const handleStartSession = () => {
    let startCap = config.initialCapital;
    if (config.autoCopyBalance && sessions.length > 0) {
      startCap = sessions[0].finalBalance;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      initialCapital: startCap,
      config: { ...config, initialCapital: startCap },
      trades: [],
      isCompleted: false,
      finalBalance: startCap,
      totalWin: 0,
      totalLoss: 0,
      sessionCounter: counter
    };
    onUpdateSession(newSession);
  };

  const handleTradeResult = (tradeNo: number, result: 'W' | 'L') => {
    if (!activeSession || activeSession.isCompleted) return;

    const currentTrades = [...activeSession.trades];
    const tradeAmt = calculateTradeAmount(currentTrades);
    const pnl = result === 'W'
      ? parseFloat((tradeAmt * (config.payoutPercent / 100)).toFixed(2))
      : -tradeAmt;

    // Balance derived sequentially
    const prevBalance = currentTrades.length > 0
      ? currentTrades[currentTrades.length - 1].capital_after
      : activeSession.initialCapital;

    const newBalance = parseFloat((prevBalance + pnl).toFixed(2));

    const newTrade: Trade = {
      no: tradeNo,
      result,
      tradeAmt,
      pnl,
      capital_after: newBalance
    };

    const updatedTrades = [...currentTrades, newTrade];

    // Check completion using row counts from the analytics engine
    const analytics = computeAnalytics(updatedTrades);
    const isCompleted = analytics.winTrades >= config.winTradesGoal || analytics.lossTrades >= maxLossLimit || updatedTrades.length >= config.totalTrades;

    const updatedSession: Session = {
      ...activeSession,
      trades: updatedTrades,
      isCompleted,
      finalBalance: newBalance,
      totalWin: analytics.winTrades,
      totalLoss: analytics.lossTrades
    };

    if (isCompleted) {
      if (config.autoLogSession) onSaveSession(updatedSession);
      else onUpdateSession(updatedSession);
      if (config.autoCountSession) setCounter(prev => prev + 1);
    } else {
      onUpdateSession(updatedSession);
    }
  };

  const tradeRows = useMemo(() => {
    const rows: Trade[] = [];
    for (let i = 1; i <= 20; i++) {
      const existing = activeSession?.trades.find(t => t.no === i);
      if (existing) {
        rows.push(existing);
      } else {
        rows.push({ no: i, result: null, tradeAmt: 0, pnl: 0, capital_after: 0 });
      }
    }
    return rows;
  }, [activeSession]);

  const handleConfigChange = (field: keyof SessionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Daily Goals
  const targetIsPercent = config.dailyGoalFormat === '%';
  const dailyTargetAmount = targetIsPercent
    ? config.initialCapital * (config.profitTarget / 100)
    : config.profitTarget;

  const dailyCapitalFinal = config.initialCapital + dailyTargetAmount;

  const OptionToggle = ({ label, field }: { label: string, field: keyof SessionConfig }) => (
    <div className="flex justify-between items-center p-2.5 border-b border-slate-700/50 last:border-none h-10">
      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{label}</span>
      <button
        onClick={() => handleConfigChange(field, !config[field])}
        className={`w-14 h-7 rounded flex items-center justify-center text-[10px] font-black transition-all ${config[field] ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(45,212,191,0.3)]' : 'bg-slate-700 text-slate-500 border border-slate-600'}`}
      >
        {config[field] ? 'ON' : 'OFF'}
      </button>
    </div>
  );

  return (
    <div className="bg-[#1a1f2c] min-h-full text-slate-300 p-4 font-display">
      <div className="max-w-[1550px] mx-auto grid grid-cols-12 gap-5">

        {/* LOG SECTION */}
        <div className="col-span-12 lg:col-span-5 flex flex-col h-[780px]">
          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="grid grid-cols-12 bg-[#333b4d] border-b border-slate-700 p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-1">No.</div>
              <div className="col-span-2">Result</div>
              <div className="col-span-3">Trade Amount</div>
              <div className="col-span-3 text-right">Return</div>
              <div className="col-span-3 text-right">Current Balance</div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#0f172a]/10">
              {tradeRows.map((row, idx) => {
                const isNext = activeSession && !activeSession.isCompleted && row.no === activeSession.trades.length + 1;
                const isFinished = activeSession?.isCompleted && row.no === activeSession.trades.length + 1;
                const nextTradeAmt = isNext ? calculateTradeAmount(activeSession.trades) : 0;

                return (
                  <div key={idx} className="grid grid-cols-12 border-b border-slate-800/20 items-center p-2.5 h-[34px] hover:bg-slate-800/10 transition-colors">
                    <div className="col-span-1 text-[11px] font-bold text-slate-500 pl-2">{row.no}</div>
                    <div className="col-span-2">
                      {isNext ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleTradeResult(row.no, 'L')} className="bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/40 w-5 h-5 rounded text-[9px] font-black flex items-center justify-center transition-all">L</button>
                          <button onClick={() => handleTradeResult(row.no, 'W')} className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/40 w-5 h-5 rounded text-[9px] font-black flex items-center justify-center transition-all">W</button>
                        </div>
                      ) : row.result ? (
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black ${row.result === 'W' ? 'bg-primary text-slate-900 shadow-md' : 'bg-danger text-white'}`}>
                          {row.result}
                        </div>
                      ) : (
                        <span className="text-slate-700 font-black ml-2">-</span>
                      )}
                    </div>
                    <div className="col-span-3">
                      {isFinished ? (
                        <div className="bg-danger/20 text-danger text-[8px] font-black px-1.5 py-0.5 rounded border border-danger/30 uppercase">Session End</div>
                      ) : row.result ? (
                        <span className="text-[12px] font-bold text-white">${row.tradeAmt.toFixed(2)}</span>
                      ) : isNext ? (
                        <span className="text-[12px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700 shadow-inner">${nextTradeAmt.toFixed(2)}</span>
                      ) : null}
                    </div>
                    <div className={`col-span-3 text-right text-[12px] font-bold pr-2 ${row.pnl > 0 ? 'text-primary' : row.pnl < 0 ? 'text-danger' : 'text-slate-700'}`}>
                      {row.result ? `${row.pnl > 0 ? '' : ''}$${Math.abs(row.pnl).toFixed(2)}` : ''}
                    </div>
                    <div className="col-span-3 text-right text-[12px] font-black text-white pr-4">
                      {row.result ? `$${row.capital_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-[#1a1f2c] border-t border-slate-700">
              <button onClick={() => onUpdateSession(null)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-black px-6 py-2 rounded border border-slate-600 tracking-widest uppercase transition-all shadow-md active:scale-95">Clear Session</button>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* CALCULATIONS BLOCK - INPUTS */}
          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-2.5 border-b border-slate-700">
              <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.2em]">Calculations</span>
            </div>
            <div className="p-0 text-[11px] font-bold uppercase">
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Initial Capital</div>
                <div className="p-0 bg-slate-900/50 h-full flex items-center justify-between px-3">
                  <div className="flex items-center">
                    <span className="text-slate-500 mr-1">$</span>
                    <input
                      type="number"
                      value={config.initialCapital}
                      readOnly={!!activeSession}
                      onChange={(e) => handleConfigChange('initialCapital', parseFloat(e.target.value) || 0)}
                      className="bg-transparent border-none p-0 text-white font-black w-24 focus:ring-0 text-sm"
                    />
                  </div>
                  <div className="text-[8px] text-slate-500 font-bold whitespace-nowrap">($) {minCapitalRequired.toFixed(2)} min.</div>
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Total Trades</div>
                <div className="p-0 bg-slate-900/50 h-full">
                  <select
                    value={config.totalTrades}
                    onChange={(e) => handleConfigChange('totalTrades', parseInt(e.target.value))}
                    className="w-full h-full bg-transparent border-none text-right text-primary font-black focus:ring-0 pr-4 text-sm cursor-pointer"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n} className="bg-[#1a1f2c]">{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400 relative">
                  Win Trades
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 font-black tracking-widest">{Math.round((config.winTradesGoal / config.totalTrades) * 100)}% W/R</div>
                </div>
                <div className="p-0 bg-slate-900/50 h-full">
                  <select
                    value={config.winTradesGoal}
                    onChange={(e) => handleConfigChange('winTradesGoal', parseInt(e.target.value))}
                    className="w-full h-full bg-transparent border-none text-right text-white font-black focus:ring-0 pr-4 text-sm cursor-pointer"
                  >
                    {Array.from({ length: config.totalTrades - 1 }, (_, i) => i + 1).map(n => <option key={n} value={n} className="bg-[#1a1f2c]">{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Payout %</div>
                <div className="p-0 bg-slate-900/50 h-full flex items-center justify-end px-4">
                  <input
                    type="number"
                    value={config.payoutPercent}
                    onChange={(e) => handleConfigChange('payoutPercent', parseInt(e.target.value) || 0)}
                    className="bg-transparent border-none p-0 text-right text-white font-black w-12 focus:ring-0 text-sm"
                  />
                  <span className="text-white ml-0.5">%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Currency</div>
                <div className="p-0 bg-slate-900/50 h-full">
                  <select className="w-full h-full bg-transparent border-none text-right text-primary font-black focus:ring-0 pr-4 text-sm cursor-pointer">
                    <option className="bg-[#1a1f2c]">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SESSION GOALS BLOCK */}
          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-2.5 border-b border-slate-700">
              <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.2em]">Session Goals</span>
            </div>
            <div className="p-0 text-[11px] font-bold uppercase">
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Win Trades Goal</div>
                <div className="p-3 text-right text-primary font-black h-full flex items-center justify-end pr-4 text-sm bg-slate-900/10 tracking-tight">{config.winTradesGoal}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Total Trades Cap</div>
                <div className="p-3 text-right text-white font-black h-full flex items-center justify-end pr-4 text-sm">{config.totalTrades}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-800/40 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Stop Loss</div>
                <div className="p-0 bg-slate-900/50 h-full flex items-center justify-between px-3">
                  <span className="text-white font-black text-sm">${(activeSession?.initialCapital || config.initialCapital * (1 - config.stopLossPercent / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-slate-500 font-black">{config.stopLossPercent}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 h-11 items-center">
                <div className="p-3 bg-slate-800/20 text-slate-400">Max Loss Limit</div>
                <div className="p-0 bg-slate-900/50 h-full flex items-center justify-between px-3">
                  <span className="text-white font-black text-sm">{maxLossLimit}</span>
                  <span className="text-[7px] text-slate-600 font-bold uppercase leading-tight text-right pr-1">Allowed losses before session end</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMANCE BLOCK - FROM ACTUAL ROWS ONLY */}
          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-2.5 border-b border-slate-700">
              <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.2em]">Session Performance</span>
            </div>
            <div className="p-0 text-[11px] font-bold uppercase">
              <div className="grid grid-cols-12 border-b border-slate-800/40 h-11 items-center">
                <div className="col-span-5 p-3 bg-slate-800/20 text-slate-400 h-full flex items-center">Net PnL</div>
                <div className="col-span-7 p-3 bg-slate-900/50 text-right text-white font-black h-full flex items-center justify-end pr-4 text-sm">
                  <span className={currentStats.accountGain >= 0 ? 'text-primary' : 'text-danger'}>
                    {currentStats.accountGain >= 0 ? '+' : ''}${currentStats.accountGain.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 border-b border-slate-800/40 h-11 items-center">
                <div className="col-span-5 p-3 bg-slate-800/20 text-slate-400 h-full flex items-center">Win Rate</div>
                <div className="col-span-7 p-3 bg-slate-900/50 text-right text-white font-black h-full flex items-center justify-end pr-4 text-sm">
                  {(currentStats.winRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-12 border-b border-slate-800/40 h-11 items-center">
                <div className="col-span-5 p-3 bg-slate-800/20 text-slate-400 h-full flex items-center">Events Won/Lost</div>
                <div className="col-span-7 p-3 bg-slate-900/50 text-right text-white font-black h-full flex items-center justify-end pr-4 text-sm">
                  <span className="text-primary">{currentStats.winTrades}</span>
                  <span className="text-slate-600 px-1">/</span>
                  <span className="text-danger">{currentStats.lossTrades}</span>
                </div>
              </div>
              <div className="grid grid-cols-12 h-11 items-center">
                <div className="col-span-5 p-3 bg-slate-800/20 text-slate-400 h-full flex items-center">Profit Factor</div>
                <div className="col-span-7 p-3 bg-slate-900/50 text-right text-white font-black h-full flex items-center justify-end pr-4 text-sm">
                  {currentStats.profitFactor.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#252b39] border border-slate-700 rounded-lg h-16 flex items-center justify-center opacity-30 shadow-inner">
            <span className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em]">About</span>
          </div>
        </div>

        {/* RIGHT COLUMN: OPTIONS & SESSION COUNTER */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <button
            onClick={handleStartSession}
            disabled={!!activeSession && !activeSession.isCompleted}
            className="w-full bg-warning hover:bg-[#eab308] text-slate-900 font-black text-xl py-5 rounded shadow-lg shadow-warning/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <span className="material-symbols-outlined font-black">add</span>
            + NEW SESSION
          </button>

          <div className="grid grid-cols-2 gap-3 h-14">
            <button
              onClick={() => activeSession && onSaveSession(activeSession)}
              className="bg-[#333b4d] border border-slate-700 text-slate-400 text-[10px] font-black uppercase rounded hover:text-white transition-all shadow-md active:scale-95"
            >
              Log Session
            </button>
            <button
              onClick={() => handleConfigChange('autoCopyBalance', !config.autoCopyBalance)}
              className={`border text-[10px] font-black uppercase rounded transition-all shadow-md flex items-center justify-center ${config.autoCopyBalance ? 'bg-primary/20 text-primary border-primary' : 'bg-[#333b4d] text-slate-500 border-slate-700'}`}
            >
              CB
            </button>
          </div>

          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-1.5 border-b border-slate-700">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Session Counter</span>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="text-7xl font-black text-white tracking-tighter drop-shadow-md pr-2">{counter}</div>
              <div className="flex flex-col gap-3">
                <button onClick={() => setCounter(c => c + 1)} className="bg-slate-700 p-2 rounded hover:bg-slate-600 transition-colors shadow-inner active:scale-90"><span className="material-symbols-outlined text-lg">expand_less</span></button>
                <button onClick={() => setCounter(c => Math.max(0, c - 1))} className="bg-slate-700 p-2 rounded hover:bg-slate-600 transition-colors shadow-inner active:scale-90"><span className="material-symbols-outlined text-lg">expand_more</span></button>
                <button onClick={() => setCounter(1)} className="text-[9px] font-black text-slate-500 hover:text-danger tracking-widest uppercase mt-1 transition-colors">Reset</button>
              </div>
            </div>
          </div>

          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-1.5 border-b border-slate-700">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Daily Goals (est.)</span>
            </div>
            <div className="p-0 text-[10px] font-bold uppercase">
              <div className="flex justify-between items-center p-2.5 border-b border-slate-800/40">
                <span className="text-slate-400 font-black">Profit Target</span>
                <input
                  type="number"
                  value={config.profitTarget}
                  onChange={(e) => handleConfigChange('profitTarget', parseFloat(e.target.value) || 0)}
                  className="bg-[#1a1f2c] border-none p-1 w-14 text-right text-white focus:ring-1 focus:ring-primary rounded font-black h-7"
                />
              </div>
              <div className="flex justify-between items-center p-2.5 border-b border-slate-800/40">
                <span className="text-slate-400 font-black">Daily Goal Format</span>
                <select
                  value={config.dailyGoalFormat}
                  onChange={(e) => handleConfigChange('dailyGoalFormat', e.target.value)}
                  className="bg-primary/20 text-primary border-none p-1 w-14 text-center rounded focus:ring-0 font-black appearance-none cursor-pointer h-7"
                >
                  <option value="%" className="bg-[#1a1f2c]">%</option>
                  <option value="$" className="bg-[#1a1f2c]">$</option>
                </select>
              </div>
              <div className="flex justify-between items-center p-2.5 border-b border-slate-800/40">
                <span className="text-slate-400 font-black tracking-tighter">Current Growth</span>
                <span className="text-white font-black">{currentStats.accountGainPercent.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center p-2.5">
                <span className="text-slate-400 font-black">Capital Final</span>
                <span className="text-white font-black">${dailyCapitalFinal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* OPTIONS WITH TOGGLES */}
          <div className="bg-[#252b39] border border-slate-700 rounded overflow-hidden shadow-xl">
            <div className="bg-[#333b4d] text-center p-1.5 border-b border-slate-700">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Options</span>
            </div>
            <div className="p-0 text-[10px] font-bold uppercase">
              <div className="flex justify-between items-center p-2.5 border-b border-slate-800/40 h-11">
                <span className="text-slate-400 font-black tracking-widest">Stop Loss Alert %</span>
                <input
                  type="number"
                  value={config.stopLossAlert}
                  onChange={(e) => handleConfigChange('stopLossAlert', parseInt(e.target.value) || 0)}
                  className="bg-[#1a1f2c] border-none p-1 w-14 text-right text-white focus:ring-1 focus:ring-primary rounded font-black h-7"
                />
              </div>
              <OptionToggle label="Session End Alert" field="sessionEndAlert" />
              <OptionToggle label="Low Trade Alert" field="lowTradeAlert" />
              <OptionToggle label="Auto-Copy Balance" field="autoCopyBalance" />
              <OptionToggle label="Auto-Log Session" field="autoLogSession" />
              <OptionToggle label="Auto-Count Session" field="autoCountSession" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TradeManager;