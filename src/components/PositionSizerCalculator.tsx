import React, { useState } from 'react';
import { 
  Calculator, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Percent, 
  Coins,
  Layers,
  Sparkles
} from 'lucide-react';
import { Currency } from '../types/trading';
import { formatCurrency } from '../utils/compounding';

interface PositionSizerCalculatorProps {
  currency: Currency;
  usdToKesRate: number;
  currentBalanceUsd: number;
}

export const PositionSizerCalculator: React.FC<PositionSizerCalculatorProps> = ({
  currency,
  usdToKesRate,
  currentBalanceUsd,
}) => {
  const [balance, setBalance] = useState<number>(currentBalanceUsd || 10);
  const [riskPercent, setRiskPercent] = useState<number>(5);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [assetType, setAssetType] = useState<'us100' | 'us30' | 'xauusd' | 'forex'>('us100');
  const [rewardRatio, setRewardRatio] = useState<number>(2.5);

  // Calculations
  const maxRiskAmountUsd = (balance * riskPercent) / 100;
  const maxRiskAmountKes = maxRiskAmountUsd * usdToKesRate;
  const targetRewardUsd = maxRiskAmountUsd * rewardRatio;
  const targetRewardKes = targetRewardUsd * usdToKesRate;

  // Lot sizing formulas based on asset specifications
  let calculatedLot = 0.01;
  let pipOrPointValueUsd = 0.10;
  let notes = '';

  if (assetType === 'us100') {
    // US 100 (Nasdaq): 1 index point move at 0.01 micro lot = $0.20 to $1.00 depending on broker
    // formula: Lot = maxRisk / (stopLossPips * 10)
    calculatedLot = Math.max(0.01, parseFloat((maxRiskAmountUsd / (Math.max(10, stopLossPips) * 1.5)).toFixed(2)));
    notes = 'US 100 moves rapidly on NY Open (3:30 PM EAT). Recommended 0.01 lot with strict 15-25 point stop.';
  } else if (assetType === 'us30') {
    // US 30 (Dow Jones): High point momentum
    calculatedLot = Math.max(0.01, parseFloat((maxRiskAmountUsd / (Math.max(15, stopLossPips) * 2.0)).toFixed(2)));
    notes = 'US 30 has high point volatility (200-500 pts daily). On a $10 account, wait for deep Order Block retests only.';
  } else if (assetType === 'xauusd') {
    // Gold XAUUSD: 10 pips ($1.00 move) on 0.01 lot = $1.00
    calculatedLot = Math.max(0.01, parseFloat((maxRiskAmountUsd / (Math.max(10, stopLossPips) * 1.0)).toFixed(2)));
    notes = 'Gold moves $10-$30 daily. 0.01 lot is $0.10 per pip. Tight stop loss (15-20 pips) prevents small account stop-outs.';
  } else {
    // Forex EURUSD / GBPUSD: 1 pip on 0.01 lot = $0.10
    calculatedLot = Math.max(0.01, parseFloat((maxRiskAmountUsd / (Math.max(10, stopLossPips) * 1.0)).toFixed(2)));
    notes = 'Forex EURUSD / GBPUSD offers the lowest spreads. 1 pip on 0.01 is $0.10 (KSH 13). Safest for small $10 seed growth.';
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Calculator className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-bold text-white">Kenyan Trader Risk &amp; Lot Sizing Engine</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
            $10 (KES 1,300) Seed Calibration
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Small account survival requires mathematical lot sizing. Know your exact risk in Kenyan Shillings before pressing BUY or SELL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Parameters */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Position Parameters</span>
          </h4>

          {/* Account Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Equity / Balance
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                ≈ KSH {(balance * usdToKesRate).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Asset Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Instrument Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAssetType('us100')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  assetType === 'us100'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                US 100 (NAS100)
              </button>

              <button
                type="button"
                onClick={() => setAssetType('us30')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  assetType === 'us30'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                US 30 (Dow Jones)
              </button>

              <button
                type="button"
                onClick={() => setAssetType('xauusd')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  assetType === 'xauusd'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                XAUUSD (Gold Spot)
              </button>

              <button
                type="button"
                onClick={() => setAssetType('forex')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  assetType === 'forex'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                EURUSD &amp; Forex
              </button>
            </div>
          </div>

          {/* Risk % per trade */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Risk Per Trade (% of Account)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{riskPercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1% (Ultra Safe)</span>
              <span>5% (Balanced)</span>
              <span>10% (Aggressive)</span>
              <span>25% (High Octane)</span>
            </div>
          </div>

          {/* Stop Loss Distance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stop Loss (Pips / Points)
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Risk-to-Reward (R:R)
              </label>
              <select
                value={rewardRatio}
                onChange={(e) => setRewardRatio(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value={1.5}>1 : 1.5</option>
                <option value={2.0}>1 : 2.0 (Solid)</option>
                <option value={2.5}>1 : 2.5 (Recommended)</option>
                <option value={3.0}>1 : 3.0 (Institutional)</option>
                <option value={4.0}>1 : 4.0 (Sniper)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            {notes}
          </div>
        </div>

        {/* Right: Calculated Risk Output & M-Pesa Cashout Milestones */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Output Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Recommended Execution Metrics</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                Real-Time Sizing
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Recommended Lot Size</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {calculatedLot}
                </div>
                <span className="text-[10px] text-slate-500">Execution Volume</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Max Loss if SL Hit</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                  -{formatCurrency(maxRiskAmountUsd, currency, usdToKesRate)}
                </div>
                <span className="text-[10px] text-slate-500">
                  (-KSH {maxRiskAmountKes.toFixed(0)})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Target Profit (TP)</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  +{formatCurrency(targetRewardUsd, currency, usdToKesRate)}
                </div>
                <span className="text-[10px] text-slate-500">
                  (+KSH {targetRewardKes.toFixed(0)})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Required Win Rate to BE</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
                  {((1 / (1 + rewardRatio)) * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">Only 1 in 3 trades needed!</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                At a 1:{rewardRatio} Risk-to-Reward, winning just 40% of trades yields massive compound growth while protecting your KSH {balance * usdToKesRate} balance.
              </span>
            </div>
          </div>

          {/* M-Pesa Profit Banking Milestone Strategy */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">M-Pesa Profit-Banking Protocol</h4>
            </div>
            <p className="text-xs text-slate-400">
              The biggest flaw of compounding challenges is failing to pay yourself. In Kenya, trading becomes real when you withdraw to your M-Pesa wallet:
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">Milestone 1: Account reaches $30 (KSH 3,900)</strong>
                  <div className="text-[11px] text-slate-400">Action: Withdraw your initial $10 (KSH 1,300) seed to M-Pesa!</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Risk Free
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">Milestone 2: Account reaches $100 (KSH 13,000)</strong>
                  <div className="text-[11px] text-slate-400">Action: Withdraw $30 (KSH 3,900) to M-Pesa. Pay a bill or buy data.</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  Pay Yourself
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white">Milestone 3: Account reaches $500+ (KSH 65,000+)</strong>
                  <div className="text-[11px] text-slate-400">Action: Withdraw 20% weekly to M-Pesa savings or bank deposit.</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Empire Building
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
