import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Globe, 
  Activity, 
  Flame, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Currency } from '../types/trading';

interface LiveMarketTickerProps {
  currency: Currency;
  usdToKesRate: number;
}

interface TickerAsset {
  symbol: string;
  name: string;
  price: number;
  change: number; // percentage
  type: 'index' | 'metal' | 'forex' | 'fiat';
  tickDir?: 'up' | 'down';
}

const INITIAL_ASSETS: TickerAsset[] = [
  { symbol: 'US 100', name: 'Nasdaq 100 Index', price: 20452.8, change: +1.24, type: 'index' },
  { symbol: 'US 30', name: 'Dow Jones Wall Street 30', price: 42865.4, change: +0.86, type: 'index' },
  { symbol: 'XAUUSD', name: 'Gold Spot / USD', price: 2658.35, change: +1.48, type: 'metal' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', price: 1.0846, change: -0.15, type: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', price: 1.2988, change: +0.42, type: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', price: 149.32, change: +0.28, type: 'forex' },
  { symbol: 'GBPJPY', name: 'Pound / Japanese Yen', price: 193.94, change: +0.65, type: 'forex' },
  { symbol: 'USD/KES', name: 'US Dollar / Kenyan Shilling', price: 129.80, change: -0.08, type: 'fiat' },
];

export const LiveMarketTicker: React.FC<LiveMarketTickerProps> = ({
  currency,
  usdToKesRate
}) => {
  const [assets, setAssets] = useState<TickerAsset[]>(INITIAL_ASSETS);
  const [nairobiTime, setNairobiTime] = useState<string>('');
  const [activeSession, setActiveSession] = useState<{ name: string; status: 'active' | 'upcoming'; description: string }>({
    name: 'London / NY Overlap',
    status: 'active',
    description: 'Peak Volatility for Gold & Forex'
  });

  // Real-time ticking clock for Nairobi Time (EAT - East Africa Time, UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Nairobi timezone (Africa/Nairobi)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const timeStr = formatter.format(now);
      setNairobiTime(`${timeStr} EAT`);

      // Determine active trading session according to Nairobi time
      const hour = parseInt(timeStr.split(':')[0], 10);
      const minute = parseInt(timeStr.split(':')[1], 10);
      const timeDecimal = hour + minute / 60;

      // Nairobi EAT Sessions:
      // Asian: 02:00 - 10:00 EAT
      // London: 10:00 - 19:00 EAT
      // New York: 15:30 - 00:00 EAT
      // London/NY Overlap: 15:30 - 19:00 EAT
      if (timeDecimal >= 15.5 && timeDecimal <= 19.0) {
        setActiveSession({
          name: 'London / NY Overlap (Kenya Peak)',
          status: 'active',
          description: 'High Gold & US30 Liquidity'
        });
      } else if (timeDecimal >= 15.5 || timeDecimal < 0.5) {
        setActiveSession({
          name: 'New York Session',
          status: 'active',
          description: 'US Indices & Dollar Moves'
        });
      } else if (timeDecimal >= 10.0 && timeDecimal < 15.5) {
        setActiveSession({
          name: 'London Session',
          status: 'active',
          description: 'European Breakouts & Trend Sets'
        });
      } else if (timeDecimal >= 2.0 && timeDecimal < 10.0) {
        setActiveSession({
          name: 'Asian Session (Tokyo/Sydney)',
          status: 'active',
          description: 'Range Bound / JPY Pairs'
        });
      } else {
        setActiveSession({
          name: 'Late NY / Pre-Asia',
          status: 'upcoming',
          description: 'Deriv Synthetics 24/7 Active'
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time market tick simulation with natural Brownian micro-fluctuations
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          // Micro tick probability
          if (Math.random() > 0.4) {
            const isUp = Math.random() > 0.48;
            const variance = asset.type === 'index' 
              ? (Math.random() * 4.5) 
              : asset.type === 'metal' 
              ? (Math.random() * 0.45) 
              : asset.type === 'fiat'
              ? (Math.random() * 0.05)
              : (Math.random() * 0.0003);

            const newPrice = isUp ? asset.price + variance : Math.max(0.0001, asset.price - variance);
            return {
              ...asset,
              price: newPrice,
              tickDir: isUp ? 'up' : 'down'
            };
          }
          return { ...asset, tickDir: undefined };
        })
      );
    }, 1800);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <div className="w-full bg-[#05080e] border-b border-slate-800 text-xs text-slate-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left: Kenyan EAT Time & Active Market Session */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono">
            <span className="text-base leading-none">🇰🇪</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white tracking-wide">{nairobiTime || '14:30:00 EAT'}</span>
            <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">(Nairobi)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px] truncate">{activeSession.name}</span>
          </div>
        </div>

        {/* Right: Live Ticker Stream with Realistic Price Movements */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5 w-full md:w-auto font-mono text-[11px]">
          {assets.map((asset) => {
            const isUp = asset.change >= 0;
            const flashClass = asset.tickDir === 'up' 
              ? 'bg-emerald-500/20 text-emerald-300' 
              : asset.tickDir === 'down' 
              ? 'bg-rose-500/20 text-rose-300' 
              : '';

            return (
              <div 
                key={asset.symbol} 
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors whitespace-nowrap ${flashClass}`}
                title={asset.name}
              >
                <span className="font-bold text-slate-200">{asset.symbol}</span>
                <span className={`font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.symbol === 'USD/KES' 
                    ? `KSH ${asset.price.toFixed(2)}` 
                    : asset.symbol.includes('US 100') || asset.symbol.includes('US 30')
                    ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    : asset.symbol === 'XAUUSD'
                    ? `$${asset.price.toFixed(2)}`
                    : asset.price.toFixed(4)}
                </span>
                <span className={`text-[10px] flex items-center ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isUp ? `+${asset.change.toFixed(2)}%` : `${asset.change.toFixed(2)}%`}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
