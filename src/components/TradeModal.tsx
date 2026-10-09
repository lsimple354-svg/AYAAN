import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Currency, Trade, TradeDirection, TradeResult, AppSettings, DayRecord } from '../types/trading';
import { formatCurrency, convertKesToUsd, convertUsdToKes } from '../utils/compounding';
import { soundManager } from '../utils/audio';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Omit<Trade, 'id' | 'timestamp'> & { id?: string }) => void;
  initialDayNumber: number;
  currency: Currency;
  settings: AppSettings;
  tradeToEdit?: Trade | null;
  dayRecord?: DayRecord;
}

const COMMON_ASSETS = [
  'US 100 (NAS100)',
  'US 30 (Dow Jones 30)',
  'XAUUSD (Gold Spot)',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'GBPJPY',
  'AUDUSD',
  'USDCAD',
  'USD/KES',
  'Volatility 75 Index',
  'Boom 1000 Index',
  'Crash 1000 Index',
];

const COMMON_STRATEGIES = [
  'Institutional Order Block (OB)',
  'Fair Value Gap (FVG) Imbalance',
  'Liquidity Sweep (BSL / SSL)',
  'NY Open 15-Minute Breakout (US30 / US100)',
  'Gold (XAUUSD) Key Support/Resistance Reversal',
  'Break of Structure (BOS) Trend Continuation',
  'London Session High/Low Raid',
  'Asian Range Sweep & Expansion',
];

const EMOTIONAL_STATES = [
  'Disciplined & Calm',
  'Patiently Waited for Confluence',
  'Slight FOMO / Chased Candle',
  'Revenge Trade After Stop Out',
  'Cut Winner Too Early',
  'Exited on Plan & Daily Target',
  'Overleveraged / High Heart Rate',
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  initialDayNumber,
  currency,
  settings,
  tradeToEdit,
  dayRecord
}) => {
  const [dayNumber, setDayNumber] = useState<number>(initialDayNumber);
  const [asset, setAsset] = useState<string>('US 100 (NAS100)');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [lotSize, setLotSize] = useState<string>('0.01');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [pnlValue, setPnlValue] = useState<string>('1.00');
  const [pnlInputCurrency, setPnlInputCurrency] = useState<Currency>(currency);
  const [result, setResult] = useState<TradeResult>('WIN');
  const [strategy, setStrategy] = useState<string>('Institutional Order Block (OB)');
  const [session, setSession] = useState<string>('London / NY Overlap (3:30 PM - 7:00 PM EAT)');
  const [emotion, setEmotion] = useState<string>('Disciplined & Calm');
  const [notes, setNotes] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');

  useEffect(() => {
    if (tradeToEdit) {
      setDayNumber(tradeToEdit.dayNumber);
      setAsset(tradeToEdit.asset);
      setDirection(tradeToEdit.direction);
      setLotSize(tradeToEdit.lotSize ? String(tradeToEdit.lotSize) : '');
      setEntryPrice(tradeToEdit.entryPrice ? String(tradeToEdit.entryPrice) : '');
      setExitPrice(tradeToEdit.exitPrice ? String(tradeToEdit.exitPrice) : '');
      setStopLoss(tradeToEdit.stopLoss ? String(tradeToEdit.stopLoss) : '');
      setTakeProfit(tradeToEdit.takeProfit ? String(tradeToEdit.takeProfit) : '');
      
      const displayVal = pnlInputCurrency === 'KES' 
        ? (tradeToEdit.pnlUsd * settings.usdToKesRate).toFixed(2)
        : tradeToEdit.pnlUsd.toFixed(2);
      setPnlValue(displayVal);
      setResult(tradeToEdit.result);
      setStrategy(tradeToEdit.strategy);
      setSession(tradeToEdit.session);
      setEmotion(tradeToEdit.emotion);
      setNotes(tradeToEdit.notes);
      setScreenshotUrl(tradeToEdit.screenshotUrl || '');
    } else {
      setDayNumber(initialDayNumber);
      setPnlInputCurrency(currency);
      // default sensible target
      const targetUsd = dayRecord ? dayRecord.targetProfitUsd : 1.0;
      const initialPnl = pnlInputCurrency === 'KES' 
        ? (targetUsd * settings.usdToKesRate).toFixed(0)
        : targetUsd.toFixed(2);
      setPnlValue(initialPnl);
    }
  }, [tradeToEdit, initialDayNumber, isOpen]);

  // Sync result win/loss with PnL value sign
  const handlePnlChange = (val: string) => {
    setPnlValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 0) setResult('WIN');
      else if (num < 0) setResult('LOSS');
      else setResult('BREAKEVEN');
    }
  };

  if (!isOpen) return null;

  // Convert entered pnl to USD
  const pnlNumber = parseFloat(pnlValue) || 0;
  const pnlUsd = pnlInputCurrency === 'KES' ? convertKesToUsd(pnlNumber, settings.usdToKesRate) : pnlNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnlUsd > 0) {
      soundManager.playWin();
    } else if (pnlUsd < 0) {
      soundManager.playLoss();
    } else {
      soundManager.playClick();
    }

    onSaveTrade({
      id: tradeToEdit ? tradeToEdit.id : undefined,
      dayNumber,
      asset,
      direction,
      lotSize: lotSize ? parseFloat(lotSize) : undefined,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      pnlUsd,
      result,
      strategy,
      session,
      emotion,
      notes,
      screenshotUrl: screenshotUrl || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0b101c] border border-slate-800 p-5 sm:p-6 shadow-2xl my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">
                {tradeToEdit ? 'Edit Trading Journal Record' : 'Record New Trade'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add your executed trade into Day {dayNumber} compounding balance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Day selection & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenge Day # (1-100)
              </label>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d} {d === settings.activeDay ? '(Active Current Day)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Asset / Pair / Synthetic
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="asset-list"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="Select or type asset..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <datalist id="asset-list">
                  {COMMON_ASSETS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Direction (Long / Short) & Result (Win / Loss / BE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Position Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    direction === 'LONG'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>LONG (BUY)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    direction === 'SHORT'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SHORT (SELL)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trade Outcome
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResult('WIN')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    result === 'WIN'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  WIN 🎯
                </button>
                <button
                  type="button"
                  onClick={() => setResult('LOSS')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    result === 'LOSS'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  LOSS 🔻
                </button>
                <button
                  type="button"
                  onClick={() => setResult('BREAKEVEN')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    result === 'BREAKEVEN'
                      ? 'bg-slate-700 text-slate-200 border border-slate-500'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  B/E ⚖️
                </button>
              </div>
            </div>
          </div>

          {/* Profit & Loss input ($ vs KSH) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white">
                Net Profit / Loss (PnL)
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const currentKes = parseFloat(pnlValue) || 0;
                    if (pnlInputCurrency === 'KES') {
                      setPnlValue((currentKes / settings.usdToKesRate).toFixed(2));
                    }
                    setPnlInputCurrency('USD');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    pnlInputCurrency === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentUsd = parseFloat(pnlValue) || 0;
                    if (pnlInputCurrency === 'USD') {
                      setPnlValue((currentUsd * settings.usdToKesRate).toFixed(0));
                    }
                    setPnlInputCurrency('KES');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    pnlInputCurrency === 'KES' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  KSH (KES)
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                value={pnlValue}
                onChange={(e) => handlePnlChange(e.target.value)}
                placeholder="e.g. 1.25 or -0.50"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-lg font-mono font-bold focus:outline-none ${
                  pnlUsd >= 0 
                    ? 'border-emerald-500/60 text-emerald-400' 
                    : 'border-rose-500/60 text-rose-400'
                }`}
                required
              />
              <div className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                ≈ {pnlInputCurrency === 'USD' 
                  ? formatCurrency(pnlUsd, 'KES', settings.usdToKesRate) 
                  : formatCurrency(pnlUsd, 'USD', settings.usdToKesRate)}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Positive values add to compounding balance. Negative values represent stop-out or loss.
            </p>
          </div>

          {/* Pricing parameters: Lot, Entry, Exit, SL, TP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Lot Size</label>
              <input
                type="number"
                step="any"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="0.001"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="London / NY Overlap (3:30 PM - 7:00 PM EAT)">London / NY Overlap (3:30 PM - 7:00 PM EAT) [Prime US30/US100/Gold]</option>
                <option value="London Open Killzone (10:00 AM - 1:00 PM EAT)">London Open Killzone (10:00 AM - 1:00 PM EAT) [EURUSD/GBPUSD]</option>
                <option value="New York Session (7:00 PM - 11:30 PM EAT)">New York Regular Session (7:00 PM - 11:30 PM EAT)</option>
                <option value="Asian Session (2:00 AM - 10:00 AM EAT)">Asian Session (2:00 AM - 10:00 AM EAT)</option>
              </select>
            </div>
          </div>

          {/* Strategy & Psychology Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Strategy / Setup Confluence
              </label>
              <input
                type="text"
                list="strategy-list"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="strategy-list">
                {COMMON_STRATEGIES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Trading Psychology / Mindset</span>
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {EMOTIONAL_STATES.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes & Screenshot URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Trade Notes &amp; Lessons Learned
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you take this setup? Did you follow your risk rules?"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chart Screenshot Link (TradingView / Lightshot / Imgur)
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {tradeToEdit ? 'Save Changes' : 'Record Trade'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
