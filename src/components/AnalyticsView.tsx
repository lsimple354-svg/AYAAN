import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  Brain, 
  Activity, 
  Target, 
  Flame, 
  ArrowUpRight, 
  DollarSign 
} from 'lucide-react';
import { Currency, DayRecord, Trade, AppSettings } from '../types/trading';
import { formatCurrency, TradingStats } from '../utils/compounding';

interface AnalyticsViewProps {
  days: DayRecord[];
  trades: Trade[];
  stats: TradingStats;
  currency: Currency;
  settings: AppSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  days,
  trades,
  stats,
  currency,
  settings,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayRecord | null>(null);

  // Strategy Breakdown
  const strategyStats: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const strat = t.strategy || 'Uncategorized';
    if (!strategyStats[strat]) {
      strategyStats[strat] = { count: 0, wins: 0, pnl: 0 };
    }
    strategyStats[strat].count++;
    if (t.result === 'WIN') strategyStats[strat].wins++;
    strategyStats[strat].pnl += t.pnlUsd;
  });

  // Emotion Breakdown
  const emotionStats: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const emo = t.emotion || 'Standard';
    if (!emotionStats[emo]) {
      emotionStats[emo] = { count: 0, wins: 0, pnl: 0 };
    }
    emotionStats[emo].count++;
    if (t.result === 'WIN') emotionStats[emo].wins++;
    emotionStats[emo].pnl += t.pnlUsd;
  });

  // Build SVG Points for the first 30 days or up to day 100
  // For readability on the chart, display Days 1 to 50 or 100 with smooth SVG
  const chartDays = days.slice(0, Math.max(25, settings.activeDay + 10));
  const maxProjected = Math.max(...chartDays.map(d => d.projectedEndUsd), 50);
  const maxActual = Math.max(...chartDays.map(d => d.actualEndUsd), settings.initialBalanceUsd);
  const maxVal = Math.max(maxProjected, maxActual, 20);

  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (dayIndex: number, value: number) => {
    const x = paddingX + (dayIndex / (chartDays.length - 1)) * (svgWidth - paddingX * 2);
    // Logarithmic scale or sqrt scale works better for exponential compounding
    const normalized = Math.log10(Math.max(1, value)) / Math.log10(Math.max(2, maxVal));
    const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
    return { x, y: Math.max(paddingY, Math.min(svgHeight - paddingY, y)) };
  };

  // Generate SVG Path for projected target
  const projectedPoints = chartDays.map((d, i) => getCoordinates(i, d.projectedEndUsd));
  const projectedPath = projectedPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Generate SVG Path for actual balance
  const actualDaysWithProgress = chartDays.filter(d => d.dayNumber <= settings.activeDay);
  const actualPoints = actualDaysWithProgress.map((d, i) => getCoordinates(i, d.actualEndUsd));
  const actualPath = actualPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="space-y-6">
      
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Compounding Growth</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {stats.totalGrowthPercent >= 0 ? `+${stats.totalGrowthPercent.toFixed(1)}%` : `${stats.totalGrowthPercent.toFixed(1)}%`}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Initial: {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {stats.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {stats.wins} Wins / {stats.losses} Losses / {stats.breakevens} BE
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profit Factor</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {stats.profitFactor.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Gross Gain vs Gross Drawdown
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Longest Win Streak</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1 flex items-center gap-1.5">
            <span>{stats.streak}</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Consecutive winning executions
          </p>
        </div>
      </div>

      {/* Interactive Growth Curves SVG Graph */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-white">Compounding Trajectory Curve</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualizing Target Exponential Pathway vs Actual Trading Account Balance.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-dashed inline-block" />
              <span className="text-cyan-300">Projected Plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
              <span className="text-emerald-400 font-bold">Actual Progress</span>
            </div>
          </div>
        </div>

        {/* Hover inspector card */}
        {hoveredDay && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold">Day {hoveredDay.dayNumber} Metrics:</span>
            <span className="text-cyan-400">
              Planned: {formatCurrency(hoveredDay.projectedEndUsd, currency, settings.usdToKesRate)}
            </span>
            <span className="text-emerald-400 font-bold">
              Actual: {formatCurrency(hoveredDay.actualEndUsd, currency, settings.usdToKesRate)}
            </span>
            <span className="text-slate-400">
              Daily Target: +{hoveredDay.targetPercent}%
            </span>
          </div>
        )}

        {/* SVG Viewport */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            {/* Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
              <line
                key={idx}
                x1={paddingX}
                y1={paddingY + idx * ((svgHeight - paddingY * 2) / 4)}
                x2={svgWidth - paddingX}
                y2={paddingY + idx * ((svgHeight - paddingY * 2) / 4)}
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
              className="opacity-70"
            />

            {/* Actual Balance Curve */}
            {actualPoints.length > 0 && (
              <path
                d={actualPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                className="candlestick-glow-green"
              />
            )}

            {/* Interactive Data Points */}
            {chartDays.map((d, i) => {
              const pt = getCoordinates(i, d.actualEndUsd);
              const isActive = d.dayNumber === settings.activeDay;
              const hasTrades = trades.some(t => t.dayNumber === d.dayNumber);

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

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-4">
          <span>Day 1 (Seed)</span>
          <span>Day {Math.floor(chartDays.length / 2)}</span>
          <span>Day {chartDays.length}</span>
        </div>
      </div>

      {/* Strategy & Psychology Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strategy Performance */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Strategy Performance</h4>
          </div>
          <div className="space-y-2 pt-1">
            {Object.keys(strategyStats).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No trades recorded yet.</p>
            ) : (
              Object.entries(strategyStats).map(([name, data]) => {
                const wr = (data.wins / data.count) * 100;
                return (
                  <div key={name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {data.count} trades • {wr.toFixed(0)}% win rate
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-bold ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(data.pnl, currency, settings.usdToKesRate, true)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Psychology / Mindset Analysis */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Psychology &amp; Discipline Insights</h4>
          </div>
          <div className="space-y-2 pt-1">
            {Object.keys(emotionStats).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No psychology data logged yet.</p>
            ) : (
              Object.entries(emotionStats).map(([name, data]) => {
                const wr = (data.wins / data.count) * 100;
                return (
                  <div key={name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>🧠</span>
                        <span>{name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {data.count} sessions • {wr.toFixed(0)}% accuracy
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-bold ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(data.pnl, currency, settings.usdToKesRate, true)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
