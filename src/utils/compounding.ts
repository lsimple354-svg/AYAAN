import { Currency, CompoundingPreset, DayRecord, Trade, AppSettings } from '../types/trading';

export const DEFAULT_INITIAL_USD = 10;
export const DEFAULT_USD_KES_RATE = 130;

// Returns default target % for day 1..100 based on selected preset
export function getPresetPercentage(preset: CompoundingPreset, day: number): number {
  switch (preset) {
    case 'stepped': {
      // Starting from 10%, 15%, 20%, 30%, 40% and 50% as requested
      if (day <= 10) return 10;
      if (day <= 25) return 15;
      if (day <= 45) return 20;
      if (day <= 65) return 30;
      if (day <= 85) return 40;
      return 50;
    }
    case 'steady10': return 10;
    case 'steady15': return 15;
    case 'steady20': return 20;
    case 'steady30': return 30;
    case 'aggressive40': return 40;
    case 'apex50': return 50;
    case 'custom': return 15;
    default: return 10;
  }
}

// Generate the 100 days plan
export function generateInitialDays(
  initialBalance: number = DEFAULT_INITIAL_USD,
  preset: CompoundingPreset = 'stepped',
  existingDays?: DayRecord[]
): DayRecord[] {
  const days: DayRecord[] = [];
  let projectedRunningBalance = initialBalance;

  for (let day = 1; day <= 100; day++) {
    const existing = existingDays?.find(d => d.dayNumber === day);
    const targetPercent = existing ? existing.targetPercent : getPresetPercentage(preset, day);
    
    const targetProfitUsd = (projectedRunningBalance * targetPercent) / 100;
    const projectedEndUsd = projectedRunningBalance + targetProfitUsd;

    days.push({
      dayNumber: day,
      date: existing?.date || getTradingDate(day),
      startBalanceUsd: existing ? existing.startBalanceUsd : projectedRunningBalance,
      targetPercent,
      targetProfitUsd: existing ? existing.targetProfitUsd : targetProfitUsd,
      projectedEndUsd: existing ? existing.projectedEndUsd : projectedEndUsd,
      actualProfitUsd: existing?.actualProfitUsd || 0,
      actualEndUsd: existing?.actualEndUsd || (existing ? existing.startBalanceUsd : projectedRunningBalance),
      isLocked: existing?.isLocked || false,
      lockedAt: existing?.lockedAt,
      status: existing?.status || (day === 1 ? 'in_progress' : 'pending'),
      notes: existing?.notes || ''
    });

    projectedRunningBalance = projectedEndUsd;
  }

  return days;
}

// Recalculates actual balances & status based on logged trades
export function recalculateDaysWithTrades(
  days: DayRecord[],
  trades: Trade[],
  initialBalance: number = DEFAULT_INITIAL_USD,
  activeDay: number = 1
): DayRecord[] {
  let runningActualBalance = initialBalance;
  let runningProjectedBalance = initialBalance;

  return days.map((day) => {
    // Trades logged specifically for this day
    const dayTrades = trades.filter((t) => t.dayNumber === day.dayNumber);
    const dayProfit = dayTrades.reduce((acc, t) => acc + t.pnlUsd, 0);

    const startBalanceUsd = day.dayNumber === 1 ? initialBalance : runningActualBalance;
    const targetProfitUsd = (startBalanceUsd * day.targetPercent) / 100;
    const projectedEndUsd = runningProjectedBalance * (1 + day.targetPercent / 100);
    runningProjectedBalance = projectedEndUsd;

    const actualEndUsd = Math.max(0, startBalanceUsd + dayProfit);
    
    // Status logic
    let status: DayRecord['status'] = day.status;
    if (day.isLocked) {
      status = 'locked';
    } else if (dayTrades.length > 0) {
      if (dayProfit >= targetProfitUsd && targetProfitUsd > 0) {
        status = 'target_hit';
      } else if (dayProfit < 0) {
        status = 'drawdown';
      } else {
        status = 'in_progress';
      }
    } else if (day.dayNumber === activeDay) {
      status = 'in_progress';
    } else if (day.dayNumber > activeDay) {
      status = 'pending';
    }

    const updatedDay: DayRecord = {
      ...day,
      startBalanceUsd,
      targetProfitUsd,
      projectedEndUsd,
      actualProfitUsd: dayProfit,
      actualEndUsd: dayTrades.length > 0 ? actualEndUsd : startBalanceUsd,
      status
    };

    if (dayTrades.length > 0 || day.dayNumber <= activeDay) {
      runningActualBalance = actualEndUsd;
    }

    return updatedDay;
  });
}

function getTradingDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + (dayOffset - 1));
  return d.toISOString().split('T')[0];
}

// Format currency
export function formatCurrency(
  amountUsd: number,
  currency: Currency,
  rate: number = DEFAULT_USD_KES_RATE,
  showSign: boolean = false
): string {
  const isNegative = amountUsd < 0;
  const absAmount = Math.abs(amountUsd);

  if (currency === 'KES') {
    const kesValue = absAmount * rate;
    const formatted = kesValue.toLocaleString('en-KE', {
      minimumFractionDigits: kesValue < 100 ? 2 : 0,
      maximumFractionDigits: 2
    });
    const prefix = showSign ? (isNegative ? '-KSH ' : '+KSH ') : (isNegative ? '-KSH ' : 'KSH ');
    return `${prefix}${formatted}`;
  }

  // USD
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const prefix = showSign ? (isNegative ? '-$' : '+$') : (isNegative ? '-$' : '$');
  return `${prefix}${formatted}`;
}

export function convertUsdToKes(usd: number, rate: number = DEFAULT_USD_KES_RATE): number {
  return usd * rate;
}

export function convertKesToUsd(kes: number, rate: number = DEFAULT_USD_KES_RATE): number {
  return kes / rate;
}

export interface TradingStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  netPnlUsd: number;
  currentBalanceUsd: number;
  totalGrowthPercent: number;
  multiplier: number;
  bestTradeUsd: number;
  worstTradeUsd: number;
  profitFactor: number;
  daysCompleted: number;
  streak: number;
}

export function calculateStats(
  trades: Trade[],
  initialBalance: number = DEFAULT_INITIAL_USD,
  days: DayRecord[]
): TradingStats {
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'WIN').length;
  const losses = trades.filter(t => t.result === 'LOSS').length;
  const breakevens = trades.filter(t => t.result === 'BREAKEVEN').length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  const netPnlUsd = trades.reduce((acc, t) => acc + t.pnlUsd, 0);
  const currentBalanceUsd = Math.max(0, initialBalance + netPnlUsd);
  const totalGrowthPercent = initialBalance > 0 ? ((currentBalanceUsd - initialBalance) / initialBalance) * 100 : 0;
  const multiplier = initialBalance > 0 ? currentBalanceUsd / initialBalance : 1;

  let bestTradeUsd = 0;
  let worstTradeUsd = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  trades.forEach(t => {
    if (t.pnlUsd > bestTradeUsd) bestTradeUsd = t.pnlUsd;
    if (t.pnlUsd < worstTradeUsd) worstTradeUsd = t.pnlUsd;
    if (t.pnlUsd > 0) grossProfit += t.pnlUsd;
    if (t.pnlUsd < 0) grossLoss += Math.abs(t.pnlUsd);
  });

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.9 : 0);
  const daysCompleted = days.filter(d => d.isLocked || d.status === 'target_hit').length;

  // Streak
  let streak = 0;
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].result === 'WIN') streak++;
    else break;
  }

  return {
    totalTrades,
    wins,
    losses,
    breakevens,
    winRate,
    netPnlUsd,
    currentBalanceUsd,
    totalGrowthPercent,
    multiplier,
    bestTradeUsd,
    worstTradeUsd,
    profitFactor,
    daysCompleted,
    streak
  };
}
