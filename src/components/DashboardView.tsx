import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Flame, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Bell, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { Currency, Trade, AppSettings, DayRecord } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';

export interface DashboardViewProps {
  settings: AppSettings;
  currency: Currency;
  trades: Trade[];
  dayRecords?: DayRecord[];
  startingBalanceUsd?: number;
  heroImages?: string[];
  onAddTrade: () => void;
  onEditTrade: (t: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onEnableNotifications?: () => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
}

const BRASS = '#d9a441';
const GOLD = '#e8b84a';
const JADE = '#2ee59d';
const CORAL = '#ff5d78';
const CYAN = '#5cc8ff';

/* ---------- Small calculation helpers ---------- */
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

/* Signature AdamsKering Geometric Peak Logo */
export const AdamsKeringLogo: React.FC<{ size?: number }> = ({ size = 38 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0 drop-shadow-md">
      <defs>
        <linearGradient id={`ak_grad_${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6d77f" />
          <stop offset="50%" stopColor="#e8b84a" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <filter id={`ak_glow_${size}`} x1="-20%" y1="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Background Rounded Shield */}
      <rect width="64" height="64" rx="16" fill="#0b0f19" stroke="rgba(232, 184, 74, 0.3)" strokeWidth="1.5" />
      {/* Golden Mountain Peak Apex */}
      <path
        d="M14 48 L32 14 L50 48"
        fill="none"
        stroke={`url(#ak_grad_${size})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Candlestick 1: Bullish Green */}
      <rect x="20" y="34" width="5" height="11" rx="1.5" fill="#2ee59d" />
      <line x1="22.5" y1="30" x2="22.5" y2="48" stroke="#2ee59d" strokeWidth="1.2" />
      {/* Candlestick 2: Bearish Coral */}
      <rect x="29.5" y="27" width="5" height="15" rx="1.5" fill="#ff5d78" />
      <line x1="32" y1="23" x2="32" y2="45" stroke="#ff5d78" strokeWidth="1.2" />
      {/* Candlestick 3: Bullish Green */}
      <rect x="39" y="36" width="5" height="9" rx="1.5" fill="#2ee59d" />
      <line x1="41.5" y1="32" x2="41.5" y2="48" stroke="#2ee59d" strokeWidth="1.2" />
      {/* Upward Impulse Trendline */}
      <path
        d="M17 41 L26 33 L35 39 L47 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

/* Generated market art scenes with smooth crossfade */
const SceneArt: React.FC<{ index: number }> = ({ index }) => {
  const candles = useMemo(() => {
    let r = (index + 1) * 7919;
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    let p = 150;
    return Array.from({ length: 32 }, (_, k) => {
      const o = p;
      const c = Math.max(50, Math.min(230, o + (rnd() - (index === 1 ? 0.44 : 0.47)) * 48));
      p = c;
      return { 
        x: 18 + k * 25, 
        o, 
        c, 
        hi: Math.min(o, c) - rnd() * 16, 
        lo: Math.max(o, c) + rnd() * 16 
      };
    });
  }, [index]);

  const configs = [
    {
      bg: 'linear-gradient(135deg, #090e1a 0%, #111d33 100%)',
      up: JADE,
      dn: CORAL,
      glow: 'rgba(46, 229, 157, 0.15)',
      badge: 'US 100 · NASDAQ MOMENTUM',
      accent: CYAN
    },
    {
      bg: 'linear-gradient(135deg, #140f06 0%, #30220c 100%)',
      up: GOLD,
      dn: '#c27803',
      glow: 'rgba(232, 184, 74, 0.2)',
      badge: 'GOLD (XAUUSD) · SAFE HAVEN',
      accent: GOLD
    },
    {
      bg: 'linear-gradient(135deg, #071318 0%, #0d2833 100%)',
      up: JADE,
      dn: CORAL,
      glow: 'rgba(92, 200, 255, 0.15)',
      badge: 'US 30 · DOW JONES STRUCTURE',
      accent: JADE
    }
  ];

  const cfg = configs[index % configs.length];

  return (
    <svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id={`sc_rad_${index}`} cx="70%" cy="30%" r="70%">
          <stop offset="0%" stopColor={cfg.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="800" height="280" fill={cfg.bg} />
      <rect width="800" height="280" fill={`url(#sc_rad_${index})`} />

      {/* Grid lines */}
      {[50, 95, 140, 185, 230].map((y) => (
        <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#ffffff" opacity=".05" strokeDasharray="4 4" />
      ))}

      {/* Gold Au Medal for Gold Scene */}
      {index === 1 && (
        <g transform="translate(680, 80)">
          <circle cx="0" cy="0" r="46" fill="url(#gold_grad)" stroke="#f6d77f" strokeWidth="2.5" opacity="0.9" />
          <circle cx="0" cy="0" r="41" fill="none" stroke="#b8860b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <text x="0" y="10" textAnchor="middle" fill="#1a1405" fontSize="28" fontWeight="800" fontFamily="Sora">Au</text>
          <text x="0" y="24" textAnchor="middle" fill="#1a1405" fontSize="9" fontWeight="700" letterSpacing="1">79 · 197.0</text>
          <defs>
            <linearGradient id="gold_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff0b8" />
              <stop offset="50%" stopColor="#e8b84a" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
        </g>
      )}

      {/* Candlesticks */}
      {candles.map((c, k) => {
        const up = c.c < c.o;
        const col = up ? cfg.up : cfg.dn;
        return (
          <g key={k}>
            <line x1={c.x} x2={c.x} y1={c.hi} y2={c.lo} stroke={col} strokeWidth="1.4" opacity="0.85" />
            <rect
              x={c.x - 7}
              y={Math.min(c.o, c.c)}
              width="14"
              height={Math.max(4, Math.abs(c.c - c.o))}
              rx="2"
              fill={col}
              opacity="0.9"
            />
          </g>
        );
      })}
    </svg>
  );
};

/* Elevated Hero Banner with rotating quotes and market setups */
const HeroSection: React.FC<{
  images?: string[];
  activeDay: number;
  todayTargetUsd: number;
  todayPnlUsd: number;
  currency: Currency;
  rate: number;
}> = ({ activeDay, todayTargetUsd, todayPnlUsd, currency, rate }) => {
  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    { title: 'US 100 · Nasdaq Momentum', sub: 'Trade the plan, not the feeling. One high-confluence 15m order block execution is enough.' },
    { title: 'Gold (XAUUSD) · Safe-Haven Drive', sub: 'Wait for the London/NY overlap (3:30 PM EAT). Protect your seed capital before targeting expansion.' },
    { title: 'US 30 · Dow Jones Liquidity Raid', sub: 'Patience over impulse. A liquidity sweep plus a break of structure confirms the move.' },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
    }, 6000);
    return () => clearInterval(id);
  }, [scenes.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const targetMet = todayPnlUsd >= todayTargetUsd && todayTargetUsd > 0;

  return (
    <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden bg-[#070b14] border border-amber-500/20 shadow-2xl mb-6">
      {/* 3 Crossfading Scenes */}
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeScene ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <SceneArt index={idx} />
        </div>
      ))}

      {/* Dark Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/90 via-transparent to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between z-10">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-[#f6d77f] border border-amber-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#f6d77f]" />
              <span>AdamsKering Trader</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900/80 text-slate-300 border border-slate-700">
              100-Day Discipline System
            </span>
          </div>

          {/* Target Status Pill */}
          <div className="flex items-center gap-1.5">
            {targetMet ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Met! Lock &amp; Protect</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Day {activeDay} Active Session</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Hero Headline */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400/90 font-bold">
              {scenes[activeScene].title}
            </span>
          </div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
            {greeting}, Trader. <span className="text-[#f6d77f]">Day {activeDay} of 100.</span>
          </h1>
          <p className="font-sora text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {scenes[activeScene].sub}
          </p>
        </div>
      </div>

      {/* Scene Dots */}
      <div className="absolute right-6 bottom-6 flex items-center gap-1.5 z-20">
        {[0, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => setActiveScene(s)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              s === activeScene ? 'w-7 bg-amber-400' : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Switch to scene ${s + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* Interactive Equity vs Plan Chart with Log Scale & Tooltip */
const EquityChart: React.FC<{
  plan: number[];
  actual: number[];
  currency: Currency;
  rate: number;
  activeDay: number;
}> = ({ plan, actual, currency, rate, activeDay }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [scaleMode, setScaleMode] = useState<'log' | 'linear'>('log');

  const W = 600;
  const H = 220;
  const padLeft = 14;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 24;

  const allValues = [...plan, ...actual];
  const minVal = Math.max(0.1, Math.min(...allValues));
  const maxVal = Math.max(minVal * 1.5, ...allValues);

  const getX = (dayIdx: number) => {
    return padLeft + (dayIdx / 100) * (W - padLeft - padRight);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, val);
    if (scaleMode === 'log') {
      const logMin = Math.log(minVal);
      const logMax = Math.log(maxVal);
      const ratio = (Math.log(clamped) - logMin) / (logMax - logMin || 1);
      return H - padBottom - ratio * (H - padTop - padBottom);
    } else {
      const ratio = (clamped - minVal) / (maxVal - minVal || 1);
      return H - padBottom - ratio * (H - padTop - padBottom);
    }
  };

  const planPoints = plan.map((v, i) => `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`).join(' ');
  const actualPoints = actual.map((v, i) => `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`).join(' ');

  // Hovered coordinates
  const activeHoverIdx = hoverIndex ?? Math.min(activeDay, actual.length - 1);
  const hoverPlanVal = plan[activeHoverIdx] || plan[plan.length - 1];
  const hoverActualVal = actual[activeHoverIdx] !== undefined ? actual[activeHoverIdx] : null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#e8b84a]" />
            <span>Target Plan</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-3.5 h-1 bg-[#2ee59d] rounded-full" />
            <span>Actual Growth</span>
          </span>
        </div>

        {/* Scale Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setScaleMode('log')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              scaleMode === 'log' ? 'bg-amber-500/20 text-[#f6d77f] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Log Scale
          </button>
          <button
            type="button"
            onClick={() => setScaleMode('linear')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              scaleMode === 'linear' ? 'bg-amber-500/20 text-[#f6d77f] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Linear
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * W;
            const approxDay = Math.round(((relX - padLeft) / (W - padLeft - padRight)) * 100);
            const clamped = Math.max(0, Math.min(100, approxDay));
            setHoverIndex(clamped);
          }}
        >
          {/* Subtle horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((r, k) => {
            const yPos = H - padBottom - r * (H - padTop - padBottom);
            return (
              <line
                key={k}
                x1={padLeft}
                x2={W - padRight}
                y1={yPos}
                y2={yPos}
                stroke="#ffffff"
                opacity="0.06"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Plan Curve: Gold Dashed Line */}
          <polyline
            points={planPoints}
            fill="none"
            stroke={GOLD}
            strokeWidth="2.2"
            strokeDasharray="5 4"
            opacity="0.9"
          />

          {/* Actual Curve: Jade Solid Line */}
          {actual.length > 1 && (
            <polyline
              points={actualPoints}
              fill="none"
              stroke={JADE}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover indicator vertical line */}
          {activeHoverIdx !== null && (
            <line
              x1={getX(activeHoverIdx)}
              x2={getX(activeHoverIdx)}
              y1={padTop}
              y2={H - padBottom}
              stroke="#ffffff"
              opacity="0.25"
              strokeDasharray="2 2"
            />
          )}

          {/* Hover indicator dot for actual */}
          {hoverActualVal !== null && activeHoverIdx !== null && (
            <circle
              cx={getX(activeHoverIdx)}
              cy={getY(hoverActualVal)}
              r="5"
              fill={JADE}
              stroke="#0b0f19"
              strokeWidth="2"
            />
          )}

          {/* Hover indicator dot for plan */}
          {activeHoverIdx !== null && (
            <circle
              cx={getX(activeHoverIdx)}
              cy={getY(hoverPlanVal)}
              r="4"
              fill={GOLD}
              stroke="#0b0f19"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Live Hover Info Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs border-t border-slate-800/80 font-mono">
          <span className="text-slate-400">
            Day {activeHoverIdx} Milestone
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[#f6d77f]">
              Plan: {formatCurrency(hoverPlanVal, currency, rate)}
            </span>
            {hoverActualVal !== null && (
              <span className={hoverActualVal >= hoverPlanVal ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                Actual: {formatCurrency(hoverActualVal, currency, rate)}
                <span className="text-[10px] ml-1">
                  ({hoverActualVal >= hoverPlanVal ? '+' : ''}
                  {formatCurrency(hoverActualVal - hoverPlanVal, currency, rate)})
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* The 100-Day Interactive Ladder Grid */
const LadderGrid: React.FC<{
  activeDay: number;
  byDay: Map<number, number>;
  onSelectDay: (day: number) => void;
}> = ({ activeDay, byDay, onSelectDay }) => {
  return (
    <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
      {Array.from({ length: 100 }, (_, k) => {
        const d = k + 1;
        const pnl = byDay.get(d);
        const isToday = d === activeDay;

        let bgStyle = 'bg-slate-900/70 text-slate-500 border border-slate-800/80 hover:border-slate-600';
        if (pnl !== undefined) {
          if (pnl > 0) {
            bgStyle = 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20';
          } else if (pnl < 0) {
            bgStyle = 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20';
          } else {
            bgStyle = 'bg-slate-700 text-white font-bold';
          }
        }

        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelectDay(d)}
            title={
              pnl !== undefined
                ? `Day ${d}: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USD`
                : `Day ${d} (Planned)`
            }
            className={`aspect-square rounded-xl flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${bgStyle} ${
              isToday ? 'ring-2 ring-[#e8b84a] ring-offset-2 ring-offset-[#070b14] animate-pulse font-black' : ''
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Main DashboardView Component ---------- */
export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  currency,
  trades,
  dayRecords = [],
  startingBalanceUsd = 10,
  onAddTrade,
  onEditTrade,
  onDeleteTrade,
  onEnableNotifications,
  onUpdateSettings,
}) => {
  const rate = settings.usdToKesRate;
  const money = (usd: number) => formatCurrency(usd, currency, rate);
  const activeDay = settings.activeDay;

  // Real-time market session clock for Nairobi (EAT)
  const [eatTime, setEatTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setEatTime(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Nairobi', hour12: true, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trader's edge tips auto-rotator
  const TIPS = [
    'Wait for the London / NY overlap (3:30 PM – 7:00 PM EAT) for high-momentum US 100, US 30 and Gold moves.',
    'Risk a small, fixed % per trade. Survival comes before compounding.',
    'Always place your stop-loss before considering your take-profit target.',
    'A liquidity sweep plus a break of structure (BOS) is confirmation, not a guess.',
    'Two losses in a day? Close the charts immediately. The market will be there tomorrow.',
    'Journal your emotions: revenge trading and FOMO appear in your trade data first.',
    'Hitting the daily target means you are finished. Protect the green and walk away.',
  ];

  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 8500);
    return () => clearInterval(id);
  }, [TIPS.length]);

  // Settings inline form state
  const [startCapital, setStartCapital] = useState(startingBalanceUsd);
  const [dailyRate, setDailyRate] = useState(15);
  const [fxRate, setFxRate] = useState(rate);

  // Computations
  const m = useMemo(() => {
    const byDay = new Map<number, number>();
    trades.forEach((t) => byDay.set(t.dayNumber, (byDay.get(t.dayNumber) ?? 0) + t.pnlUsd));
    const totalPnl = sum(trades.map((t) => t.pnlUsd));
    const wins = trades.filter((t) => t.pnlUsd > 0);
    const losses = trades.filter((t) => t.pnlUsd < 0);
    const grossW = sum(wins.map((t) => t.pnlUsd));
    const grossL = Math.abs(sum(losses.map((t) => t.pnlUsd)));

    const plan = [startingBalanceUsd];
    for (let d = 1; d <= 100; d++) {
      const targetProfit = dayRecords[d - 1]?.targetProfitUsd ?? plan[d - 1] * 0.15;
      plan.push(Number((plan[d - 1] + targetProfit).toFixed(2)));
    }

    const actual = [startingBalanceUsd];
    let run = startingBalanceUsd;
    const maxDayTracked = Math.max(activeDay, ...Array.from(byDay.keys()), 0);
    for (let d = 1; d <= maxDayTracked; d++) {
      run += byDay.get(d) ?? 0;
      actual.push(Number(run.toFixed(2)));
    }

    let streak = 0;
    for (let d = activeDay; d >= 1; d--) {
      const p = byDay.get(d);
      if (p === undefined) {
        if (d === activeDay) continue;
        break;
      }
      if (p > 0) streak++;
      else break;
    }

    const emo = new Map<string, { n: number; w: number }>();
    trades.forEach((t) => {
      const e = emo.get(t.emotion) ?? { n: 0, w: 0 };
      e.n++;
      if (t.pnlUsd > 0) e.w++;
      emo.set(t.emotion, e);
    });

    return {
      byDay,
      totalPnl,
      balance: startingBalanceUsd + totalPnl,
      plan,
      actual,
      streak,
      winRate: trades.length ? Math.round((wins.length / trades.length) * 100) : null,
      pf: grossL ? Number((grossW / grossL).toFixed(2)) : wins.length ? Infinity : null,
      best: trades.length ? Math.max(...trades.map((t) => t.pnlUsd)) : null,
      worst: trades.length ? Math.min(...trades.map((t) => t.pnlUsd)) : null,
      todayPnl: byDay.get(activeDay) ?? 0,
      todayTarget: dayRecords[activeDay - 1]?.targetProfitUsd ?? startingBalanceUsd * 0.15,
      emo: [...emo.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 5),
    };
  }, [trades, dayRecords, activeDay, startingBalanceUsd]);

  const targetHit = m.todayPnl >= m.todayTarget && m.todayTarget > 0;
  const progressRatio = Math.max(0, Math.min(100, (m.todayPnl / (m.todayTarget || 1)) * 100));
  const ahead = m.balance - (m.plan[Math.max(0, activeDay - 1)] ?? startingBalanceUsd);

  // Recent trades list filter
  const [searchTerm, setSearchTerm] = useState('');
  const filteredRecentTrades = [...trades]
    .filter((t) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.asset.toLowerCase().includes(q) ||
        t.strategy.toLowerCase().includes(q) ||
        t.emotion.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const card = 'rounded-3xl bg-[#0e1422] border border-slate-800 shadow-xl p-5 transition-all hover:border-slate-700';

  return (
    <div className="font-sora text-slate-100 space-y-6 pb-24 sm:pb-12">
      
      {/* Top Session Bar with AdamsKering Branding & Nairobi EAT Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0b0f19] via-[#0e1422] to-[#0b0f19] border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-3">
          <AdamsKeringLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sora font-extrabold text-base text-white tracking-wide">
                AdamsKering Trader
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-[#f6d77f] border border-amber-500/40 font-bold">
                PRO JOURNAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Compound With Discipline · Mon–Fri Weekdays
            </p>
          </div>
        </div>

        {/* Nairobi Clock & Session Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Nairobi (EAT):</span>
            <span className="text-white font-bold">{eatTime || '15:30 EAT'}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>US 100 &amp; Gold Live</span>
          </span>

          {onEnableNotifications && (
            <button
              type="button"
              onClick={onEnableNotifications}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Trade & Session Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rotating Hero Banner */}
      <HeroSection
        activeDay={activeDay}
        todayTargetUsd={m.todayTarget}
        todayPnlUsd={m.todayPnl}
        currency={currency}
        rate={rate}
      />

      {/* 4-Metric Command Center */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Account Balance */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Account Equity
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              ACTIVE
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1.5">
            {money(m.balance)}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {currency === 'USD'
              ? formatCurrency(m.balance, 'KES', rate)
              : formatCurrency(m.balance, 'USD', rate)}
          </p>
        </div>

        {/* Metric 2: Today's Target */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Day {activeDay} Target
            </span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#f6d77f] mt-1.5">
            +{money(m.todayTarget)}
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400 font-mono">
              Made: <span className={m.todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{money(m.todayPnl)}</span>
            </span>
            <span className={`text-[11px] font-bold ${targetHit ? 'text-emerald-400' : 'text-amber-400'}`}>
              {Math.round(progressRatio)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-amber-400"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Win Rate & Streak */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Win Rate
            </span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1.5">
            {m.winRate !== null ? `${m.winRate}%` : '—'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
            <span>{trades.length} trades</span>
            <span>•</span>
            <span className="text-orange-300 font-bold">{m.streak}d streak</span>
          </div>
        </div>

        {/* Metric 4: Plan Progress */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Plan Progress
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {ahead >= 0 ? `+${money(ahead)}` : `-${money(Math.abs(ahead))}`}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1.5">
            {activeDay} / 100
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-500 to-emerald-400"
              style={{ width: `${activeDay}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {100 - activeDay} trading days remaining
          </p>
        </div>
      </div>

      {/* Grid: Equity vs Plan Chart & Plan Controls */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Equity vs Plan Chart */}
        <div className={`lg:col-span-8 ${card} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e8b84a]" />
                <span>Equity Growth Curve vs. 100-Day Plan</span>
              </h3>
              <p className="text-xs text-slate-400">
                Logarithmic projection tracking exponential $10 compounding to financial freedom.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onAddTrade();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg transition-all active:scale-95 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #f3d27a)` }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Trade</span>
            </button>
          </div>

          <EquityChart
            plan={m.plan}
            actual={m.actual}
            currency={currency}
            rate={rate}
            activeDay={activeDay}
          />
        </div>

        {/* Right: Compounding Plan Settings Engine */}
        <div className={`lg:col-span-4 ${card} flex flex-col justify-between space-y-4`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Compounding Plan Engine</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-950 text-slate-400 border border-slate-800">
                AUTO-CALC
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Calibrated for starting capital day-by-day compounding. Weekdays only (Mon–Fri).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono">
                  Starting Seed Capital ($)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={startCapital}
                    onChange={(e) => setStartCapital(Math.max(1, Number(e.target.value)))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  {[10, 25, 50].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setStartCapital(sz)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        startCapital === sz ? 'bg-amber-500/20 text-[#f6d77f] border border-amber-500/40' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      ${sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Daily Rate %
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono">
                    USD / KES Rate
                  </label>
                  <input
                    type="number"
                    value={fxRate}
                    onChange={(e) => setFxRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400 mt-1"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Day 1 Target:</span>
                  <span className="text-[#f6d77f] font-mono font-bold">
                    +${((startCapital * dailyRate) / 100).toFixed(2)} (KES {Math.round(((startCapital * dailyRate) / 100) * fxRate).toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Day 100 Projection:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatCurrency(startCapital * Math.pow(1 + dailyRate / 100, 100), currency, fxRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {onUpdateSettings && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({
                  ...settings,
                  initialBalanceUsd: startCapital,
                  usdToKesRate: fxRate
                });
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply &amp; Recalculate 100 Days</span>
            </button>
          )}
        </div>
      </div>

      {/* The 100-Day Signature Ladder Grid & Psychology */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* 100-Day Ladder */}
        <div className={`lg:col-span-7 ${card} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>The 100-Day Ladder</span>
              </h3>
              <p className="text-xs text-slate-400">
                Green = Win, Red = Loss, Glowing Gold Ring = Today. Tap any day to inspect.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {m.byDay.size} / 100 Traded
            </span>
          </div>

          <LadderGrid
            activeDay={activeDay}
            byDay={m.byDay}
            onSelectDay={(day) => {
              soundManager.playClick();
              // quick select
            }}
          />
        </div>

        {/* Mindset & Emotional Discipline Edge */}
        <div className={`lg:col-span-5 ${card} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Trader Mindset Edge</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
              PSYCHOLOGY
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Disciplined execution vs FOMO analysis. Your data proves which mindset yields profits.
          </p>

          {m.emo.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
              <Brain className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Tag your emotional mindset when logging trades to view psychology win rates here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {m.emo.map(([name, e]) => {
                const wr = Math.round((e.w / e.n) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold">{name}</span>
                      <span className={wr >= 50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {wr}% win ({e.w}/{e.n})
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          wr >= 50 ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${wr}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Recent Trades & Upcoming Plan Matrix */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Executions Journal */}
        <div className={`lg:col-span-7 ${card} space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Recent Trades Journal</span>
              </h3>
              <p className="text-xs text-slate-400">
                Execution history for active 100-day challenge
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search setup / asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {filteredRecentTrades.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <p className="text-xs text-slate-400">No trades recorded yet.</p>
              <button
                type="button"
                onClick={onAddTrade}
                className="text-xs underline font-bold"
                style={{ color: GOLD }}
              >
                Record your first trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Direction</th>
                    <th className="py-2.5 px-3">Net P/L</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecentTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">Day {t.dayNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        {t.asset.split(' ')[0]}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {t.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={t.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.pnlUsd >= 0 ? '+' : ''}{money(t.pnlUsd)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTrade(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit trade"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              onDeleteTrade(t.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming 12 Days Plan Matrix */}
        <div className={`lg:col-span-5 ${card} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Upcoming Compounding Plan</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
              TARGETS
            </span>
          </div>

          <div className="overflow-x-auto max-h-[310px] no-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 bg-[#0e1422]">
                  <th className="py-2 px-2">Day</th>
                  <th className="py-2 px-2">Target</th>
                  <th className="py-2 px-2 text-right">Goal Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Array.from({ length: 12 }, (_, i) => activeDay + i)
                  .filter((n) => n <= 100)
                  .map((n) => {
                    const startBal = m.plan[n - 1] || startingBalanceUsd;
                    const goalBal = m.plan[n] || startBal * 1.15;
                    const targetAmt = goalBal - startBal;
                    return (
                      <tr
                        key={n}
                        className={`hover:bg-slate-900/60 transition-colors ${
                          n === activeDay ? 'bg-amber-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-2 px-2 font-bold text-white">
                          Day {n} {n === activeDay ? '🎯' : ''}
                        </td>
                        <td className="py-2 px-2 text-[#f6d77f]">
                          +{money(targetAmt)}
                        </td>
                        <td className="py-2 px-2 text-right text-emerald-400 font-bold">
                          {money(goalBal)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trader's Edge Wisdom Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 shadow-lg">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-[#f6d77f] border border-amber-500/40 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              Trader&apos;s Edge Wisdom · Daily Psychology Principle
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white mt-0.5 leading-relaxed transition-opacity duration-300">
              &ldquo;{TIPS[tipIndex]}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer Signature */}
      <footer className="text-center text-xs text-slate-500 pt-4 space-y-1 font-sora">
        <p>
          Designed &amp; built by <strong className="text-[#f6d77f]">Adams Kering</strong> · © {new Date().getFullYear()} AdamsKering Trader
        </p>
        <p className="text-[11px] text-slate-600">
          Trading carries risk. This application is a mathematical journal &amp; discipline planner, not financial advice.
        </p>
      </footer>

      {/* Mobile Floating Action Button */}
      <button
        type="button"
        aria-label="Record trade"
        onClick={() => {
          soundManager.playClick();
          onAddTrade();
        }}
        className="sm:hidden fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] w-14 h-14 rounded-full flex items-center justify-center text-slate-950 shadow-2xl z-30 transition-transform active:scale-90 cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #f3d27a)` }}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};

export default DashboardView;
