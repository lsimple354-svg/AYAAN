import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  Shield, 
  Save,
  Check
} from 'lucide-react';
import { AppSettings, DayRecord, Trade, Currency } from '../types/trading';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  days: DayRecord[];
  trades: Trade[];
  onImportData: (data: { settings: AppSettings; days: DayRecord[]; trades: Trade[] }) => void;
  onResetChallenge: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  days,
  trades,
  onImportData,
  onResetChallenge,
}) => {
  const [initialBalance, setInitialBalance] = useState<number>(settings.initialBalanceUsd);
  const [exchangeRate, setExchangeRate] = useState<number>(settings.usdToKesRate);
  const [activeDay, setActiveDay] = useState<number>(settings.activeDay);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [autoLockOnTarget, setAutoLockOnTarget] = useState<boolean>(settings.autoLockOnTarget);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      initialBalanceUsd: Math.max(1, initialBalance),
      usdToKesRate: Math.max(1, exchangeRate),
      activeDay: Math.max(1, Math.min(100, activeDay)),
      soundEnabled,
      autoLockOnTarget,
    });
    soundManager.enabled = soundEnabled;
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      days,
      trades,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexCompound-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.days && parsed.trades) {
          onImportData(parsed);
          alert('Challenge data successfully restored!');
          onClose();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b101d] border border-slate-800 p-5 sm:p-6 shadow-2xl my-auto space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Challenge Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Starting Seed Capital & Exchange Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Seed Balance ($ USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  ≈ KSH {(initialBalance * exchangeRate).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                USD to KES Exchange Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  1 $ = KSH
                </span>
              </div>
            </div>
          </div>

          {/* Current Active Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Active Trading Day (1 - 100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={activeDay}
              onChange={(e) => setActiveDay(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Auto Lock When Target Hit</span>
                <span className="text-[11px] text-slate-400">Triggers discipline vault as soon as daily profit % is reached</span>
              </div>
              <input
                type="checkbox"
                checked={autoLockOnTarget}
                onChange={(e) => setAutoLockOnTarget(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Sound Effects</span>
                <span className="text-[11px] text-slate-400">Audio feedback for target hits, wins, and vault lock</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>

          {/* Backup & Reset actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Data Management &amp; Backups
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset the challenge to Day 1 with initial $10? All trades will be cleared.')) {
                  onResetChallenge();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 border border-rose-900/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Challenge to Ground Zero</span>
            </button>
          </div>

          {/* Form Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
