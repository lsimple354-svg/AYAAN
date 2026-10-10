export type Currency = 'USD' | 'KES';

export type AccountMode = 'funded' | 'compounding';

export type PropFirmFirm = 'FundingPips' | 'FTMO' | 'FundedNext' | 'Alpha Capital' | 'The5ers' | 'Custom';
export type PropFirmStage = 'phase1' | 'phase2' | 'funded';
export type FundedAccountSize = 5000 | 10000 | 25000 | 50000 | 100000 | 200000;

export interface PropFirmSettings {
  accountMode: AccountMode;
  propFirm: PropFirmFirm;
  stage: PropFirmStage;
  accountSize: number;
  maxDailyLossPercent: number;
  maxTotalLossPercent: number;
  profitTargetPercent: number;
  profitSplitPercent: number;
  minTradingDays: number;
  startingEquityUsd: number;
}

export type CompoundingPreset = 
  | 'stepped'      // 10% -> 15% -> 20% -> 30% -> 40% -> 50%
  | 'steady10'     // 10% daily
  | 'steady15'     // 15% daily
  | 'steady20'     // 20% daily
  | 'steady30'     // 30% daily
  | 'aggressive40' // 40% daily
  | 'apex50'       // 50% daily
  | 'custom';

export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN';
export type TradeDirection = 'LONG' | 'SHORT';

export interface Trade {
  id: string;
  dayNumber: number;
  timestamp: string;
  asset: string;
  direction: TradeDirection;
  lotSize?: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  pnlUsd: number;
  result: TradeResult;
  strategy: string;
  session: string;
  emotion: string;
  notes: string;
  screenshotUrl?: string;
  afterScreenshotUrl?: string;
}

export interface DayRecord {
  dayNumber: number;
  date: string;
  startBalanceUsd: number;
  targetPercent: number; // e.g. 10 for 10%
  targetProfitUsd: number;
  projectedEndUsd: number;
  actualProfitUsd: number;
  actualEndUsd: number;
  isLocked: boolean;
  lockedAt?: string;
  status: 'pending' | 'in_progress' | 'target_hit' | 'locked' | 'drawdown';
  notes?: string;
}

export interface AppSettings {
  initialBalanceUsd: number;
  usdToKesRate: number;
  activeDay: number;
  soundEnabled: boolean;
  autoLockOnTarget: boolean;
  preset: CompoundingPreset;
  nextSessionTime?: string; // ISO string
  propFirm: PropFirmSettings;
}

