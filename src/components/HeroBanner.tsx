import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Shield,
  Layers
} from 'lucide-react';
import { Currency, AppSettings, DayRecord } from '../types/trading';
import { formatCurrency, TradingStats } from '../utils/compounding';
import ayaanHeroImg from '../assets/images/ayaan_trading_gold_indices_1791572751801.jpg';

interface HeroBannerProps {
  currency: Currency;
  settings: AppSettings;
  activeDayRecord: DayRecord | undefined;
  stats: TradingStats;
  onOpenTradeModal: () => void;
  onLockActiveDay: () => void;
  onUnlockActiveDay: () => void;
  onAdvanceDay: () => void;
  onToggleAccountMode?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currency,
  settings,
  activeDayRecord,
  stats,
  onOpenTradeModal,
  onLockActiveDay,
  onUnlockActiveDay,
  onAdvanceDay,
  onToggleAccountMode,
}) => {
  const currentDay = settings.activeDay;
  const startBal = activeDayRecord?.startBalanceUsd || settings.initialBalanceUsd;
  const targetPct = activeDayRecord?.targetPercent || 10;
  const targetProfitUsd = activeDayRecord?.targetProfitUsd || (startBal * targetPct) / 100;
  const actualProfitUsd = activeDayRecord?.actualProfitUsd || 0;
  const isLocked = activeDayRecord?.isLocked || false;
  const isTargetHit = actualProfitUsd >= targetProfitUsd && targetProfitUsd > 0;
  const progressRatio = targetProfitUsd > 0 ? Math.min(100, Math.max(0, (actualProfitUsd / targetProfitUsd) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl mb-8">
      {/* Background Graphic & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={ayaanHeroImg} 
          alt="Ayaan Trading Desk" 
          className="w-full h-full object-cover object-center opacity-30 filter brightness-90 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#090e1c]/95 to-[#0b1329]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a11] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-5 sm:p-7 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Mission & Active Day Spotlight */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Ayaan Trading Protocol
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                US 100 • US 30 • XAUUSD • EURUSD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-800/80 text-slate-300 border border-slate-700">
                Seed: {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)}
              </span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Day {currentDay} LOCKED (Discipline Active)
                </span>
              ) : isTargetHit ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Target Hit! Close &amp; Lock Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Day {currentDay} Active Session
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                <span>Day {currentDay} Target:</span>
                <span className="text-emerald-400 font-mono">
                  +{targetPct}% ({formatCurrency(targetProfitUsd, currency, settings.usdToKesRate)})
                </span>
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Trading from <strong className="text-white">{formatCurrency(startBal, currency, settings.usdToKesRate)}</strong> to achieve end balance of <strong className="text-emerald-300">{formatCurrency(startBal + targetProfitUsd, currency, settings.usdToKesRate)}</strong>. Once hit, close terminals and walk away to protect capital.
              </p>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-2 pt-1 max-w-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  Session PnL:
                  <span className={`font-bold ml-1 ${actualProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(actualProfitUsd, currency, settings.usdToKesRate, true)}
                  </span>
                </span>
                <span className="text-slate-300 font-semibold">
                  {progressRatio.toFixed(1)}% / 100% Target
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTargetHit
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-md shadow-emerald-500/40'
                      : actualProfitUsd < 0
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, progressRatio))}%` }}
                />
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenTradeModal}
                disabled={isLocked}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all ${
                  isLocked 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>{isLocked ? 'Trading Locked for Today' : 'Record New Trade'}</span>
              </button>

              {onToggleAccountMode && (
                <button
                  type="button"
                  onClick={onToggleAccountMode}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-md"
                  title="Switch to PropFirms Platform (FTMO, FundingPips, FundedNext)"
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Switch to PropFirms ⇄</span>
                </button>
              )}

              {isLocked ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onAdvanceDay}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>Proceed to Day {currentDay + 1}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onUnlockActiveDay}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Unlock Session
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLockActiveDay}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer ${
                    isTargetHit
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10 animate-bounce'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{isTargetHit ? 'Lock Day Now (Target Met!)' : 'Lock Trading Day'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Key Quick Stats Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* Compounded Balance */}
            <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Compounded Balance</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                  {stats.multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                {formatCurrency(stats.currentBalanceUsd, currency, settings.usdToKesRate)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                From {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)} ({stats.totalGrowthPercent >= 0 ? `+${stats.totalGrowthPercent.toFixed(1)}%` : `${stats.totalGrowthPercent.toFixed(1)}%`})
              </div>
            </div>

            {/* Win Rate */}
            <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                  {stats.wins}W / {stats.losses}L
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Streak: {stats.streak} wins 🔥
              </div>
            </div>

            {/* Target Hit Days */}
            <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Days Secured</span>
                <Shield className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono tracking-tight">
                {stats.daysCompleted} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {((stats.daysCompleted / 100) * 100).toFixed(0)}% roadmap accomplished
              </div>
            </div>

            {/* Profit Factor / Best Trade */}
            <div className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Profit Factor</span>
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono tracking-tight">
                {stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '1.00'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                Best: {formatCurrency(stats.bestTradeUsd, currency, settings.usdToKesRate, true)}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
