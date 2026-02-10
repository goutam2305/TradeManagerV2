
import { Trade, Session } from './types';

export interface Analytics {
    totalTrades: number;
    winTrades: number;
    winProfit: number;
    accountGain: number;
    finalCapital: number;
    winRate: number;
    // Extras derived strictly from rows for UI symmetry if needed
    lossTrades: number;
    profitFactor: number;
    accountGainPercent: number;
}

/**
 * Kernal: Purely recomputes analytics from a flat array of trade rows.
 * MANDATORY: Derived strictly from activeSession.trades[] only.
 * No configuration or presets are used.
 */
export const computeAnalytics = (trades: Trade[]): Analytics => {
    const totalTrades = trades.length;

    const winTrades = trades.filter(t => t.pnl > 0).length;
    const lossTrades = trades.filter(t => t.pnl < 0).length;

    const winProfit = trades
        .filter(t => t.pnl > 0)
        .reduce((sum, t) => sum + t.pnl, 0);

    const grossLoss = trades
        .filter(t => t.pnl < 0)
        .reduce((sum, t) => sum + Math.abs(t.pnl), 0);

    const initialCapital =
        trades.length > 0
            ? trades[0].capital_after - trades[0].pnl
            : 0;

    const finalCapital =
        trades.length > 0
            ? trades[trades.length - 1].capital_after
            : initialCapital;

    const accountGain = finalCapital - initialCapital;

    const winRate =
        totalTrades === 0 ? 0 : winTrades / totalTrades;

    const profitFactor = grossLoss === 0 ? (winProfit > 0 ? 99.99 : 1) : (winProfit / grossLoss);

    const accountGainPercent = initialCapital !== 0 ? (accountGain / initialCapital) * 100 : 0;

    return {
        totalTrades,
        winTrades,
        winProfit,
        accountGain,
        finalCapital,
        winRate,
        lossTrades,
        profitFactor,
        accountGainPercent
    };
};

/**
 * Aggregates analytics across multiple sessions.
 */
export const aggregateSessions = (sessions: Session[]): Analytics & { sessionCount: number; accountGainPercent: number } => {
    const sessionAnalytics = sessions.map(s => computeAnalytics(s.trades));

    const totalTrades = sessionAnalytics.reduce((sum, a) => sum + a.totalTrades, 0);
    const winTrades = sessionAnalytics.reduce((sum, a) => sum + a.winTrades, 0);
    const winProfit = sessionAnalytics.reduce((sum, a) => sum + a.winProfit, 0);
    const accountGain = sessionAnalytics.reduce((sum, a) => sum + a.accountGain, 0);
    const lossTrades = sessionAnalytics.reduce((sum, a) => sum + a.lossTrades, 0);

    // Gross loss for profit factor
    const totalGrossLoss = sessions.flatMap(s => s.trades)
        .filter(t => t.pnl < 0)
        .reduce((sum, t) => sum + Math.abs(t.pnl), 0);

    const winRate = totalTrades === 0 ? 0 : winTrades / totalTrades;
    const profitFactor = totalGrossLoss === 0 ? (winProfit > 0 ? 99.99 : 1) : (winProfit / totalGrossLoss);

    const firstSessionInitial = sessions.length > 0 ? (sessions[sessions.length - 1].trades[0]?.capital_after - sessions[sessions.length - 1].trades[0]?.pnl || sessions[sessions.length - 1].initialCapital) : 0;
    const accountGainPercent = firstSessionInitial !== 0 ? (accountGain / firstSessionInitial) * 100 : 0;

    return {
        totalTrades,
        winTrades,
        winProfit,
        accountGain,
        finalCapital: firstSessionInitial + accountGain,
        winRate,
        lossTrades,
        profitFactor,
        sessionCount: sessions.length,
        accountGainPercent
    };
};
