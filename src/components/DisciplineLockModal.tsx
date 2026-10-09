import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Clock, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { Currency, DayRecord, AppSettings } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';
import lockArtworkImg from '../assets/images/compound_trophy_lock_1791561136778.jpg';

interface DisciplineLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDayRecord: DayRecord | undefined;
  currency: Currency;
  settings: AppSettings;
  currentBalanceUsd: number;
  onAdvanceDay: () => void;
  onUnlockDay: (dayNumber: number) => void;
}

export const DisciplineLockModal: React.FC<DisciplineLockModalProps> = ({
  isOpen,
  onClose,
  activeDayRecord,
  currency,
  settings,
  currentBalanceUsd,
  onAdvanceDay,
  onUnlockDay,
}) => {
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 28, seconds: 45 });
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  // Trigger confetti burst on open if target met
  useEffect(() => {
    if (isOpen) {
      soundManager.playLock();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8']
        });
      } catch {
        // Ignored
      }
    }
  }, [isOpen]);

  // Simulated countdown timer to next session
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const currentDay = settings.activeDay;
  const isLocked = activeDayRecord?.isLocked;
  const targetProfit = activeDayRecord?.targetProfitUsd || 1;
  const actualProfit = activeDayRecord?.actualProfitUsd || 0;
  const targetMet = actualProfit >= targetProfit && targetProfit > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090d16] border border-amber-500/40 shadow-2xl overflow-hidden my-auto">
        
        {/* Banner with Generated Artwork */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={lockArtworkImg}
            alt="Vault Secured"
            className="w-full h-full object-cover object-center filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-sm border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                <Lock className="w-3.5 h-3.5" />
                VAULT LOCKED • DAY {currentDay}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {targetMet ? "Daily Target Secured!" : "Session Locked for Discipline"}
              </h2>
            </div>
            
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Account Value</span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {formatCurrency(currentBalanceUsd, currency, settings.usdToKesRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Key Achievements Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Day Profit Secured</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {formatCurrency(actualProfit, currency, settings.usdToKesRate, true)}
              </div>
              <span className="text-[10px] text-emerald-400/80">
                Target was +{formatCurrency(targetProfit, currency, settings.usdToKesRate)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Growth Multiplier</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {(currentBalanceUsd / settings.initialBalanceUsd).toFixed(2)}x
              </div>
              <span className="text-[10px] text-slate-400">
                From {formatCurrency(settings.initialBalanceUsd, currency, settings.usdToKesRate)} seed
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Next Session In</span>
              <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-400">
                Market resets tomorrow
              </span>
            </div>
          </div>

          {/* Psychological Fortress Advice */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>The Iron Law of 100-Day Compounding</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Overtrading is the #1 killer of small trading accounts. You have fulfilled your mathematical quota for Day {currentDay}. Turn off MetaTrader, TradingView, or Deriv and enjoy your day. Consistency beats excitement every single time."
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {showOverrideConfirm ? (
              <div className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/40">
                <span className="text-xs text-rose-300">Are you sure you want to break discipline?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUnlockDay(currentDay);
                      setShowOverrideConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white cursor-pointer"
                  >
                    Yes, Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverrideConfirm(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(true)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Emergency Unlock Session
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                  >
                    Keep Locked &amp; Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTargetHit();
                      onAdvanceDay();
                      onClose();
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Proceed to Day {currentDay + 1}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
