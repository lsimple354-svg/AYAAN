import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Lock, 
  Unlock, 
  Plus, 
  Settings, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  ListFilter, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Calculator, 
  GraduationCap, 
  CheckSquare, 
  Upload, 
  ArrowLeftRight,
  Target
} from 'lucide-react';
import { Currency, AppSettings, DayRecord } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

export type AppTab = 'dashboard' | 'funded' | 'roadmap' | 'calendar' | 'news' | 'academy' | 'sizer' | 'trades' | 'discipline';

interface NavbarProps {
  currency: Currency;
  onCurrencyToggle: (curr: Currency) => void;
  settings: AppSettings;
  activeDayRecord: DayRecord | undefined;
  currentBalanceUsd: number;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenTradeModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenRulesModal: () => void;
  onToggleSound: () => void;
  onOpenDisciplineVault: () => void;
  onToggleAccountMode: () => void;
  onOpenChecklistModal?: () => void;
  onOpenStatementImporter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyToggle,
  settings,
  activeDayRecord,
  currentBalanceUsd,
  activeTab,
  onTabChange,
  onOpenTradeModal,
  onOpenSettingsModal,
  onOpenRulesModal,
  onToggleSound,
  onOpenDisciplineVault,
  onToggleAccountMode,
  onOpenChecklistModal,
  onOpenStatementImporter,
}) => {
  const isLocked = activeDayRecord?.isLocked;
  const targetHit = activeDayRecord?.status === 'target_hit' || isLocked;
  const isFundedMode = settings.propFirm.accountMode === 'funded';
  const prop = settings.propFirm;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & Platform Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border shadow-lg transition-colors ${
              isFundedMode
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/40 shadow-cyan-500/10'
                : 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-emerald-500/40 shadow-emerald-500/10'
            }`}>
              {isFundedMode ? (
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              ) : (
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              )}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isFundedMode ? 'bg-cyan-400' : 'bg-emerald-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isFundedMode ? 'bg-cyan-500' : 'bg-emerald-500'
                }`}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Ayaan<span className={isFundedMode ? "text-cyan-400 font-extrabold" : "text-emerald-400 font-extrabold"}>Trading</span>
                </h1>
              </div>

              {/* Status Subtitle based on Active Platform */}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                {isFundedMode ? (
                  <>
                    <span className="text-cyan-400 font-semibold">{prop.propFirm} ${prop.accountSize >= 1000 ? `${prop.accountSize / 1000}K` : prop.accountSize}</span>
                    <span className="text-slate-600 hidden xs:inline">•</span>
                    <span className="hidden xs:inline text-slate-300">{prop.stage === 'funded' ? 'Master' : prop.stage === 'phase2' ? 'Phase 2' : 'Phase 1'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-semibold">Day {settings.activeDay}/100</span>
                    <span className="text-slate-600 hidden xs:inline">•</span>
                    <span className={targetHit ? "text-emerald-400 font-semibold hidden xs:inline" : "text-slate-400 hidden xs:inline"}>
                      {targetHit ? "🎯 Hit" : `+${activeDayRecord?.targetPercent || 10}% Goal`}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Center: THE PLATFORM SWITCHER BUTTON (Unmissable Dual-Mode Toggle) */}
          <div className="flex items-center">
            <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  if (!isFundedMode) onToggleAccountMode();
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isFundedMode
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40 ring-1 ring-cyan-400/30'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                }`}
                title="Switch to PropFirms Platform (FTMO, FundingPips, FundedNext, Alpha Capital)"
              >
                <ShieldCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFundedMode ? 'text-cyan-200 animate-pulse' : 'text-slate-500'}`} />
                <span>PropFirms</span>
                {isFundedMode && (
                  <span className="hidden md:inline-flex text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/70 text-cyan-200 font-mono ml-0.5">
                    ${prop.accountSize >= 1000 ? `${prop.accountSize / 1000}K` : prop.accountSize}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isFundedMode) onToggleAccountMode();
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  !isFundedMode
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/40 ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900/60'
                }`}
                title="Switch to Daily Compounding Platform (100-Day $10 / KES 1,300 Seed Challenge)"
              >
                <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isFundedMode ? 'text-emerald-200 animate-pulse' : 'text-slate-500'}`} />
                <span className="hidden xs:inline">Daily</span>
                <span>Compounding</span>
                {!isFundedMode && (
                  <span className="hidden md:inline-flex text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/70 text-emerald-200 font-mono ml-0.5">
                    $10 Seed
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Controls: Balance, Currency Switcher, Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Live Balance / Equity Badge */}
            <div className="hidden lg:flex flex-col items-end px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {isFundedMode ? `${prop.propFirm} Equity` : 'Compounded Balance'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-base font-extrabold font-mono tracking-tight ${
                  isFundedMode ? 'text-cyan-400' : 'text-emerald-400'
                }`}>
                  {isFundedMode 
                    ? formatCurrency(prop.accountSize + (activeDayRecord?.actualProfitUsd || 0), currency, settings.usdToKesRate)
                    : formatCurrency(currentBalanceUsd, currency, settings.usdToKesRate)
                  }
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({currency === 'USD' 
                    ? `KSH ${((isFundedMode ? prop.accountSize + (activeDayRecord?.actualProfitUsd || 0) : currentBalanceUsd) * settings.usdToKesRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}` 
                    : `$${(isFundedMode ? prop.accountSize + (activeDayRecord?.actualProfitUsd || 0) : currentBalanceUsd).toFixed(0)}`
                  })
                </span>
              </div>
            </div>

            {/* Currency Switcher Toggle: USD vs KSH */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onCurrencyToggle('USD');
                }}
                className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? isFundedMode ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View in US Dollars ($)"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">USD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onCurrencyToggle('KES');
                }}
                className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'KES'
                    ? isFundedMode ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View in Kenyan Shillings (KSH)"
              >
                <span className="font-extrabold text-[11px]">KES</span>
              </button>
            </div>

            {/* Discipline Vault Lock Pill */}
            <button
              onClick={onOpenDisciplineVault}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isLocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10 animate-pulse'
                  : targetHit
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
              title="Discipline & Lockout Status"
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">LOCKED</span>
                </>
              ) : targetHit ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TARGET MET</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span>OPEN</span>
                </>
              )}
            </button>

            {/* Pre-Session Execution Checklist Button */}
            {onOpenChecklistModal && (
              <button
                type="button"
                onClick={onOpenChecklistModal}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Open Pre-Execution 6-Point Audit Checklist"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audit</span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Primary Action: Log Trade Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenTradeModal();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 shadow-lg transition-all active:scale-95 cursor-pointer ${
                isFundedMode
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-cyan-500/20 hover:shadow-cyan-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Log Trade</span>
              <span className="sm:hidden">Log</span>
            </button>

            {/* Utility Icons */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              {onOpenStatementImporter && (
                <button
                  type="button"
                  onClick={onOpenStatementImporter}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Import MT4/MT5 Statements"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title={settings.soundEnabled ? 'Mute Sounds' : 'Enable Audio Feedback'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onOpenRulesModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="100-Day Compounding Rules & Psychology"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenSettingsModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Settings & Exchange Rate"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Tab Navigation Bar - strictly segmented between PropFirms Platform and Daily Compounding Platform */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {isFundedMode ? (
            /* ==============================================================
               PROP FIRMS WORKSPACE TABS (No Compounding Sections Visible)
               ============================================================== */
            <>
              {/* Prop Firm Desk Tab */}
              <button
                onClick={() => onTabChange('funded')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'funded'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm font-bold ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="flex items-center gap-1">
                  <span>Prop Firm Desk</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </span>
              </button>

              {/* Prop Trade Log */}
              <button
                onClick={() => onTabChange('trades')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'trades'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm font-bold ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ListFilter className="w-4 h-4 text-cyan-400" />
                <span>Prop Trades Log</span>
              </button>

              {/* Funded Risk Sizer */}
              <button
                onClick={() => onTabChange('sizer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'sizer'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm font-bold ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Funded Risk &amp; Sizer</span>
              </button>

              {/* High-Impact News Calendar */}
              <button
                onClick={() => onTabChange('news')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="flex items-center gap-1">
                  <span>High-Impact News</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                </span>
              </button>

              {/* Prop Firm Rules & Matrix */}
              <button
                onClick={() => onTabChange('academy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'academy'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm font-bold ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Prop Rules &amp; Matrix</span>
              </button>
            </>
          ) : (
            /* ==============================================================
               DAILY COMPOUNDING PLATFORM TABS (No Prop Firm Desk Visible)
               ============================================================== */
            <>
              {/* AdamsKering Trader Dashboard Tab */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500/20 text-[#d9a441] border border-[#d9a441]/60 shadow-sm font-bold ring-1 ring-[#d9a441]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Target className="w-4 h-4 text-[#d9a441]" />
                <span className="flex items-center gap-1">
                  <span>Dashboard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d9a441] animate-pulse" />
                </span>
              </button>

              {/* 100-Day Roadmap Tab */}
              <button
                onClick={() => onTabChange('roadmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'roadmap'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm font-bold ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="flex items-center gap-1">
                  <span>100-Day Roadmap ($10 Seed)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </button>

              {/* Compounding Curve & Calendar */}
              <button
                onClick={() => onTabChange('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm font-bold ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="flex items-center gap-1">
                  <span>Curve &amp; Calendar</span>
                </span>
              </button>

              {/* Trade Journal & History */}
              <button
                onClick={() => onTabChange('trades')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'trades'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm font-bold ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ListFilter className="w-4 h-4 text-emerald-400" />
                <span>Trade Journal</span>
              </button>

              {/* Micro Sizer & Risk */}
              <button
                onClick={() => onTabChange('sizer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'sizer'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm font-bold ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Micro Sizer &amp; M-Pesa</span>
              </button>

              {/* High-Impact News Calendar */}
              <button
                onClick={() => onTabChange('news')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="flex items-center gap-1">
                  <span>News Calendar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                </span>
              </button>

              {/* Discipline Vault Lockout */}
              <button
                onClick={() => onTabChange('discipline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'discipline'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm font-bold ring-1 ring-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="flex items-center gap-1">
                  <span>Discipline Vault</span>
                  {isLocked && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                </span>
              </button>

              {/* Trading Academy */}
              <button
                onClick={() => onTabChange('academy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'academy'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-sm font-bold ring-1 ring-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Trading Academy</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

