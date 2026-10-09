import { AppSettings, DayRecord, Trade } from '../types/trading';
import { generateInitialDays, recalculateDaysWithTrades } from './compounding';

const STORAGE_KEYS = {
  SETTINGS: 'apex_compound_settings_v1',
  DAYS: 'apex_compound_days_v1',
  TRADES: 'apex_compound_trades_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  initialBalanceUsd: 10,
  usdToKesRate: 130,
  activeDay: 1,
  soundEnabled: true,
  autoLockOnTarget: true,
  preset: 'stepped',
};

export const INITIAL_SAMPLE_TRADES: Trade[] = [
  {
    id: 'sample-trade-1',
    dayNumber: 1,
    timestamp: new Date().toISOString(),
    asset: 'US 100 (NAS100)',
    direction: 'LONG',
    lotSize: 0.01,
    entryPrice: 20420.5,
    exitPrice: 20485.0,
    stopLoss: 20395.0,
    takeProfit: 20480.0,
    pnlUsd: 1.25,
    result: 'WIN',
    strategy: 'NY Open 15-Minute Breakout (US30 / US100)',
    session: 'London / NY Overlap (3:30 PM - 7:00 PM EAT)',
    emotion: 'Disciplined & Calm',
    notes: 'Clean reaction off 15m bullish order block during NY opening drive. Secured daily +10% target in a single execution.',
  }
];

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}

export function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load trades', e);
  }
  return INITIAL_SAMPLE_TRADES;
}

export function saveTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  } catch (e) {
    console.warn('Failed to save trades', e);
  }
}

export function loadDays(settings: AppSettings, trades: Trade[]): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAYS);
    if (raw) {
      const parsed: DayRecord[] = JSON.parse(raw);
      if (parsed.length === 100) {
        return recalculateDaysWithTrades(parsed, trades, settings.initialBalanceUsd, settings.activeDay);
      }
    }
  } catch (e) {
    console.warn('Failed to load days', e);
  }

  const fresh = generateInitialDays(settings.initialBalanceUsd, settings.preset);
  return recalculateDaysWithTrades(fresh, trades, settings.initialBalanceUsd, settings.activeDay);
}

export function saveDays(days: DayRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days));
  } catch (e) {
    console.warn('Failed to save days', e);
  }
}
