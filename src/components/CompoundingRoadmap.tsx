import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Currency, CompoundingPreset, DayRecord, Trade, AppSettings } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';

interface CompoundingRoadmapProps {
  days: DayRecord[];
  trades: Trade[];
  currency: Currency;
  settings: AppSettings;
  onUpdateDayPercent: (dayNumber: number, newPercent: number) => void;
  onApplyPreset: (preset: CompoundingPreset) => void;
  onApplySmartCurve: (risk: 'conservative' | 'balanced' | 'aggressive') => void;
  onLockDay: (dayNumber: number) => void;
  onUnlockDay: (dayNumber: number) => void;
  onSetActiveDay: (dayNumber: number) => void;
  onLogTradeForDay: (dayNumber: number) => void;
  onViewDayTrades: (dayNumber: number) => void;
}

export const CompoundingRoadmap: React.FC<CompoundingRoadmapProps> = ({
  days,
  trades,
  currency,
  settings,
  onUpdateDayPercent,
  onApplyPreset,
  onApplySmartCurve,
  onLockDay,
  onUnlockDay,
  onSetActiveDay,
  onLogTradeForDay,
  onViewDayTrades,
}) => {
  const [selectedRange, setSelectedRange] = useState<'1-20' | '21-40' | '41-60' | '61-80' | '81-100' | 'all'>('1-20');
  const [statusFilter, setStatusFilter] = useState<'all' | 'locked' | 'target_hit' | 'in_progress' | 'pending'>('all');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempPercent, setTempPercent] = useState<number>(10);
  const [showSmartModal, setShowSmartModal] = useState(false);

  // Filter days based on range & status
  const filteredDays = days.filter((day) => {
    // Range filter
    if (selectedRange === '1-20' && (day.dayNumber < 1 || day.dayNumber > 20)) return false;
    if (selectedRange === '21-40' && (day.dayNumber < 21 || day.dayNumber > 40)) return false;
    if (selectedRange === '41-60' && (day.dayNumber < 41 || day.dayNumber > 60)) return false;
    if (selectedRange === '61-80' && (day.dayNumber < 61 || day.dayNumber > 80)) return false;
    if (selectedRange === '81-100' && (day.dayNumber < 81 || day.dayNumber > 100)) return false;

    // Status filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'locked') return day.isLocked;
    if (statusFilter === 'target_hit') return day.status === 'target_hit' || day.isLocked;
    if (statusFilter === 'in_progress') return day.dayNumber === settings.activeDay || day.status === 'in_progress';
    if (statusFilter === 'pending') return day.status === 'pending' && day.dayNumber > settings.activeDay;

    return true;
  });

  // Calculate final projected milestone balance at Day 100
  const finalDay100 = days[days.length - 1];

  const handleStartEditing = (dayNumber: number, currentPercent: number) => {
    setEditingDay(dayNumber);
    setTempPercent(currentPercent);
  };

  const handleSavePercent = (dayNumber: number) => {
    if (tempPercent > 0 && tempPercent <= 200) {
      onUpdateDayPercent(dayNumber, tempPercent);
    }
    setEditingDay(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Compounding Preset Bar & AI Curve Generator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Compounding Strategy Presets
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                100 Trading Days
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Choose your compounding formula or customize individual day targets.
            </p>
          </div>

          {/* AI Curve Generator trigger */}
          <button
            type="button"
            onClick={() => setShowSmartModal(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600/30 to-emerald-600/30 hover:from-purple-600/40 hover:to-emerald-600/40 border border-purple-500/40 text-purple-200 shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Risk-Adaptive Curve</span>
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => onApplyPreset('steady15')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              settings.preset === 'steady15'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 border border-emerald-400 ring-1 ring-emerald-400/40'
                : 'bg-slate-800/90 text-emerald-300 hover:bg-slate-800 border border-emerald-600/40'
            }`}
            title="Formula: $10.00 -> $11.50 (+15%) -> $13.23 (+15%) onwards"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Steady 15% ($10 → $11.50 → $13.23 Formula)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">RECOMMENDED</span>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('stepped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              settings.preset === 'stepped'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Stepped Ramp (10% → 15% → 20% → 30% → 40% → 50%)
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('steady10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              settings.preset === 'steady10'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Steady 10%
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('steady20')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              settings.preset === 'steady20'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Steady 20%
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('steady30')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              settings.preset === 'steady30'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Aggressive 30%
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('apex50')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              settings.preset === 'apex50'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Apex 50%
          </button>
        </div>
      </div>

      {/* Target Milestone Projection Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Starting Seed Capital</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)}
          </div>
          <span className="text-[11px] text-slate-400">Day 1 Ground Zero</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Active Day ({settings.activeDay}) Start Target</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {formatCurrency(days[settings.activeDay - 1]?.startBalanceUsd || settings.initialBalanceUsd, currency, settings.usdToKesRate)}
          </div>
          <span className="text-[11px] text-slate-400">
            Daily Goal: +{days[settings.activeDay - 1]?.targetPercent || 10}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold">100-Day Projected Horizon</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300 font-mono mt-1 truncate">
            {finalDay100 ? formatCurrency(finalDay100.projectedEndUsd, currency, settings.usdToKesRate) : '—'}
          </div>
          <span className="text-[11px] text-emerald-400/80">Geometric compounding theoretical potential</span>
        </div>
      </div>

      {/* Range Tabs & Status Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        {/* Pagination Range Toggles */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedRange('1-20')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === '1-20' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Days 1-20
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('21-40')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === '21-40' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Days 21-40
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('41-60')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === '41-60' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Days 41-60
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('61-80')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === '61-80' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Days 61-80
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('81-100')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === '81-100' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Days 81-100
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedRange === 'all' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 100
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as unknown as typeof statusFilter)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Days</option>
            <option value="in_progress">Active / In Progress</option>
            <option value="target_hit">Target Met</option>
            <option value="locked">Locked</option>
            <option value="pending">Upcoming Pending</option>
          </select>
        </div>
      </div>

      {/* The 100-Day Interactive Compounding Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
        {/* Mobile horizontal scroll guidance */}
        <div className="sm:hidden flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Swipe horizontally to view all columns</span>
          </span>
          <span className="font-mono text-emerald-300 font-bold">100 Days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold tracking-wider font-mono">
                <th className="py-3 px-3 sm:px-4 sticky left-0 bg-slate-900/95 sm:static sm:bg-transparent z-10">Day #</th>
                <th className="py-3 px-3 sm:px-4">Initial Balance</th>
                <th className="py-3 px-3 sm:px-4 text-center">Daily Target %</th>
                <th className="py-3 px-3 sm:px-4">Daily Profit Goal</th>
                <th className="py-3 px-3 sm:px-4">Target End Balance</th>
                <th className="py-3 px-3 sm:px-4">Actual PnL</th>
                <th className="py-3 px-3 sm:px-4">Actual End Balance</th>
                <th className="py-3 px-3 sm:px-4 text-center">Status</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No days found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredDays.map((day) => {
                  const isActive = day.dayNumber === settings.activeDay;
                  const dayTrades = trades.filter((t) => t.dayNumber === day.dayNumber);
                  const isHit = day.actualProfitUsd >= day.targetProfitUsd && day.targetProfitUsd > 0;
                  const isLocked = day.isLocked;

                  return (
                    <tr
                      key={day.dayNumber}
                      className={`transition-colors hover:bg-slate-900/60 ${
                        isActive
                          ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500'
                          : isLocked
                          ? 'bg-amber-950/10'
                          : isHit
                          ? 'bg-emerald-950/10'
                          : ''
                      }`}
                    >
                      {/* Day Number (Sticky on mobile) */}
                      <td className="py-3 px-3 sm:px-4 font-bold text-white whitespace-nowrap sticky left-0 bg-slate-950/95 sm:static sm:bg-transparent z-10">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                            isActive
                              ? 'bg-emerald-500 text-slate-950'
                              : isLocked
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : isHit
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {day.dayNumber}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-sans font-semibold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Initial Balance */}
                      <td className="py-3 px-3 sm:px-4 text-slate-200 font-semibold whitespace-nowrap">
                        {formatCurrency(day.startBalanceUsd, currency, settings.usdToKesRate)}
                      </td>

                      {/* Daily Target % (Inline Editable) */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {editingDay === day.dayNumber ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="150"
                              value={tempPercent}
                              onChange={(e) => setTempPercent(Number(e.target.value))}
                              className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePercent(day.dayNumber)}
                              className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDay(null)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEditing(day.dayNumber, day.targetPercent)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold border border-slate-700/70 transition-all text-xs cursor-pointer group"
                            title="Click to customize target %"
                          >
                            <span>+{day.targetPercent}%</span>
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">✎</span>
                          </button>
                        )}
                      </td>

                      {/* Daily Profit Goal */}
                      <td className="py-3 px-3 sm:px-4 text-emerald-400/90 whitespace-nowrap font-medium">
                        +{formatCurrency(day.targetProfitUsd, currency, settings.usdToKesRate)}
                      </td>

                      {/* Target End Balance */}
                      <td className="py-3 px-3 sm:px-4 text-slate-300 whitespace-nowrap font-medium">
                        {formatCurrency(day.projectedEndUsd, currency, settings.usdToKesRate)}
                      </td>

                      {/* Actual PnL */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {dayTrades.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => onViewDayTrades(day.dayNumber)}
                            className={`font-bold hover:underline cursor-pointer ${
                              day.actualProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(day.actualProfitUsd, currency, settings.usdToKesRate, true)}
                            <span className="text-[10px] text-slate-400 ml-1">({dayTrades.length}t)</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actual End Balance */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-bold text-white">
                        {dayTrades.length > 0 || day.dayNumber <= settings.activeDay ? (
                          <span className={day.actualEndUsd >= day.projectedEndUsd ? 'text-emerald-300' : 'text-slate-200'}>
                            {formatCurrency(day.actualEndUsd, currency, settings.usdToKesRate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Lock className="w-3 h-3 text-amber-400" />
                            Locked
                          </span>
                        ) : isHit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Target Met
                          </span>
                        ) : day.actualProfitUsd < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Drawdown
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            <Clock className="w-3 h-3 text-blue-400" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 bg-slate-800/60">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {/* Log Trade */}
                          <button
                            type="button"
                            onClick={() => onLogTradeForDay(day.dayNumber)}
                            disabled={isLocked}
                            className={`p-1.5 rounded-lg transition-all ${
                              isLocked
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900 border border-slate-700/60 cursor-pointer'
                            }`}
                            title="Log Trade for Day"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock */}
                          {isLocked ? (
                            <button
                              type="button"
                              onClick={() => onUnlockDay(day.dayNumber)}
                              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 transition-colors cursor-pointer"
                              title="Unlock Day"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onLockDay(day.dayNumber)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isHit
                                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/20 border border-amber-500/50'
                                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                              }`}
                              title={isHit ? "Daily Target Hit! Lock Trading" : "Lock Session"}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Set as Active Day */}
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => onSetActiveDay(day.dayNumber)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                              title="Make this your current trading day"
                            >
                              Active
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Smart Risk-Adaptive Curve Modal */}
      {showSmartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0c121e] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">AI Adaptive Curve Generator</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-calibrates daily compounding targets across 100 days to safeguard your initial capital while progressively accelerating returns as your account balance multiplies.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onApplySmartCurve('conservative');
                  setShowSmartModal(false);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Conservative Compound</span>
                  <span className="text-xs font-mono text-emerald-400">8% → 15%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ideal for low drawdown, high capital protection on small initial deposit.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplySmartCurve('balanced');
                  setShowSmartModal(false);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 text-sm">Balanced Stepped (Recommended)</span>
                  <span className="text-xs font-mono text-emerald-300">10% → 30%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Starts with 10% daily target, scales to 15%, 20%, and 30% as balance grows.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplySmartCurve('aggressive');
                  setShowSmartModal(false);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">Apex Aggressive</span>
                  <span className="text-xs font-mono text-purple-400">20% → 50%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Rapid compounding challenge designed for experienced scalpers and volatility traders.
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSmartModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
