import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Target, 
  Award, 
  Sparkles, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Zap,
  BarChart3,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Currency, DayRecord, Trade, AppSettings } from '../types/trading';
import { formatCurrency, TradingStats } from '../utils/compounding';
import calendarHeroImg from '../assets/images/ayaan_trading_calendar_vault_1791572772410.jpg';

interface CompoundingCurveCalendarProps {
  days: DayRecord[];
  trades: Trade[];
  stats: TradingStats;
  currency: Currency;
  settings: AppSettings;
  onSelectDay: (dayNumber: number) => void;
  onLogTradeForDay: (dayNumber: number) => void;
  onLockDay: (dayNumber: number) => void;
  onUnlockDay: (dayNumber: number) => void;
}

export const CompoundingCurveCalendar: React.FC<CompoundingCurveCalendarProps> = ({
  days,
  trades,
  stats,
  currency,
  settings,
  onSelectDay,
  onLogTradeForDay,
  onLockDay,
  onUnlockDay,
}) => {
  const [selectedViewMonth, setSelectedViewMonth] = useState<number>(1); // 1 = Days 1-25, 2 = Days 26-50, 3 = Days 51-75, 4 = Days 76-100
  const [hoveredDay, setHoveredDay] = useState<DayRecord | null>(null);

  // Month chunks (25 trading days per chunk)
  const startDay = (selectedViewMonth - 1) * 25 + 1;
  const endDay = selectedViewMonth * 25;
  const monthDays = days.slice(startDay - 1, endDay);

  // Milestone Matrix targets
  const milestones = [
    { targetUsd: 30, label: 'Seed Recovered (M-Pesa Free)', icon: '🛡️', color: 'emerald' },
    { targetUsd: 100, label: '10x Centurion Club', icon: '⚡', color: 'cyan' },
    { targetUsd: 300, label: 'Intermediate Fund', icon: '🔥', color: 'purple' },
    { targetUsd: 1000, label: '100x Master Sovereign', icon: '👑', color: 'amber' },
    { targetUsd: 5000, label: 'Institutional Apex', icon: '🏛️', color: 'blue' },
  ];

  // SVG Compounding Curve Calculations
  const chartDays = days.slice(0, Math.max(30, settings.activeDay + 15));
  const maxProjected = Math.max(...chartDays.map(d => d.projectedEndUsd), 50);
  const maxActual = Math.max(...chartDays.map(d => d.actualEndUsd), settings.initialBalanceUsd);
  const maxVal = Math.max(maxProjected, maxActual, 20);

  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (dayIndex: number, value: number) => {
    const x = paddingX + (dayIndex / (chartDays.length - 1)) * (svgWidth - paddingX * 2);
    const normalized = Math.log10(Math.max(1, value)) / Math.log10(Math.max(2, maxVal));
    const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
    return { x, y: Math.max(paddingY, Math.min(svgHeight - paddingY, y)) };
  };

  const projectedPoints = chartDays.map((d, i) => getCoordinates(i, d.projectedEndUsd));
  const projectedPath = projectedPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const actualDaysWithProgress = chartDays.filter(d => d.dayNumber <= settings.activeDay);
  const actualPoints = actualDaysWithProgress.map((d, i) => getCoordinates(i, d.actualEndUsd));
  const actualPath = actualPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="space-y-6">
      
      {/* Hero Visual Card with Generated Executive Calendar Vault Artwork */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img 
            src={calendarHeroImg} 
            alt="Ayaan Trading Compounding Calendar" 
            className="w-full h-full object-cover object-center opacity-40 filter brightness-95 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-transparent to-[#070b14]/80" />

          <div className="absolute bottom-5 left-5 right-5 sm:left-7 sm:right-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Ayaan Trading Milestone Matrix
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                100-Day Trading Calendar &amp; Exponential Growth Horizon
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Daily compounding quota tracking for <strong className="text-emerald-400">US 100, US 30, XAUUSD, and EURUSD</strong>. Track every session and observe your exponential growth.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Compounded Value</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(stats.currentBalanceUsd, currency, settings.usdToKesRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Compounding Growth Curve Graph */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Exponential Compounding Trajectory
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target growth curve vs Actual recorded balance progression across 100 days.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-cyan-400 border-dashed inline-block" />
              <span className="text-cyan-300">Target Curve</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-emerald-400 rounded-full inline-block" />
              <span className="text-emerald-400 font-bold">Actual Growth</span>
            </div>
          </div>
        </div>

        {/* Hover inspector badge */}
        {hoveredDay && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-2 animate-fadeIn">
            <span className="text-white font-bold">Day {hoveredDay.dayNumber} Snapshot:</span>
            <span className="text-cyan-400">Planned: {formatCurrency(hoveredDay.projectedEndUsd, currency, settings.usdToKesRate)}</span>
            <span className="text-emerald-400 font-bold">Actual: {formatCurrency(hoveredDay.actualEndUsd, currency, settings.usdToKesRate)}</span>
            <span className="text-slate-400">Target %: +{hoveredDay.targetPercent}%</span>
          </div>
        )}

        {/* SVG Curve */}
        <div className="relative w-full overflow-x-auto bg-[#070b14] rounded-2xl border border-slate-800/80 p-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            {/* Horizontal Grid */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((pct, idx) => (
              <line
                key={idx}
                x1={paddingX}
                y1={paddingY + idx * ((svgHeight - paddingY * 2) / 5)}
                x2={svgWidth - paddingX}
                y2={paddingY + idx * ((svgHeight - paddingY * 2) / 5)}
                stroke="rgba(51, 65, 85, 0.3)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Projected Target Curve */}
            <path
              d={projectedPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="5 5"
              className="opacity-75"
            />

            {/* Actual Growth Curve */}
            {actualPoints.length > 0 && (
              <path
                d={actualPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                className="candlestick-glow-green"
              />
            )}

            {/* Data Points */}
            {chartDays.map((d, i) => {
              const pt = getCoordinates(i, d.actualEndUsd);
              const isActive = d.dayNumber === settings.activeDay;
              if (d.dayNumber > settings.activeDay) return null;

              return (
                <circle
                  key={d.dayNumber}
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6 : 4}
                  fill={isActive ? '#10b981' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2 : 1}
                  className="cursor-pointer hover:r-8 transition-all"
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
          <span>Day 1: {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)}</span>
          <span>Day {Math.floor(chartDays.length / 2)}</span>
          <span>Day {chartDays.length}</span>
        </div>
      </div>

      {/* Compounding Milestone Matrix Tracker */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Compounding Milestone Roadposts</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {stats.currentBalanceUsd >= 30 ? 'Progressing toward Milestone 2' : 'Milestone 1 in Focus'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((m, idx) => {
            const isCompleted = stats.currentBalanceUsd >= m.targetUsd;
            const progress = Math.min(100, Math.max(0, (stats.currentBalanceUsd / m.targetUsd) * 100));

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/80 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? 'REACHED' : `${progress.toFixed(0)}%`}
                  </span>
                </div>
                <div className="text-base font-black text-white font-mono">
                  {formatCurrency(m.targetUsd, currency, settings.usdToKesRate)}
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-snug">
                  {m.label}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 100-Day Trading Calendar Grid ("My Calendar") */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        
        {/* Calendar Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                My 100-Day Trading Calendar Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any calendar day to inspect trades, update target %, or record your daily session.
            </p>
          </div>

          {/* Month Quarter Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setSelectedViewMonth(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedViewMonth === 1 ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Days 1 - 25
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewMonth(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedViewMonth === 2 ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Days 26 - 50
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewMonth(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedViewMonth === 3 ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Days 51 - 75
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewMonth(4)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedViewMonth === 4 ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Days 76 - 100
            </button>
          </div>
        </div>

        {/* Calendar Day Grid (5 x 5 layout per quarter) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {monthDays.map((day) => {
            const isActive = day.dayNumber === settings.activeDay;
            const dayTrades = trades.filter(t => t.dayNumber === day.dayNumber);
            const isHit = day.actualProfitUsd >= day.targetProfitUsd && day.targetProfitUsd > 0;
            const isLocked = day.isLocked;

            let borderStyle = 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700';
            if (isActive) {
              borderStyle = 'border-blue-500/80 bg-blue-950/20 ring-2 ring-blue-500/30';
            } else if (isLocked) {
              borderStyle = 'border-amber-500/60 bg-amber-950/20';
            } else if (isHit) {
              borderStyle = 'border-emerald-500/60 bg-emerald-950/20';
            } else if (day.actualProfitUsd < 0) {
              borderStyle = 'border-rose-500/60 bg-rose-950/20';
            }

            return (
              <div
                key={day.dayNumber}
                onClick={() => onSelectDay(day.dayNumber)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[110px] ${borderStyle}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-slate-950'
                      : isLocked
                      ? 'bg-amber-500/30 text-amber-300'
                      : isHit
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    Day {day.dayNumber}
                  </span>

                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : isHit ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">+{day.targetPercent}%</span>
                  )}
                </div>

                {/* Balance & Profit Metrics */}
                <div className="space-y-0.5 my-1.5 font-mono">
                  <div className="text-[11px] text-slate-400">
                    Goal: <span className="text-emerald-400 font-bold">+{formatCurrency(day.targetProfitUsd, currency, settings.usdToKesRate)}</span>
                  </div>
                  {dayTrades.length > 0 ? (
                    <div className={`text-xs font-black ${day.actualProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      PnL: {formatCurrency(day.actualProfitUsd, currency, settings.usdToKesRate, true)}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600">No trades yet</div>
                  )}
                </div>

                {/* Day Footer Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500 font-mono">
                    {dayTrades.length} trade{dayTrades.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogTradeForDay(day.dayNumber);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold group-hover:underline"
                  >
                    + Log
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Ayaan Trading Core Instruments Quick Reference */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Ayaan Trading Portfolio Instruments &amp; Execution Specifications</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 uppercase font-mono block">US 100 (NAS100)</span>
            <div className="text-slate-300 font-semibold">Tech Heavy Momentum</div>
            <p className="text-[11px] text-slate-400">
              Prime: 3:30 PM - 7:00 PM EAT. Minimum contract 0.01 micro. Highly responsive to NY 15-minute opening breakouts.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 uppercase font-mono block">US 30 (Dow Jones)</span>
            <div className="text-slate-300 font-semibold">Wall Street Heavyweight</div>
            <p className="text-[11px] text-slate-400">
              Prime: 4:30 PM - 8:00 PM EAT. Moves 200-500 points daily. High risk-to-reward on Order Block retests.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 uppercase font-mono block">XAUUSD (Gold)</span>
            <div className="text-slate-300 font-semibold">Precious Metal Volatility</div>
            <p className="text-[11px] text-slate-400">
              Prime: London/NY Overlap (3:30 PM - 7:00 PM EAT). 0.01 lot = $0.10/pip ($1.00 per $1 move). Strict stop loss mandatory!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400 uppercase font-mono block">EURUSD &amp; Forex</span>
            <div className="text-slate-300 font-semibold">Liquid Currency Pairs</div>
            <p className="text-[11px] text-slate-400">
              Prime: 10:00 AM - 1:00 PM London Open. Clean SMC Fair Value Gaps with tight 10-15 pip stops for $10 account safety.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
