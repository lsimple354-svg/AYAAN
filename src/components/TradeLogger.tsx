import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Calendar,
  Sparkles,
  Camera,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Currency, Trade, AppSettings } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';

interface TradeLoggerProps {
  trades: Trade[];
  currency: Currency;
  settings: AppSettings;
  onOpenTradeModal: (dayNumber?: number) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onOpenStatementImporter?: () => void;
}

export const TradeLogger: React.FC<TradeLoggerProps> = ({
  trades,
  currency,
  settings,
  onOpenTradeModal,
  onEditTrade,
  onDeleteTrade,
  onOpenStatementImporter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [dayFilter, setDayFilter] = useState<string>('ALL');

  // Filter trades
  const filteredTrades = trades.filter((t) => {
    if (resultFilter !== 'ALL' && t.result !== resultFilter) return false;
    if (dayFilter !== 'ALL' && String(t.dayNumber) !== dayFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchAsset = t.asset.toLowerCase().includes(q);
      const matchStrategy = t.strategy.toLowerCase().includes(q);
      const matchNotes = t.notes.toLowerCase().includes(q);
      const matchEmotion = t.emotion.toLowerCase().includes(q);
      if (!matchAsset && !matchStrategy && !matchNotes && !matchEmotion) return false;
    }
    return true;
  });

  const uniqueDays = Array.from(new Set(trades.map((t) => t.dayNumber))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className={`flex items-center justify-center w-7 h-7 rounded-lg border ${
                settings.propFirm.accountMode === 'funded'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                <Layers className="w-4 h-4" />
              </span>
              <span>
                {settings.propFirm.accountMode === 'funded' ? 'Prop Firm Execution Journal' : 'Trade Execution Journal'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {settings.propFirm.accountMode === 'funded'
                ? `Recording trades for ${settings.propFirm.propFirm} $${settings.propFirm.accountSize >= 1000 ? `${settings.propFirm.accountSize / 1000}K` : settings.propFirm.accountSize} Funded Desk with real-time drawdown tracking.`
                : 'Every trade recorded contributes directly to your 100-day compounding journey.'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStatementImporter && (
              <button
                type="button"
                onClick={onOpenStatementImporter}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                title="Import MT4/MT5 statement CSV or HTML"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Import MT4/MT5</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenTradeModal(settings.activeDay)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 shadow-lg transition-all cursor-pointer ${
                settings.propFirm.accountMode === 'funded'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-cyan-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record New Trade</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search asset, setup, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Outcome:</span>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as unknown as typeof resultFilter)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">Winners (WIN)</option>
              <option value="LOSS">Losses (LOSS)</option>
              <option value="BREAKEVEN">Breakeven (B/E)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Day:</span>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Recorded Days</option>
              {uniqueDays.map((d) => (
                <option key={d} value={String(d)}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">No trades found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {trades.length === 0
                ? "Start recording your trades to see your daily compounding progression."
                : "No trades match the selected filter criteria."}
            </p>
            <button
              type="button"
              onClick={() => onOpenTradeModal(settings.activeDay)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Trade Now</span>
            </button>
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isWin = t.result === 'WIN';
            const isLoss = t.result === 'LOSS';

            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Asset, Direction, Day, Timestamp */}
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-xl font-black text-xs shrink-0 ${
                        t.direction === 'LONG'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {t.direction === 'LONG' ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                          {t.asset}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.direction === 'LONG' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {t.direction}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          Day {t.dayNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.session}
                        </span>
                      </div>

                      {/* Technical specifications */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
                        {t.lotSize && <span>Lot: <strong className="text-slate-300">{t.lotSize}</strong></span>}
                        {t.entryPrice && <span>Entry: <strong className="text-slate-300">{t.entryPrice}</strong></span>}
                        {t.exitPrice && <span>Exit: <strong className="text-slate-300">{t.exitPrice}</strong></span>}
                        {t.strategy && <span className="text-emerald-400/90 font-sans">[{t.strategy}]</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: PnL, Outcome, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                        t.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatCurrency(t.pnlUsd, currency, settings.usdToKesRate, true)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {currency === 'USD' 
                          ? `KSH ${(t.pnlUsd * settings.usdToKesRate).toLocaleString('en-US', { maximumFractionDigits: 1 })}` 
                          : `$${t.pnlUsd.toFixed(2)}`}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      isWin 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                        : isLoss 
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.result}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTrade(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Trade"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this trade record?')) {
                            soundManager.playClick();
                            onDeleteTrade(t.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Notes & Psychology Footer */}
                {(t.notes || t.emotion || t.screenshotUrl) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-300 italic flex-1">
                      "{t.notes || 'No trade notes logged.'}"
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {t.emotion && (
                        <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40 text-[11px]">
                          🧠 {t.emotion}
                        </span>
                      )}
                      {t.screenshotUrl && (
                        <a
                          href={t.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline hover:text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40"
                          title="View Entry Setup Chart (Before)"
                        >
                          <Camera className="w-3 h-3 text-cyan-400" />
                          <span>Entry Setup</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {t.afterScreenshotUrl && (
                        <a
                          href={t.afterScreenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline hover:text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40"
                          title="View Exit Outcome Chart (After)"
                        >
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>Exit Outcome</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
