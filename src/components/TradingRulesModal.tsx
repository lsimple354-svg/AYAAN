import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Target, 
  Zap,
  Lock
} from 'lucide-react';
import { Currency } from '../types/trading';

interface TradingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const TradingRulesModal: React.FC<TradingRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b101e] border border-slate-800 p-5 sm:p-6 shadow-2xl my-auto space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">The 100-Day Compounding Manifesto</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              1
            </span>
            <div>
              <strong className="text-white block mb-0.5">The Daily Target Lock Rule</strong>
              Once your daily compounding target (10%, 15%, 20%, etc.) is reached, immediately lock your session and walk away. Never give back profits to market maker euphoria.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              2
            </span>
            <div>
              <strong className="text-white block mb-0.5">Small Account Sizing Discipline (US 100, US 30, XAUUSD, EURUSD)</strong>
              Starting from $10 (KSH 1,300) requires tight micro-lots (0.01 micro on Forex, Gold, or Indices). Never risk more than $0.80 to $1.20 per stop loss on early days.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              3
            </span>
            <div>
              <strong className="text-white block mb-0.5">Zero Revenge Trading</strong>
              If you take a loss, pause for 30 minutes. The worst account blowouts happen within 5 minutes of an emotional revenge trade.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              4
            </span>
            <div>
              <strong className="text-white block mb-0.5">Trade Institutional Confluence in Kenyan Sessions</strong>
              Trade prime windows: London Open (10:00 AM - 1:00 PM EAT) and London/NY Overlap (3:30 PM - 7:00 PM EAT). Wait for Order Block retests or FVG mitigations.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              5
            </span>
            <div>
              <strong className="text-white block mb-0.5">100 Days of Consistency &gt; 1 Day of Greed</strong>
              Compounding is mathematics, not luck. If you protect capital and stick to the 100-day schedule, the numbers compound into extraordinary freedom.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            I Commit to Trading Discipline
          </button>
        </div>

      </div>
    </div>
  );
};
