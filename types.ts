
export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  DASHBOARD = 'DASHBOARD',
  TRADEMANAGER = 'TRADEMANAGER',
  SESSION_LOG = 'SESSION_LOG',
  SETTINGS = 'SETTINGS'
}

export interface Trade {
  no: number;
  result: 'W' | 'L' | '-' | null;
  tradeAmt: number;
  returnVal: number;
  balance: number;
  statusText?: string;
}

export interface SessionConfig {
  initialCapital: number;
  totalTrades: number;
  winTradesGoal: number;
  payoutPercent: number;
  currency: string;
  stopLossPercent: number;
  targetGainPercent: number;
  
  // Daily Goals
  profitTarget: number;
  dailyGoalFormat: '%' | '$';
  
  // Options
  stopLossAlert: number;
  sessionEndAlert: boolean;
  lowTradeAlert: boolean;
  autoCopyBalance: boolean;
  autoLogSession: boolean;
  autoCountSession: boolean;
}

export interface Session {
  id: string;
  date: string;
  initialCapital: number;
  config: SessionConfig;
  trades: Trade[];
  isCompleted: boolean;
  finalBalance: number;
  totalWin: number;
  totalLoss: number;
  sessionCounter: number;
}

export interface AppState {
  view: AppView;
  user: {
    name: string;
    role: string;
  } | null;
  sessions: Session[];
  activeSession: Session | null;
}
