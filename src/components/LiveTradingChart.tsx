import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Maximize2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { Currency } from '../types/trading';
import { formatCurrency } from '../utils/compounding';

interface LiveTradingChartProps {
  currency: Currency;
  usdToKesRate: number;
  onQuickLogTrade: (asset: string, currentPrice: number) => void;
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const ASSET_CONFIGS: Record<string, { basePrice: number; pipDecimals: number; pipSize: number; step: number; name: string }> = {
  'Volatility 75 Index': { basePrice: 423500, pipDecimals: 1, pipSize: 1, step: 25, name: 'Deriv Synthetic Index' },
  'XAU/USD (Gold)': { basePrice: 2655.40, pipDecimals: 2, pipSize: 0.1, step: 0.8, name: 'Spot Gold' },
  'EUR/USD': { basePrice: 1.0848, pipDecimals: 4, pipSize: 0.0001, step: 0.0003, name: 'Forex Major' },
  'BTC/USDT': { basePrice: 63800, pipDecimals: 1, pipSize: 1, step: 30, name: 'Crypto Spot' },
};

export const LiveTradingChart: React.FC<LiveTradingChartProps> = ({
  currency,
  usdToKesRate,
  onQuickLogTrade,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('Volatility 75 Index');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [showOrderBlock, setShowOrderBlock] = useState(true);
  const [showFVG, setShowFVG] = useState(true);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [livePrice, setLivePrice] = useState<number>(ASSET_CONFIGS['Volatility 75 Index'].basePrice);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');

  // Generate realistic initial candlestick series
  useEffect(() => {
    const config = ASSET_CONFIGS[selectedAsset] || ASSET_CONFIGS['Volatility 75 Index'];
    let current = config.basePrice;
    const initialCandles: Candle[] = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const isGreen = Math.random() > 0.47;
      const change = (Math.random() * config.step * 2);
      const open = current;
      const close = isGreen ? open + change : Math.max(0.1, open - change);
      const high = Math.max(open, close) + (Math.random() * config.step);
      const low = Math.min(open, close) - (Math.random() * config.step);

      const d = new Date(Date.now() - (count - i) * 5 * 60000);
      initialCandles.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open,
        high,
        low,
        close,
      });
      current = close;
    }

    setCandles(initialCandles);
    setLivePrice(current);
  }, [selectedAsset, timeframe]);

  // Real-time ticking candle engine
  useEffect(() => {
    const config = ASSET_CONFIGS[selectedAsset] || ASSET_CONFIGS['Volatility 75 Index'];
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const lastCandle = { ...prev[prev.length - 1] };
        const isUp = Math.random() > 0.48;
        const delta = (Math.random() * config.step * 0.4);
        const newPrice = isUp ? lastCandle.close + delta : Math.max(0.1, lastCandle.close - delta);

        setPriceDirection(isUp ? 'up' : 'down');
        setLivePrice(newPrice);

        lastCandle.close = newPrice;
        if (newPrice > lastCandle.high) lastCandle.high = newPrice;
        if (newPrice < lastCandle.low) lastCandle.low = newPrice;

        return [...prev.slice(0, prev.length - 1), lastCandle];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Calculations for chart geometry
  const chartHeight = 320;
  const chartWidth = 780;
  const paddingY = 30;
  const paddingX = 40;

  const minPrice = Math.min(...candles.map((c) => c.low), livePrice);
  const maxPrice = Math.max(...candles.map((c) => c.high), livePrice);
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    const norm = (val - minPrice) / priceRange;
    return chartHeight - paddingY - norm * (chartHeight - paddingY * 2);
  };

  const candleSpacing = (chartWidth - paddingX * 2) / Math.max(1, candles.length);
  const candleBodyWidth = Math.max(4, candleSpacing * 0.65);

  const formatPrice = (p: number) => {
    const config = ASSET_CONFIGS[selectedAsset] || ASSET_CONFIGS['Volatility 75 Index'];
    return p.toLocaleString('en-US', {
      minimumFractionDigits: config.pipDecimals,
      maximumFractionDigits: config.pipDecimals,
    });
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
      
      {/* Top Header: Asset Switcher, Timeframe & SMC Confluences */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Asset Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(ASSET_CONFIGS).map((assetName) => (
            <button
              key={assetName}
              type="button"
              onClick={() => setSelectedAsset(assetName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAsset === assetName
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {assetName}
            </button>
          ))}
        </div>

        {/* Timeframes & Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Timeframe pill */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* SMC Overlay Toggles */}
          <button
            type="button"
            onClick={() => setShowOrderBlock(!showOrderBlock)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showOrderBlock
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            SMC Demand OB
          </button>

          <button
            type="button"
            onClick={() => setShowFVG(!showFVG)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showFVG
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            FVG Imbalance
          </button>

          {/* Quick Trade Button */}
          <button
            type="button"
            onClick={() => onQuickLogTrade(selectedAsset, livePrice)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Journal This Price</span>
          </button>
        </div>

      </div>

      {/* Live Quote Spotlight */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold text-white">{selectedAsset}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {timeframe}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className={`text-xl sm:text-2xl font-black ${
              priceDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatPrice(livePrice)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              priceDirection === 'up' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
            }`}>
              {priceDirection === 'up' ? '▲ BUY' : '▼ SELL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>H: <span className="text-slate-200 font-bold">{formatPrice(maxPrice)}</span></div>
          <div>L: <span className="text-slate-200 font-bold">{formatPrice(minPrice)}</span></div>
          <div className="hidden sm:block text-emerald-400">
            Spread: <span className="font-bold">0.4 pips</span>
          </div>
        </div>
      </div>

      {/* Interactive Candlestick SVG Chart */}
      <div className="relative w-full overflow-x-auto bg-[#070b14] rounded-2xl border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[650px] overflow-visible"
        >
          {/* Price Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const priceLevel = minPrice + pct * priceRange;
            const y = getY(priceLevel);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.25)"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - paddingX + 5}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatPrice(priceLevel)}
                </text>
              </g>
            );
          })}

          {/* Smart Money Order Block (Demand Zone) */}
          {showOrderBlock && candles.length > 10 && (
            <g>
              <rect
                x={paddingX + 2 * candleSpacing}
                y={getY(minPrice + priceRange * 0.32)}
                width={chartWidth - paddingX * 2}
                height={Math.max(12, getY(minPrice + priceRange * 0.20) - getY(minPrice + priceRange * 0.32))}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="rgba(16, 185, 129, 0.35)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingX + 10}
                y={getY(minPrice + priceRange * 0.26)}
                fill="#34d399"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                H1 Bullish Order Block (Institutional Demand)
              </text>
            </g>
          )}

          {/* Fair Value Gap (FVG Zone) */}
          {showFVG && candles.length > 15 && (
            <g>
              <rect
                x={paddingX + 12 * candleSpacing}
                y={getY(minPrice + priceRange * 0.65)}
                width={chartWidth - paddingX * 2 - 12 * candleSpacing}
                height={Math.max(10, getY(minPrice + priceRange * 0.55) - getY(minPrice + priceRange * 0.65))}
                fill="rgba(56, 189, 248, 0.08)"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeDasharray="2 2"
              />
              <text
                x={chartWidth - 220}
                y={getY(minPrice + priceRange * 0.60)}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                Bullish FVG Imbalance
              </text>
            </g>
          )}

          {/* Candlesticks Rendering */}
          {candles.map((candle, idx) => {
            const isGreen = candle.close >= candle.open;
            const x = paddingX + idx * candleSpacing + candleSpacing / 2;
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
            const color = isGreen ? '#10b981' : '#f43f5e';

            return (
              <g key={idx} className="transition-all">
                {/* Candle Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.5"
                />

                {/* Candle Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={isGreen ? '#10b981' : '#f43f5e'}
                  rx="1"
                  className={idx === candles.length - 1 ? (isGreen ? 'candlestick-glow-green' : 'candlestick-glow-red') : ''}
                />
              </g>
            );
          })}

          {/* Current Live Price Horizontal Tracker Line */}
          <line
            x1={paddingX}
            y1={getY(livePrice)}
            x2={chartWidth - paddingX}
            y2={getY(livePrice)}
            stroke={priceDirection === 'up' ? '#10b981' : '#f43f5e'}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Live Price Tag on the Right Axis */}
          <rect
            x={chartWidth - paddingX}
            y={getY(livePrice) - 10}
            width={70}
            height={20}
            rx="4"
            fill={priceDirection === 'up' ? '#10b981' : '#f43f5e'}
          />
          <text
            x={chartWidth - paddingX + 6}
            y={getY(livePrice) + 4}
            fill="#090d16"
            fontSize="10"
            fontWeight="bold"
            fontFamily="JetBrains Mono, monospace"
          >
            {formatPrice(livePrice)}
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Session Open: 08:00 EAT</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          Live Price Streaming Enabled
        </span>
        <span>Nairobi Market Hub</span>
      </div>

    </div>
  );
};
