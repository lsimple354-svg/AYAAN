import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Lock, 
  Unlock, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  Sparkles,
  Sliders,
  RotateCcw,
  Plus
} from 'lucide-react';
import { 
  Currency, 
  PropFirmFirm, 
  PropFirmStage, 
  FundedAccountSize, 
  AppSettings, 
  Trade, 
  DayRecord 
} from '../types/trading';
import { formatCurrency, TradingStats } from '../utils/compounding';
import propDeskImg from '../assets/images/prop_firm_funded_desk_1791650783460.jpg';

interface PropFirmDashboardProps {
  settings: AppSettings;
  currency: Currency;
  stats: TradingStats;
  trades: Trade[];
  activeDayRecord: DayRecord | undefined;
  onUpdatePropSettings: (newProp: AppSettings['propFirm']) => void;
  onOpenTradeModal: () => void;
  onLockSession: () => void;
  onToggleAccountMode?: () => void;
}

const FIRM_CONFIGS: Record<PropFirmFirm, { name: string; phase1Target: number; phase2Target: number; dailyLoss: number; maxLoss: number; defaultSplit: number; minDays: number }> = {
  'FundingPips': { name: 'FundingPips', phase1Target: 8, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 80, minDays: 3 },
  'FTMO': { name: 'FTMO', phase1Target: 10, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 80, minDays: 4 },
  'FundedNext': { name: 'FundedNext', phase1Target: 10, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 90, minDays: 5 },
  'Alpha Capital': { name: 'Alpha Capital', phase1Target: 8, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 80, minDays: 3 },
  'The5ers': { name: 'The5ers', phase1Target: 8, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 80, minDays: 3 },
  'Custom': { name: 'Custom Prop Firm', phase1Target: 8, phase2Target: 5, dailyLoss: 5, maxLoss: 10, defaultSplit: 80, minDays: 4 },
};

const ACCOUNT_SIZES: FundedAccountSize[] = [5000, 10000, 25000, 50000, 100000, 200000];

export const PropFirmDashboard: React.FC<PropFirmDashboardProps> = ({
  settings,
  currency,
  stats,
  trades,
  activeDayRecord,
  onUpdatePropSettings,
  onOpenTradeModal,
  onLockSession,
  onToggleAccountMode,
}) => {
  const prop = settings.propFirm;
  const config = FIRM_CONFIGS[prop.propFirm] || FIRM_CONFIGS['FundingPips'];

  // Current equity and drawdowns
  const accountSize = prop.accountSize;
  const currentEquity = accountSize + stats.netPnlUsd;
  
  // Today's PnL
  const todayPnL = activeDayRecord?.actualProfitUsd || 0;
  
  // Daily Drawdown: 5% limit from starting balance
  const dailyLossLimitUsd = (accountSize * prop.maxDailyLossPercent) / 100;
  const dailyLossUsedUsd = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const dailyBufferRemainingUsd = Math.max(0, dailyLossLimitUsd - dailyLossUsedUsd);
  const dailyLossRatio = (dailyLossUsedUsd / dailyLossLimitUsd) * 100;

  // Max Total Drawdown: 10% limit floor ($90,000 on $100,000 account)
  const maxLossFloorUsd = accountSize * (1 - prop.maxTotalLossPercent / 100);
  const totalBufferRemainingUsd = Math.max(0, currentEquity - maxLossFloorUsd);
  const totalDrawdownUsedUsd = stats.netPnlUsd < 0 ? Math.abs(stats.netPnlUsd) : 0;
  const totalLossLimitUsd = (accountSize * prop.maxTotalLossPercent) / 100;
  const totalLossRatio = (totalDrawdownUsedUsd / totalLossLimitUsd) * 100;

  // Profit target
  const targetPercent = prop.stage === 'phase1' 
    ? prop.profitTargetPercent || config.phase1Target 
    : prop.stage === 'phase2' 
    ? config.phase2Target 
    : 0;

  const targetAmountUsd = (accountSize * targetPercent) / 100;
  const profitMadeUsd = Math.max(0, stats.netPnlUsd);
  const targetProgressRatio = targetAmountUsd > 0 ? Math.min(100, (profitMadeUsd / targetAmountUsd) * 100) : 100;
  const isTargetAchieved = prop.stage !== 'funded' && stats.netPnlUsd >= targetAmountUsd;

  // Funded live payout calculation (80% or 90% split)
  const payoutTraderUsd = (profitMadeUsd * prop.profitSplitPercent) / 100;
  const payoutTraderKes = payoutTraderUsd * settings.usdToKesRate;

  // Days traded count
  const uniqueTradingDays = Array.from(new Set(trades.map(t => t.dayNumber))).length;

  const handleSelectSize = (size: FundedAccountSize) => {
    onUpdatePropSettings({
      ...prop,
      accountSize: size,
      startingEquityUsd: size,
    });
  };

  const handleSelectFirm = (firmName: PropFirmFirm) => {
    const c = FIRM_CONFIGS[firmName];
    onUpdatePropSettings({
      ...prop,
      propFirm: firmName,
      profitTargetPercent: c.phase1Target,
      profitSplitPercent: c.defaultSplit,
      minTradingDays: c.minDays,
    });
  };

  const handleSelectStage = (stage: PropFirmStage) => {
    onUpdatePropSettings({
      ...prop,
      stage,
      profitTargetPercent: stage === 'phase1' ? config.phase1Target : stage === 'phase2' ? config.phase2Target : 0,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Prop Firm Header Banner with 3D Certificate Visual */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img 
            src={propDeskImg} 
            alt="Prop Firm Funded Trader" 
            className="w-full h-full object-cover object-center opacity-35 filter brightness-95 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 to-transparent" />

          {/* Banner Badges & Identity */}
          <div className="absolute bottom-5 left-5 right-5 sm:left-8 sm:right-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  {prop.propFirm} Trader Terminal
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                  prop.stage === 'funded'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                }`}>
                  {prop.stage === 'funded' ? '👑 Live Funded Master' : prop.stage === 'phase2' ? '⚡ Phase 2 Verification' : '🎯 Phase 1 Challenge'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/90 text-slate-300 border border-slate-700">
                  <span>🇰🇪</span>
                  <span>KES {(accountSize * settings.usdToKesRate).toLocaleString()} Portfolio</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>{formatCurrency(accountSize, 'USD', settings.usdToKesRate)} Funded Account</span>
                <span className="text-emerald-400 font-mono text-xl">
                  ({formatCurrency(currentEquity, currency, settings.usdToKesRate)})
                </span>
              </h2>

              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Disciplined prop firm execution with automated <strong className="text-rose-400">5% Daily Loss Guardrail</strong>, <strong className="text-amber-400">10% Max Drawdown Protection</strong>, and live payout calculations in Kenyan Shillings.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              {onToggleAccountMode && (
                <button
                  type="button"
                  onClick={onToggleAccountMode}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-md"
                  title="Switch to 100-Day $10 Seed Compounding Platform"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Switch to Compounding ⇄</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenTradeModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Log Prop Trade</span>
              </button>

              <button
                type="button"
                onClick={onLockSession}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Day</span>
              </button>
            </div>
          </div>
        </div>

        {/* Prop Firm Configuration Bar (Account Size & Firm Presets) */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#090e1a]/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Account Sizes */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Account Size:</span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {ACCOUNT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSelectSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    accountSize === sz
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  ${sz >= 1000 ? `${sz / 1000}K` : sz}
                </button>
              ))}
            </div>
          </div>

          {/* Firm Preset Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Prop Firm:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(FIRM_CONFIGS) as PropFirmFirm[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSelectFirm(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    prop.propFirm === f
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Stage:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectStage('phase1')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  prop.stage === 'phase1' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phase 1
              </button>
              <button
                type="button"
                onClick={() => handleSelectStage('phase2')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  prop.stage === 'phase2' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phase 2
              </button>
              <button
                type="button"
                onClick={() => handleSelectStage('funded')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  prop.stage === 'funded' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Funded Master
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* The 3 Core Prop Firm Risk Gauges & Guardrails */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Gauge 1: Max Daily Loss (Daily Drawdown) Limit */}
        <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden ${
          dailyLossRatio > 80
            ? 'bg-rose-950/30 border-rose-500/70'
            : dailyLossRatio > 50
            ? 'bg-amber-950/20 border-amber-500/60'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Daily Loss Limit ({prop.maxDailyLossPercent}%)</span>
            </div>
            <span className={`text-xs font-mono font-bold ${dailyLossRatio > 80 ? 'text-rose-400' : 'text-slate-400'}`}>
              {dailyLossRatio.toFixed(1)}% Used
            </span>
          </div>

          <div className="text-2xl font-black text-white font-mono mt-1">
            -{formatCurrency(dailyLossUsedUsd, currency, settings.usdToKesRate)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ -{formatCurrency(dailyLossLimitUsd, currency, settings.usdToKesRate)}</span>
          </div>

          <div className="text-xs font-mono mt-1 text-slate-300">
            Buffer Left Today: <strong className={dailyBufferRemainingUsd < (dailyLossLimitUsd * 0.3) ? 'text-rose-400' : 'text-emerald-400'}>
              +{formatCurrency(dailyBufferRemainingUsd, currency, settings.usdToKesRate)}
            </strong>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 p-0.5 border border-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                dailyLossRatio > 80 ? 'bg-rose-500 shadow-md shadow-rose-500/50' : dailyLossRatio > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, dailyLossRatio))}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Resets midnight broker time</span>
            {dailyLossRatio > 70 && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Stop Trading!
              </span>
            )}
          </div>
        </div>

        {/* Gauge 2: Max Total Loss (Overall Drawdown) Limit */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Max Overall Drawdown ({prop.maxTotalLossPercent}%)</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {totalLossRatio.toFixed(1)}% Used
            </span>
          </div>

          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(currentEquity, currency, settings.usdToKesRate)}
          </div>

          <div className="text-xs font-mono mt-1 text-slate-300">
            Liquidation Floor: <strong className="text-rose-400">{formatCurrency(maxLossFloorUsd, currency, settings.usdToKesRate)}</strong>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 p-0.5 border border-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
              style={{ width: `${Math.min(100, Math.max(5, (totalBufferRemainingUsd / totalLossLimitUsd) * 100))}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Room to Breaching: +{formatCurrency(totalBufferRemainingUsd, currency, settings.usdToKesRate)}</span>
          </div>
        </div>

        {/* Gauge 3: Target Progress / Live Payout Hub */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          {prop.stage === 'funded' ? (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live Profit Payout Hub</span>
                <span className="text-xs font-mono font-bold text-amber-300">{prop.profitSplitPercent}% Split</span>
              </div>

              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(payoutTraderUsd, currency, settings.usdToKesRate)}
              </div>

              <div className="text-xs font-mono mt-1 text-slate-300">
                Direct to M-Pesa: <strong className="text-emerald-300">KSH {payoutTraderKes.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 p-0.5 border border-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Total Net Profit: {formatCurrency(stats.netPnlUsd, currency, settings.usdToKesRate, true)}</span>
                <span className="text-emerald-400 font-semibold">Eligible for Payout</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {prop.stage === 'phase1' ? 'Phase 1 Target' : 'Phase 2 Target'} (+{targetPercent}%)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {targetProgressRatio.toFixed(1)}%
                </span>
              </div>

              <div className="text-2xl font-black text-white font-mono mt-1">
                {formatCurrency(profitMadeUsd, currency, settings.usdToKesRate)}
                <span className="text-xs font-normal text-slate-400 ml-1.5">/ {formatCurrency(targetAmountUsd, currency, settings.usdToKesRate)}</span>
              </div>

              <div className="text-xs font-mono mt-1 text-slate-300">
                To Pass Challenge: <strong className="text-emerald-400">
                  {formatCurrency(Math.max(0, targetAmountUsd - profitMadeUsd), currency, settings.usdToKesRate)}
                </strong>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 p-0.5 border border-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isTargetAchieved ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, targetProgressRatio))}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Minimum Days: {uniqueTradingDays} / {prop.minTradingDays}</span>
                {isTargetAchieved && <span className="text-emerald-400 font-bold">🎯 TARGET PASSED!</span>}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Prop Firm Position Sizing Matrix (Calculated for $5K - $200K Accounts) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                Funded Position Sizing Table ({accountSize >= 1000 ? `$${accountSize / 1000}K` : `$${accountSize}`} Account)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Never risk more than 0.5% – 1% per trade on a funded account to keep your 5% daily drawdown completely safe.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">
              0.5% Risk = {formatCurrency(accountSize * 0.005, currency, settings.usdToKesRate)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold">
              1.0% Risk = {formatCurrency(accountSize * 0.01, currency, settings.usdToKesRate)}
            </span>
          </div>
        </div>

        {/* Instruments Prop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Contract / Pip Value</th>
                <th className="py-2.5 px-3">0.5% Risk (Safe)</th>
                <th className="py-2.5 px-3">1.0% Risk (Standard)</th>
                <th className="py-2.5 px-3">Recommended SL</th>
                <th className="py-2.5 px-3">Prime Nairobi Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-white">US 100 (NAS100)</td>
                <td className="py-3 px-3 text-slate-300">1.0 pt = $1.00 / lot</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{(accountSize / 100000 * 2.5).toFixed(1)} – {(accountSize / 100000 * 3.5).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{(accountSize / 100000 * 5.0).toFixed(1)} – {(accountSize / 100000 * 7.0).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-slate-300">15 – 25 points</td>
                <td className="py-3 px-3 text-slate-400 font-sans">3:30 PM – 7:00 PM EAT</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-white">US 30 (Dow Jones)</td>
                <td className="py-3 px-3 text-slate-300">1.0 pt = $1.00 / lot</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{(accountSize / 100000 * 1.5).toFixed(1)} – {(accountSize / 100000 * 2.5).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{(accountSize / 100000 * 3.0).toFixed(1)} – {(accountSize / 100000 * 5.0).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-slate-300">25 – 45 points</td>
                <td className="py-3 px-3 text-slate-400 font-sans">4:00 PM – 8:00 PM EAT</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-white">XAUUSD (Gold Spot)</td>
                <td className="py-3 px-3 text-slate-300">1 pip = $10.00 / lot</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{(accountSize / 100000 * 1.5).toFixed(1)} – {(accountSize / 100000 * 2.5).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{(accountSize / 100000 * 3.0).toFixed(1)} – {(accountSize / 100000 * 5.0).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-slate-300">15 – 25 pips ($1.5 - $2.5 move)</td>
                <td className="py-3 px-3 text-slate-400 font-sans">3:30 PM – 7:00 PM EAT</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-white">EURUSD / GBPUSD</td>
                <td className="py-3 px-3 text-slate-300">1 pip = $10.00 / lot</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{(accountSize / 100000 * 2.5).toFixed(1)} – {(accountSize / 100000 * 4.0).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">{(accountSize / 100000 * 5.0).toFixed(1)} – {(accountSize / 100000 * 8.0).toFixed(1)} lots</td>
                <td className="py-3 px-3 text-slate-300">12 – 18 pips</td>
                <td className="py-3 px-3 text-slate-400 font-sans">10:00 AM – 1:00 PM EAT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
