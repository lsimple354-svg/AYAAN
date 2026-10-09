import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Flame,
  Award,
  Clock,
  Smartphone
} from 'lucide-react';
import { Currency } from '../types/trading';

interface TradingAcademyProps {
  currency: Currency;
  usdToKesRate: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "You have a $10 (KES 1,300) account on Deriv Volatility 75. What is the safest lot size to use?",
    options: [
      "0.10 lot to make fast money in 5 minutes",
      "0.001 lot (minimum micro lot) to ensure small point drawdown",
      "0.05 lot with no stop loss",
      "0.20 lot hoping it shoots upward"
    ],
    correctAnswer: 1,
    explanation: "On a $10 seed, 0.001 is the mandatory minimum lot. A 0.05 or 0.10 lot would blow your entire account on a tiny 20-point adverse fluctuation."
  },
  {
    question: "What is an Institutional Bullish Order Block (OB)?",
    options: [
      "Any green candle you see on a 1-minute chart",
      "The last bearish down-candle before a violent upward rally that breaks market structure",
      "A moving average crossover line",
      "A support level drawn from 3 weeks ago"
    ],
    correctAnswer: 1,
    explanation: "A Bullish Order Block is the footprint of bank accumulation: the last downward selling candle before institutions injected massive buy orders breaking structure (BOS)."
  },
  {
    question: "When is the highest volatility session for Gold (XAU/USD) in Kenyan Time (EAT)?",
    options: [
      "Midnight at 2:00 AM EAT (Sydney Session)",
      "London / New York Overlap between 3:30 PM and 7:00 PM EAT",
      "Sunday afternoon",
      "6:00 AM EAT before breakfast"
    ],
    correctAnswer: 1,
    explanation: "The London and New York session overlap (3:30 PM to 7:00 PM Nairobi time) concentrates the highest institutional liquidity and trading volume for Gold and USD pairs."
  },
  {
    question: "According to the Daily Target Lock Rule, what must you do once your 10% daily goal is secured?",
    options: [
      "Keep trading immediately to hit 100% on the same day",
      "Lock your terminal, walk away, and protect your capital until the next session",
      "Double your lot size because you are feeling lucky",
      "Enter a trade without a stop loss"
    ],
    correctAnswer: 1,
    explanation: "Overtrading is the #1 reason small accounts crash. Once your mathematical daily quota is met, stepping away guarantees your compounding stays intact."
  },
  {
    question: "On Boom 1000 index, why is scalping ticks against the spike dangerous for a $10 account?",
    options: [
      "Brokers don't allow buying",
      "A single sudden upward spike will jump past your stop loss and instantly wipe your entire balance",
      "Boom 1000 never spikes",
      "Spikes only happen on weekends"
    ],
    correctAnswer: 1,
    explanation: "Boom indices drop smoothly by ticks and explode upwards with violent spikes. Trading against spikes with a small balance guarantees an account wipe when the inevitable spike occurs."
  }
];

export const TradingAcademy: React.FC<TradingAcademyProps> = ({
  currency,
  usdToKesRate,
}) => {
  const [activeModule, setActiveModule] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const modules = [
    {
      id: 0,
      title: "The Realistic $10 (KES 1,300) Compounding Blueprint",
      subtitle: "The mathematical reality vs hype, and how to execute it safely",
      icon: Target,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h5 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="text-emerald-400">⚖️</span>
              <span>The Mathematics vs The Psychology</span>
            </h5>
            <p>
              Compounding 10% to 50% daily on a $10 (KES 1,300) seed is mathematically extraordinary. On paper, 10% daily turns $10 into $137 in 30 days and over $130,000 in 100 days. However, in reality, no trader has a 100% win rate every single day without drawdowns.
            </p>
            <p>
              To make this compounding challenge <strong>real and reasonable</strong>, understand the 3 distinct phases:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold font-mono text-xs">Phase 1: Days 1 - 20</span>
              <h6 className="text-white font-bold text-xs">Micro Survival ($10 → $50)</h6>
              <p className="text-[11px] text-slate-400">
                Your highest vulnerability phase. One mistake can wipe 30% of your seed. Use strictly 0.001 lot on V75 or 0.01 on Forex. Never risk more than $1 (KES 130) per trade.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold font-mono text-xs">Phase 2: Days 21 - 50</span>
              <h6 className="text-white font-bold text-xs">Breathing Room ($50 → $250)</h6>
              <p className="text-[11px] text-slate-400">
                You now have cushion. Withdraw your original $10 (KES 1,300) to M-Pesa! Now you are playing 100% on market profits without personal capital at risk.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold font-mono text-xs">Phase 3: Days 51 - 100</span>
              <h6 className="text-white font-bold text-xs">Empire Scaling ($250 → $2,000+)</h6>
              <p className="text-[11px] text-slate-400">
                Shift to lower daily target percentages (10%-15%). Sizing down percentage while dollar profits remain substantial ($25 - $50 / day = KES 3,250 - 6,500 daily).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Smart Money Concepts (SMC) & Institutional Price Action",
      subtitle: "Trade how market makers and bank liquidity algorithms move price",
      icon: Layers,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Order Blocks */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-mono">
                Concept 1
              </span>
              <h5 className="font-bold text-white text-sm">Institutional Order Block (OB)</h5>
              <p className="text-xs text-slate-300">
                An Order Block is the final contrary candle before an explosive displacement that breaks structure (BOS).
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li><strong>Bullish OB:</strong> The last red (bearish) candle before price surges upward creating a higher high.</li>
                <li><strong>Entry Trigger:</strong> Wait for price to retrace and tap into the 50% equilibrium of the OB candle. Set SL 5 pips below the wick.</li>
              </ul>
            </div>

            {/* Fair Value Gap */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-mono">
                Concept 2
              </span>
              <h5 className="font-bold text-white text-sm">Fair Value Gap (FVG) / Imbalance</h5>
              <p className="text-xs text-slate-300">
                A 3-candle pattern where Candle 1's high does not touch Candle 3's low, leaving an untouched empty price pocket in Candle 2.
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>The market algorithm considers empty pockets "inefficient".</li>
                <li>Price almost always gravitates back into the FVG to rebalance orders before resuming trend.</li>
              </ul>
            </div>

            {/* Liquidity Sweeps */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-mono">
                Concept 3
              </span>
              <h5 className="font-bold text-white text-sm">Liquidity Sweeps (BSL &amp; SSL)</h5>
              <p className="text-xs text-slate-300">
                Banks need counter-orders to fill huge positions. They intentionally push price beyond obvious double tops or support to trigger retail stop losses.
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li><strong>Buy-Side Liquidity (BSL):</strong> Stop orders resting above clean equal highs.</li>
                <li><strong>Sell-Side Liquidity (SSL):</strong> Stop orders resting below clean equal lows.</li>
                <li>Never buy at equal highs. Wait for the sweep (fake breakout), followed by an immediate reversal back inside range.</li>
              </ul>
            </div>

            {/* Change of Character */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-mono">
                Concept 4
              </span>
              <h5 className="font-bold text-white text-sm">Change of Character (CHoCH / MSS)</h5>
              <p className="text-xs text-slate-300">
                The first sign that an existing trend is failing. In an uptrend, it is the first lower low created when a major swing low is breached with a full candle body close.
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>Confirms whether a retracement is merely a pullback or a true institutional reversal.</li>
              </ul>
            </div>

          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Deriv Synthetic Indices Masterclass (V75, Boom & Crash)",
      subtitle: "Why Kenyan traders dominate Deriv synthetics and how the algorithms work",
      icon: Zap,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h5 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <span>Why Deriv Synthetics are Huge in Kenya</span>
            </h5>
            <p>
              Synthetic indices are simulated algorithmically using cryptographically secure random number generators. They have <strong>zero fundamental news risk</strong> (unaffected by US CPI or Fed rates), and operate <strong>24 hours a day, 7 days a week, including weekends</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h6 className="font-bold text-emerald-400 text-xs uppercase font-mono">Volatility 75 Index (V75)</h6>
              <p className="text-xs text-slate-300">
                Constant 75% market volatility. Every tick takes 2 seconds. Highly respected by pure price action and SMC order blocks.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 space-y-1">
                <div>• Minimum Lot: <strong>0.001</strong></div>
                <div>• 100 points move at 0.001 = <strong>$0.10 (KES 13)</strong></div>
                <div>• 1,000 points move at 0.001 = <strong>$1.00 (KES 130)</strong></div>
              </div>
              <p className="text-[11px] text-emerald-400">
                Rule on $10 account: Never use more than 0.001 lot. Let the move run with trailing stop!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h6 className="font-bold text-rose-400 text-xs uppercase font-mono">Boom &amp; Crash (1000 &amp; 500)</h6>
              <p className="text-xs text-slate-300">
                Boom indices drop steadily by 1-second ticks and spike violently UPWARD. Crash indices climb steadily and spike violently DOWNWARD.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 space-y-1">
                <div>• Minimum Lot: <strong>0.20</strong></div>
                <div>• 1 spike caught in your direction = <strong>+$1.50 to +$5.00</strong></div>
                <div>• 1 spike caught AGAINST you = <strong>-$2.00 to -$6.00</strong></div>
              </div>
              <p className="text-[11px] text-rose-400">
                Deadly Trap: Never scalp small ticks against the spike on a $10 balance. Always trade IN THE DIRECTION of spikes!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Forex & Gold Sessions in Kenyan Time (EAT UTC+3)",
      subtitle: "The exact Nairobi hours when smart money enters and moves the market",
      icon: Clock,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h5 className="font-bold text-white text-sm">The Nairobi Market Schedule (East Africa Time)</h5>
            <p className="text-xs text-slate-400">
              Living in Kenya provides an extraordinary geographic advantage: the high-volatility London and New York sessions occur conveniently during afternoon and evening hours.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-400 text-xs font-mono">10:00 AM - 1:00 PM EAT</span>
                <h6 className="font-bold text-white text-sm">London Open Killzone</h6>
                <p className="text-xs text-slate-400 mt-0.5">
                  London traders enter. The daily low or high is commonly established between 10:30 AM and 11:30 AM Nairobi time. Best for EUR/USD, GBP/USD, and GBP/JPY.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                High Volatility
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-cyan-400 text-xs font-mono">3:30 PM - 7:00 PM EAT</span>
                <h6 className="font-bold text-white text-sm">London &amp; New York Overlap (Kenya Peak Window)</h6>
                <p className="text-xs text-slate-400 mt-0.5">
                  The #1 most liquid 3.5 hours on Earth. US economic news releases at exactly 3:30 PM or 5:00 PM Nairobi time (CPI, NFP, PPI). Gold (XAU/USD) regularly moves $15 - $40 in minutes.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 shrink-0">
                Peak Gold Move
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-purple-400 text-xs font-mono">7:00 PM - 11:30 PM EAT</span>
                <h6 className="font-bold text-white text-sm">New York Afternoon Session</h6>
                <p className="text-xs text-slate-400 mt-0.5">
                  London closes around 7:00 PM EAT. New York indices (US30, NAS100) trend toward daily targets. Market slows down by 11:30 PM EAT.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 shrink-0">
                US Equities
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Trader Psychology & The M-Pesa Banking Rule",
      subtitle: "Overcoming fear, revenge trading, and anchoring profits in the real world",
      icon: Brain,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h5 className="font-bold text-white text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>The M-Pesa Withdrawal Anchor</span>
            </h5>
            <p>
              Digital numbers on MetaTrader or Deriv don't feel like real money to the human subconscious. That's why traders casually risk $10, $50, or $100 without flinching, yet would never throw KSH 5,000 onto the street.
            </p>
            <p className="font-semibold text-emerald-300">
              The moment your trading profits land as an M-Pesa message on your phone (e.g., "Confirmed. You have received Ksh 3,900 from Deriv/FXPesa..."), your brain registers the activity as a legitimate career, destroying careless gambling impulses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-rose-400 font-bold text-xs uppercase font-mono">The Revenge Trade Trap</span>
              <p className="text-xs text-slate-400">
                After a loss, your adrenaline spikes. You want to "make it back immediately". 94% of blown accounts happen within 15 minutes of taking a loss.
              </p>
              <div className="text-[11px] text-slate-300 font-medium pt-1">
                Remedy: Walk away from screens for 30 minutes. The chart will still be there.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold text-xs uppercase font-mono">The Greed Trap</span>
              <p className="text-xs text-slate-400">
                You hit your 10% daily goal in the first 20 minutes. You think: "Today is my day, let me take 5 more trades." By 6:00 PM you give back all profits plus initial capital.
              </p>
              <div className="text-[11px] text-slate-300 font-medium pt-1">
                Remedy: Use this app's "Discipline Lockout" button immediately upon hitting your goal.
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Quiz evaluation
  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-bold text-white">The Nairobi Trader's Knowledge Vault</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
            Professional Curriculum
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Everything you need to trade responsibly, understand institutional smart money mechanics, master Deriv synthetics, and compound from KSH 1,300 with professional discipline.
        </p>
      </div>

      {/* Module Selector Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModule(m.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-emerald-300' : 'text-slate-500'}`}>
                  0{m.id + 1}
                </span>
              </div>
              <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {m.title}
              </h5>
            </button>
          );
        })}
      </div>

      {/* Active Module Content Display */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <span>Module 0{activeModule + 1}</span>
            <span>•</span>
            <span>Institutional Education</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            {modules[activeModule].title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {modules[activeModule].subtitle}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800">
          {modules[activeModule].content}
        </div>
      </div>

      {/* Interactive Trader Readiness Quiz */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Award className="w-4 h-4" />
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Trader Readiness Exam (5 Questions)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify your comprehension before putting real Kenyan Shillings into the market.
            </p>
          </div>

          {quizSubmitted && (
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/60 text-purple-300 font-mono text-xs font-bold">
              Score: {calculateScore()} / {QUIZ_QUESTIONS.length} ({((calculateScore() / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%)
            </div>
          )}
        </div>

        {/* Quiz Questions List */}
        <div className="space-y-4 pt-2">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const selectedOpt = quizAnswers[qIdx];
            const isCorrect = selectedOpt === q.correctAnswer;

            return (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono font-bold text-purple-400 shrink-0">
                    Q{qIdx + 1}.
                  </span>
                  <h5 className="text-xs sm:text-sm font-semibold text-white">
                    {q.question}
                  </h5>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (quizSubmitted) {
                      if (oIdx === q.correctAnswer) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleOptionSelect(qIdx, oIdx)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className={`p-2.5 rounded-xl text-xs ${isCorrect ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'}`}>
                    <strong className="block mb-0.5">{isCorrect ? '✓ Correct!' : '✕ Incorrect'}</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit or Reset button */}
        <div className="pt-2 flex items-center justify-end">
          {quizSubmitted ? (
            <button
              type="button"
              onClick={() => {
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            >
              Retake Examination
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                Object.keys(quizAnswers).length === QUIZ_QUESTIONS.length
                  ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-lg shadow-purple-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Submit &amp; Grade Answers
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
