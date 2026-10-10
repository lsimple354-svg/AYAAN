import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Sparkles,
  Lock,
  Unlock,
  Target
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PreSessionChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'bias',
    title: '1. Higher Timeframe Directional Bias',
    description: 'Confirmed Daily / 4H Market Structure (Bullish Order Flow or Bearish Discount mitigation).',
    required: true,
  },
  {
    id: 'liquidity',
    title: '2. Liquidity Sweep Raid Complete',
    description: 'Asian High/Low, Previous Day High/Low, or Equal Highs swept before expecting reversal expansion.',
    required: true,
  },
  {
    id: 'poi',
    title: '3. Institutional Point of Interest (OB / FVG)',
    description: 'Price is entering a fresh unmitigated Order Block or Fair Value Gap imbalance on the 15m/5m.',
    required: true,
  },
  {
    id: 'news',
    title: '4. Economic Calendar Red-Folders Checked',
    description: 'No CPI, NFP, or FOMC news dropping in the next 15-30 minutes on USD or Gold.',
    required: true,
  },
  {
    id: 'risk',
    title: '5. Lot Size & Max Risk in KSH Verified',
    description: 'Lot sized to risk max 1%-2% of account equity. Pre-determined stop loss placed immediately upon entry.',
    required: true,
  },
  {
    id: 'psychology',
    title: '6. Emotional State: Calm & Non-Reactive',
    description: 'No revenge trading, no urge to make back past losses, no chasing fast candles on 1-minute chart.',
    required: true,
  },
];

export const PreSessionChecklistModal: React.FC<PreSessionChecklistModalProps> = ({
  isOpen,
  onClose,
  sessionName = 'London / NY Open Session',
}) => {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    soundManager.playClick();
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(i => i !== id));
      setIsApproved(false);
    } else {
      const next = [...checkedIds, id];
      setCheckedIds(next);
      if (next.length === CHECKLIST_ITEMS.length) {
        soundManager.playTargetHit();
        setIsApproved(true);
      }
    }
  };

  const handleApproveAll = () => {
    soundManager.playTargetHit();
    setCheckedIds(CHECKLIST_ITEMS.map(i => i.id));
    setIsApproved(true);
  };

  const handleReset = () => {
    soundManager.playClick();
    setCheckedIds([]);
    setIsApproved(false);
  };

  const allChecked = checkedIds.length === CHECKLIST_ITEMS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-[#0a0f1d] border border-emerald-500/30 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pre-Execution Discipline Protocol
              </h3>
              <p className="text-xs text-slate-400">
                Institutional 6-Point Audit for {sessionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Audit Completion:</span>
            <span className={allChecked ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {checkedIds.length} / {CHECKLIST_ITEMS.length} Criteria Passed
            </span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${(checkedIds.length / CHECKLIST_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Status Stamp */}
        {allChecked ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 text-xs">DISCIPLINED EXECUTION APPROVED</span>
                <p className="text-[11px] text-slate-300">All rules met. You have mathematical permission to execute.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              VERIFIED
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Never gamble. Only press Buy or Sell when all 6 institutional conditions align.
            </p>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className={`font-bold ${isChecked ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApproveAll}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Check All
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              {allChecked ? 'Proceed to Execute' : 'Save & Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
