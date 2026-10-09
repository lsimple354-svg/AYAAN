/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { LiveMarketTicker } from './components/LiveMarketTicker';
import { CompoundingCurveCalendar } from './components/CompoundingCurveCalendar';
import { TradingAcademy } from './components/TradingAcademy';
import { PositionSizerCalculator } from './components/PositionSizerCalculator';
import { HeroBanner } from './components/HeroBanner';
import { CompoundingRoadmap } from './components/CompoundingRoadmap';
import { TradeLogger } from './components/TradeLogger';
import { TradeModal } from './components/TradeModal';
import { DisciplineLockModal } from './components/DisciplineLockModal';
import { SettingsModal } from './components/SettingsModal';
import { TradingRulesModal } from './components/TradingRulesModal';
import { 
  Currency, 
  CompoundingPreset, 
  DayRecord, 
  Trade, 
  AppSettings 
} from './types/trading';
import { 
  loadSettings, 
  saveSettings, 
  loadTrades, 
  saveTrades, 
  loadDays, 
  saveDays, 
  DEFAULT_SETTINGS 
} from './utils/storage';
import { 
  generateInitialDays, 
  recalculateDaysWithTrades, 
  calculateStats,
  formatCurrency
} from './utils/compounding';
import { soundManager } from './utils/audio';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [days, setDays] = useState<DayRecord[]>(() => loadDays(settings, trades));
  
  const [activeTab, setActiveTab] = useState<AppTab>('roadmap');
  
  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [tradeModalDay, setTradeModalDay] = useState<number>(settings.activeDay);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);

  // Sync settings sound preference
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Recalculate days whenever trades or settings change
  useEffect(() => {
    const updated = recalculateDaysWithTrades(days, trades, settings.initialBalanceUsd, settings.activeDay);
    setDays(updated);
    saveDays(updated);
    saveTrades(trades);
    saveSettings(settings);
  }, [trades, settings.initialBalanceUsd, settings.activeDay]);

  const stats = calculateStats(trades, settings.initialBalanceUsd, days);
  const activeDayRecord = days.find((d) => d.dayNumber === settings.activeDay);

  // Currency Toggle
  const handleCurrencyToggle = (newCurr: Currency) => {
    setCurrency(newCurr);
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    soundManager.enabled = nextVal;
    if (nextVal) soundManager.playClick();
    const updated = { ...settings, soundEnabled: nextVal };
    setSettings(updated);
    saveSettings(updated);
  };

  // Trade Modal Triggers
  const handleOpenTradeModal = (dayNumber?: number) => {
    setTradeToEdit(null);
    setTradeModalDay(dayNumber ?? settings.activeDay);
    setIsTradeModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setTradeModalDay(trade.dayNumber);
    setIsTradeModalOpen(true);
  };

  const handleQuickLogFromChart = (asset: string, currentPrice: number) => {
    soundManager.playClick();
    setTradeToEdit({
      id: '',
      dayNumber: settings.activeDay,
      timestamp: new Date().toISOString(),
      asset,
      direction: 'LONG',
      entryPrice: currentPrice,
      lotSize: asset.includes('Vol') ? 0.001 : 0.01,
      pnlUsd: 1.0,
      result: 'WIN',
      strategy: 'Order Block / SMC',
      session: 'London / NY Overlap',
      emotion: 'Disciplined & Calm',
      notes: `Entered off live terminal quote at ${currentPrice}`,
    });
    setTradeModalDay(settings.activeDay);
    setIsTradeModalOpen(true);
  };

  const handleDeleteTrade = (tradeId: string) => {
    const updated = trades.filter((t) => t.id !== tradeId);
    setTrades(updated);
  };

  const handleSaveTrade = (tradeData: Omit<Trade, 'id' | 'timestamp'> & { id?: string }) => {
    let updatedTrades: Trade[];
    if (tradeData.id) {
      updatedTrades = trades.map((t) =>
        t.id === tradeData.id
          ? {
              ...t,
              ...tradeData,
            }
          : t
      );
    } else {
      const newTrade: Trade = {
        ...tradeData,
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
      };
      updatedTrades = [newTrade, ...trades];
    }

    setTrades(updatedTrades);

    // Check if target for that day is met and auto-lock if requested
    const targetDay = days.find((d) => d.dayNumber === tradeData.dayNumber);
    if (targetDay && settings.autoLockOnTarget) {
      const dayTrades = updatedTrades.filter((t) => t.dayNumber === tradeData.dayNumber);
      const dayProfit = dayTrades.reduce((acc, t) => acc + t.pnlUsd, 0);
      
      if (dayProfit >= targetDay.targetProfitUsd && targetDay.targetProfitUsd > 0 && !targetDay.isLocked) {
        // Automatically lock day and show discipline vault!
        handleLockDay(tradeData.dayNumber);
        setTimeout(() => {
          setIsDisciplineModalOpen(true);
        }, 300);
      }
    }
  };

  // Lock / Unlock Day
  const handleLockDay = (dayNumber: number) => {
    soundManager.playLock();
    const updatedDays = days.map((d) =>
      d.dayNumber === dayNumber
        ? {
            ...d,
            isLocked: true,
            status: 'locked' as const,
            lockedAt: new Date().toISOString(),
          }
        : d
    );
    setDays(updatedDays);
    saveDays(updatedDays);
    setIsDisciplineModalOpen(true);
  };

  const handleUnlockDay = (dayNumber: number) => {
    soundManager.playClick();
    const updatedDays = days.map((d) =>
      d.dayNumber === dayNumber
        ? {
            ...d,
            isLocked: false,
            status: (d.actualProfitUsd >= d.targetProfitUsd ? 'target_hit' : 'in_progress') as DayRecord['status'],
          }
        : d
    );
    setDays(updatedDays);
    saveDays(updatedDays);
  };

  // Advance to next day
  const handleAdvanceDay = () => {
    const nextDay = Math.min(100, settings.activeDay + 1);
    const updatedSettings = { ...settings, activeDay: nextDay };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    soundManager.playTargetHit();
  };

  // Set active day manually
  const handleSetActiveDay = (dayNumber: number) => {
    soundManager.playClick();
    const updated = { ...settings, activeDay: dayNumber };
    setSettings(updated);
    saveSettings(updated);
  };

  // Compounding Presets
  const handleApplyPreset = (preset: CompoundingPreset) => {
    soundManager.playClick();
    const updatedSettings = { ...settings, preset };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);

    const fresh = generateInitialDays(settings.initialBalanceUsd, preset, days);
    const recalculated = recalculateDaysWithTrades(fresh, trades, settings.initialBalanceUsd, settings.activeDay);
    setDays(recalculated);
    saveDays(recalculated);
  };

  // AI Smart Curve application
  const handleApplySmartCurve = (risk: 'conservative' | 'balanced' | 'aggressive') => {
    soundManager.playClick();
    const updatedDays = days.map((d) => {
      let pct = 10;
      if (risk === 'conservative') {
        pct = d.dayNumber <= 30 ? 8 : d.dayNumber <= 70 ? 12 : 15;
      } else if (risk === 'balanced') {
        // 10%, 15%, 20%, 30%
        if (d.dayNumber <= 15) pct = 10;
        else if (d.dayNumber <= 35) pct = 15;
        else if (d.dayNumber <= 65) pct = 20;
        else pct = 30;
      } else {
        // aggressive
        if (d.dayNumber <= 10) pct = 15;
        else if (d.dayNumber <= 30) pct = 25;
        else if (d.dayNumber <= 60) pct = 35;
        else pct = 50;
      }
      return { ...d, targetPercent: pct };
    });

    const recalculated = recalculateDaysWithTrades(updatedDays, trades, settings.initialBalanceUsd, settings.activeDay);
    setDays(recalculated);
    saveDays(recalculated);
  };

  // Individual Day % Inline update
  const handleUpdateDayPercent = (dayNumber: number, newPercent: number) => {
    soundManager.playClick();
    const updatedDays = days.map((d) =>
      d.dayNumber === dayNumber
        ? {
            ...d,
            targetPercent: newPercent,
          }
        : d
    );
    const recalculated = recalculateDaysWithTrades(updatedDays, trades, settings.initialBalanceUsd, settings.activeDay);
    setDays(recalculated);
    saveDays(recalculated);
  };

  // Reset challenge
  const handleResetChallenge = () => {
    soundManager.playClick();
    const freshSettings = { ...DEFAULT_SETTINGS };
    const freshDays = generateInitialDays(10, 'stepped');
    setSettings(freshSettings);
    setTrades([]);
    setDays(freshDays);
    saveSettings(freshSettings);
    saveTrades([]);
    saveDays(freshDays);
  };

  // Import Backup Data
  const handleImportData = (data: { settings: AppSettings; days: DayRecord[]; trades: Trade[] }) => {
    setSettings(data.settings);
    setTrades(data.trades);
    setDays(data.days);
    saveSettings(data.settings);
    saveTrades(data.trades);
    saveDays(data.days);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Real-Time Market Ticker Tape with Nairobi EAT Clock */}
      <LiveMarketTicker
        currency={currency}
        usdToKesRate={settings.usdToKesRate}
      />

      {/* Top Fixed Header */}
      <Navbar
        currency={currency}
        onCurrencyToggle={handleCurrencyToggle}
        settings={settings}
        activeDayRecord={activeDayRecord}
        currentBalanceUsd={stats.currentBalanceUsd}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTradeModal={() => handleOpenTradeModal(settings.activeDay)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onToggleSound={handleToggleSound}
        onOpenDisciplineVault={() => setIsDisciplineModalOpen(true)}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Banner with Trading Terminal Aesthetics */}
        <HeroBanner
          currency={currency}
          settings={settings}
          activeDayRecord={activeDayRecord}
          stats={stats}
          onOpenTradeModal={() => handleOpenTradeModal(settings.activeDay)}
          onLockActiveDay={() => handleLockDay(settings.activeDay)}
          onUnlockActiveDay={() => handleUnlockDay(settings.activeDay)}
          onAdvanceDay={handleAdvanceDay}
        />

        {/* Tab: 100-Day Compounding Roadmap Table */}
        {activeTab === 'roadmap' && (
          <CompoundingRoadmap
            days={days}
            trades={trades}
            currency={currency}
            settings={settings}
            onUpdateDayPercent={handleUpdateDayPercent}
            onApplyPreset={handleApplyPreset}
            onApplySmartCurve={handleApplySmartCurve}
            onLockDay={handleLockDay}
            onUnlockDay={handleUnlockDay}
            onSetActiveDay={handleSetActiveDay}
            onLogTradeForDay={handleOpenTradeModal}
            onViewDayTrades={(dayNum) => {
              setActiveTab('trades');
            }}
          />
        )}

        {/* Tab: Ayaan Trading Curve & Calendar Matrix */}
        {activeTab === 'calendar' && (
          <CompoundingCurveCalendar
            days={days}
            trades={trades}
            stats={stats}
            currency={currency}
            settings={settings}
            onSelectDay={handleSetActiveDay}
            onLogTradeForDay={handleOpenTradeModal}
            onLockDay={handleLockDay}
            onUnlockDay={handleUnlockDay}
          />
        )}

        {/* Tab: Nairobi Trader's Knowledge Academy & SMC Blueprint */}
        {activeTab === 'academy' && (
          <TradingAcademy
            currency={currency}
            usdToKesRate={settings.usdToKesRate}
          />
        )}

        {/* Tab: Position Sizer & M-Pesa Risk Calculator */}
        {activeTab === 'sizer' && (
          <PositionSizerCalculator
            currency={currency}
            usdToKesRate={settings.usdToKesRate}
            currentBalanceUsd={stats.currentBalanceUsd}
          />
        )}

        {/* Tab: Trade Journal */}
        {activeTab === 'trades' && (
          <TradeLogger
            trades={trades}
            currency={currency}
            settings={settings}
            onOpenTradeModal={handleOpenTradeModal}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {/* Tab 4: Discipline Vault & Lock Center */}
        {activeTab === 'discipline' && (
          <div className="py-6">
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Daily Trading Lockout Command
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Psychological Discipline Fortress
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                  Compounding $10 (KSH 1,300) into a fortune requires 100 consecutive days of walking away once your daily quota is made.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Day {settings.activeDay} Status</span>
                  <div className="text-lg font-bold text-white font-mono">
                    {activeDayRecord?.isLocked ? "🔒 LOCKED & PROTECTED" : activeDayRecord?.status === 'target_hit' ? "🎯 TARGET MET (READY TO LOCK)" : "⚡ ACTIVE IN PROGRESS"}
                  </div>
                  <p className="text-xs text-slate-500">
                    Day's PnL: {formatCurrency(activeDayRecord?.actualProfitUsd || 0, currency, settings.usdToKesRate, true)} / Target: +{formatCurrency(activeDayRecord?.targetProfitUsd || 0, currency, settings.usdToKesRate)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Next Milestone</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    Day {Math.min(100, settings.activeDay + 1)} Target: +{days[settings.activeDay]?.targetPercent || 15}%
                  </div>
                  <p className="text-xs text-slate-500">
                    Target End Balance: {formatCurrency(days[settings.activeDay]?.projectedEndUsd || 0, currency, settings.usdToKesRate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
                {activeDayRecord?.isLocked ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAdvanceDay}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
                    >
                      Advance to Day {settings.activeDay + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnlockDay(settings.activeDay)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Unlock Day {settings.activeDay}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLockDay(settings.activeDay)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Lock Session Now &amp; Secure Capital
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080e] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Ayaan Trading</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">US 100 • US 30 • XAUUSD • EURUSD</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">KES 1,300 Seed Protocol</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              100-Day Rules
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Exchange Rate &amp; Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Log/Edit Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSaveTrade={handleSaveTrade}
        initialDayNumber={tradeModalDay}
        currency={currency}
        settings={settings}
        tradeToEdit={tradeToEdit}
        dayRecord={days.find((d) => d.dayNumber === tradeModalDay)}
      />

      {/* Target Hit Discipline Vault Modal */}
      <DisciplineLockModal
        isOpen={isDisciplineModalOpen}
        onClose={() => setIsDisciplineModalOpen(false)}
        activeDayRecord={activeDayRecord}
        currency={currency}
        settings={settings}
        currentBalanceUsd={stats.currentBalanceUsd}
        onAdvanceDay={handleAdvanceDay}
        onUnlockDay={handleUnlockDay}
      />

      {/* Challenge Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        days={days}
        trades={trades}
        onImportData={handleImportData}
        onResetChallenge={handleResetChallenge}
      />

      {/* Rules & Discipline Manifesto Modal */}
      <TradingRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        currency={currency}
      />

    </div>
  );
}
