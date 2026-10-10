import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Bell, 
  Zap,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Currency } from '../types/trading';

export interface EconomicEvent {
  id: string;
  timeEAT: string; // Nairobi EAT Time e.g. "15:30 EAT"
  date: string;
  country: 'USD' | 'EUR' | 'GBP' | 'ALL';
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedAssets: string[];
  forecast: string;
  previous: string;
  actual?: string;
  noTradeBufferMinutes: number; // e.g. 15 mins before & after
  tradingTip: string;
}

const SAMPLE_EVENTS: EconomicEvent[] = [
  {
    id: 'cpi-usd',
    timeEAT: '15:30 EAT',
    date: 'Wednesday',
    country: 'USD',
    title: 'US Consumer Price Index (CPI YoY)',
    impact: 'HIGH',
    affectedAssets: ['US 100', 'US 30', 'XAUUSD', 'EURUSD'],
    forecast: '2.9%',
    previous: '3.1%',
    noTradeBufferMinutes: 30,
    tradingTip: 'Severe volatility on Gold & Nasdaq. Prop firm spreads widen up to 40 pips. Do not enter within 15 mins before release.'
  },
  {
    id: 'nfp-usd',
    timeEAT: '15:30 EAT',
    date: 'Friday',
    country: 'USD',
    title: 'Non-Farm Employment Change (NFP)',
    impact: 'HIGH',
    affectedAssets: ['US 100', 'US 30', 'XAUUSD', 'EURUSD', 'USDJPY'],
    forecast: '175K',
    previous: '187K',
    noTradeBufferMinutes: 30,
    tradingTip: 'Institutions raid liquidity on both sides (Asia High/Low sweep). Look for 15-min Fair Value Gap retracement after initial spike.'
  },
  {
    id: 'fomc-rate',
    timeEAT: '21:00 EAT',
    date: 'Wednesday',
    country: 'USD',
    title: 'Fed Interest Rate Decision & Press Conference',
    impact: 'HIGH',
    affectedAssets: ['US 100', 'US 30', 'XAUUSD', 'EURUSD'],
    forecast: '5.25%',
    previous: '5.50%',
    noTradeBufferMinutes: 45,
    tradingTip: 'Highest slip hazard of the month. Close open funded positions before 20:45 EAT unless stopped in profit.'
  },
  {
    id: 'pmi-usd',
    timeEAT: '16:45 EAT',
    date: 'Thursday',
    country: 'USD',
    title: 'US S&P Global Services PMI',
    impact: 'MEDIUM',
    affectedAssets: ['US 100', 'US 30'],
    forecast: '51.4',
    previous: '50.9',
    noTradeBufferMinutes: 15,
    tradingTip: 'Moderate reaction on NY Open indices. Watch for Order Block confirmation at the 17:00 EAT hourly close.'
  },
  {
    id: 'ecb-rate',
    timeEAT: '15:15 EAT',
    date: 'Thursday',
    country: 'EUR',
    title: 'ECB Monetary Policy Statement & Rate',
    impact: 'HIGH',
    affectedAssets: ['EURUSD', 'EURGBP'],
    forecast: '3.75%',
    previous: '4.00%',
    noTradeBufferMinutes: 20,
    tradingTip: 'Triggers EURUSD directional expansion into London close.'
  },
  {
    id: 'initial-claims',
    timeEAT: '15:30 EAT',
    date: 'Thursday',
    country: 'USD',
    title: 'US Unemployment Claims (Weekly)',
    impact: 'MEDIUM',
    affectedAssets: ['US 100', 'US 30', 'XAUUSD'],
    forecast: '218K',
    previous: '222K',
    noTradeBufferMinutes: 10,
    tradingTip: 'Useful confluence during NY Session Open.'
  },
];

interface EconomicCalendarProps {
  currency: Currency;
  usdToKesRate: number;
}

export const EconomicCalendar: React.FC<EconomicCalendarProps> = () => {
  const [filterImpact, setFilterImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [filterAsset, setFilterAsset] = useState<string>('ALL');
  const [noTradeAlertActive, setNoTradeAlertActive] = useState<boolean>(false);
  const [currentTimeEAT, setCurrentTimeEAT] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Nairobi is UTC+3
      const eat = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      setCurrentTimeEAT(`${eat} EAT (Nairobi)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = SAMPLE_EVENTS.filter((ev) => {
    if (filterImpact !== 'ALL' && ev.impact !== filterImpact) return false;
    if (filterAsset !== 'ALL' && !ev.affectedAssets.some(a => a.toLowerCase().includes(filterAsset.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Calendar className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-white">Institutional Economic Calendar</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80">
                Red-Folder Protection
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Nairobi EAT news releases for <strong>US 100, US 30, Gold, and USD</strong>. Funded accounts fail most often from news slippage—track these events to protect your drawdown buffer.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Nairobi Market Time</div>
              <div className="text-sm font-mono font-bold text-emerald-400">{currentTimeEAT || 'Loading...'}</div>
            </div>
          </div>
        </div>

        {/* No-Trade Zone Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">Prop Firm Golden Rule:</span>
              <span className="text-slate-300 ml-1.5">Most firms (FTMO, FundingPips) restrict executing 2 to 5 minutes before & after high-impact news. Always stay flat!</span>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] font-mono shrink-0 font-bold">
            SAFEGUARD ACTIVE
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter Impact:</span>
          <div className="flex gap-1">
            {(['ALL', 'HIGH', 'MEDIUM'] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setFilterImpact(imp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterImpact === imp
                    ? imp === 'HIGH'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                }`}
              >
                {imp === 'HIGH' ? '🔴 High (Red Folder)' : imp === 'MEDIUM' ? '🟠 Medium' : 'All Events'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Asset:</span>
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Instruments</option>
            <option value="US 100">US 100 (NAS100)</option>
            <option value="US 30">US 30 (Dow Jones)</option>
            <option value="XAUUSD">XAUUSD (Gold)</option>
            <option value="EURUSD">EURUSD & Forex</option>
          </select>
        </div>
      </div>

      {/* Events Table / Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => (
          <div 
            key={ev.id}
            className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border transition-all hover:border-slate-600 space-y-3 ${
              ev.impact === 'HIGH' ? 'border-rose-500/30' : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  ev.impact === 'HIGH' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {ev.impact === 'HIGH' ? '🔴 High Impact' : '🟠 Medium'}
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {ev.country} • {ev.date}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{ev.timeEAT}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white leading-snug">{ev.title}</h4>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {ev.affectedAssets.map((asset) => (
                  <span key={asset} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-mono">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-slate-500 text-[10px]">Forecast:</span>
                <div className="font-bold text-slate-200">{ev.forecast}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Previous:</span>
                <div className="font-bold text-slate-400">{ev.previous}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-amber-400 mr-1">Institutional Tip:</span>
              {ev.tradingTip}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
