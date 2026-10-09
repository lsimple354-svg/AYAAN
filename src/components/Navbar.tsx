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
  GraduationCap
} from 'lucide-react';
import { Currency, AppSettings, DayRecord } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';

export type AppTab = 'roadmap' | 'calendar' | 'academy' | 'sizer' | 'trades' | 'discipline';

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
  onOpenDisciplineVault
}) => {
  const isLocked = activeDayRecord?.isLocked;
  const targetHit = activeDayRecord?.status === 'target_hit' || isLocked;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & Active Day */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Ayaan<span className="text-emerald-400 font-extrabold">Trading</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 uppercase tracking-wider">
                  <span>🇰🇪</span>
                  <span>KES 1,300 Seed</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <span>Day {settings.activeDay}/100</span>
                <span className="text-slate-600">•</span>
                <span className={targetHit ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                  {targetHit ? "🎯 Daily Target Met" : `Goal: +${activeDayRecord?.targetPercent || 10}%`}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Balance & Currency Switcher */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Compounded Balance */}
            <div className="hidden md:flex flex-col items-end px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Account Balance</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                  {formatCurrency(currentBalanceUsd, currency, settings.usdToKesRate)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({currency === 'USD' ? `KSH ${(currentBalanceUsd * settings.usdToKesRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${currentBalanceUsd.toFixed(2)}`})
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
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View in US Dollars ($)"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>USD ($)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onCurrencyToggle('KES');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'KES'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View in Kenyan Shillings (KSH)"
              >
                <span className="font-extrabold text-[11px]">KSH</span>
                <span className="hidden sm:inline">KES</span>
              </button>
            </div>

            {/* Discipline Vault Lock Pill */}
            <button
              onClick={onOpenDisciplineVault}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
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
                  <span className="hidden sm:inline">HIT &amp; SECURE</span>
                  <span className="sm:hidden">HIT</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">DAY {settings.activeDay} OPEN</span>
                  <span className="sm:hidden">OPEN</span>
                </>
              )}
            </button>

            {/* Primary Action: Log Trade Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenTradeModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Log Trade</span>
              <span className="sm:hidden">Trade</span>
            </button>

            {/* Utility Icons */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
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

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => onTabChange('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>100-Day Roadmap</span>
          </button>

          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="flex items-center gap-1">
              <span>Curve &amp; Calendar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
          </button>

          <button
            onClick={() => onTabChange('academy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'academy'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Trading Academy</span>
          </button>

          <button
            onClick={() => onTabChange('sizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sizer'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Sizer &amp; M-Pesa</span>
          </button>

          <button
            onClick={() => onTabChange('trades')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trades'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Trade Journal</span>
          </button>

          <button
            onClick={() => onTabChange('discipline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'discipline'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="flex items-center gap-1">
              <span>Discipline Vault</span>
              {isLocked && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};

