import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Download
} from 'lucide-react';
import { Trade, TradeResult, TradeDirection, AppSettings, Currency } from '../types/trading';
import { formatCurrency } from '../utils/compounding';
import { soundManager } from '../utils/audio';

interface StatementImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrades: (trades: Trade[]) => void;
  settings: AppSettings;
  currency: Currency;
}

interface ParsedRow {
  id: string;
  symbol: string;
  type: string;
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  dayNumber: number;
  time: string;
}

export const StatementImporterModal: React.FC<StatementImporterModalProps> = ({
  isOpen,
  onClose,
  onImportTrades,
  settings,
  currency,
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Parses CSV or pasted text from MT4 / MT5 statement
  const handleParse = (text: string) => {
    setErrorMsg('');
    setSuccessCount(null);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/);
      const results: ParsedRow[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip empty lines or standard headers
        if (!line || line.toLowerCase().includes('ticket') || line.toLowerCase().includes('order') || line.toLowerCase().includes('open time')) {
          continue;
        }

        // Split by comma, tab, or semicolons
        const parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 5) continue;

        // Try to infer fields based on MT4/MT5 formats:
        // Typical format: [Ticket, OpenTime, Type, Lots, Item/Symbol, OpenPrice, S/L, T/P, CloseTime, ClosePrice, Commission, Swap, Profit]
        let symbol = 'US 100 (NAS100)';
        let type = 'BUY';
        let lots = 0.01;
        let openPrice = 0;
        let closePrice = 0;
        let pnl = 0;
        let time = new Date().toISOString();

        // Check if any part matches known symbols
        for (const p of parts) {
          const upper = p.toUpperCase();
          if (upper.includes('NAS') || upper.includes('US100') || upper.includes('USTEC')) symbol = 'US 100 (NAS100)';
          else if (upper.includes('US30') || upper.includes('DJ30') || upper.includes('WALL')) symbol = 'US 30 (Dow Jones 30)';
          else if (upper.includes('XAU') || upper.includes('GOLD')) symbol = 'XAUUSD (Gold Spot)';
          else if (upper.includes('EURUSD')) symbol = 'EURUSD';
          else if (upper.includes('GBPUSD')) symbol = 'GBPUSD';
          else if (upper.includes('USDJPY')) symbol = 'USDJPY';
          else if (upper.includes('V75') || upper.includes('VOLATILITY')) symbol = 'Volatility 75 Index';
          else if (upper.includes('BOOM')) symbol = 'Boom 1000 Index';
          else if (upper.includes('CRASH')) symbol = 'Crash 1000 Index';
          
          if (upper === 'BUY' || upper === 'LONG') type = 'BUY';
          if (upper === 'SELL' || upper === 'SHORT') type = 'SELL';
        }

        // Search for profit in parts (usually the last numeric column)
        const numericParts = parts.filter(p => !isNaN(parseFloat(p)) && isFinite(Number(p))).map(Number);
        if (numericParts.length >= 2) {
          // Typically last number is profit
          pnl = numericParts[numericParts.length - 1];
          lots = numericParts[0] <= 10 && numericParts[0] > 0 ? numericParts[0] : 0.01;
          openPrice = numericParts.length > 2 ? numericParts[1] : 0;
          closePrice = numericParts.length > 3 ? numericParts[2] : 0;
        }

        results.push({
          id: `imp-${Date.now()}-${i}`,
          symbol,
          type,
          lots,
          openPrice,
          closePrice,
          pnl,
          dayNumber: settings.activeDay,
          time,
        });
      }

      if (results.length === 0) {
        setErrorMsg('Could not detect trades. Paste CSV lines with Symbol, Type, Lots, and Profit.');
      } else {
        setParsedRows(results);
      }
    } catch (e) {
      setErrorMsg('Failed to parse statement content.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPasteContent(text);
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (parsedRows.length === 0) return;

    soundManager.playTargetHit();
    const importedTrades: Trade[] = parsedRows.map((row) => ({
      id: `mt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      dayNumber: row.dayNumber,
      timestamp: row.time,
      asset: row.symbol,
      direction: (row.type === 'SELL' ? 'SHORT' : 'LONG') as TradeDirection,
      lotSize: row.lots,
      entryPrice: row.openPrice,
      exitPrice: row.closePrice,
      pnlUsd: row.pnl,
      result: (row.pnl > 0 ? 'WIN' : row.pnl < 0 ? 'LOSS' : 'BREAKEVEN') as TradeResult,
      strategy: 'MT4/MT5 Executed Trade',
      session: 'Session Execution',
      emotion: 'Systematic',
      notes: `Imported via Statement Importer (${row.symbol} ${row.type})`,
    }));

    onImportTrades(importedTrades);
    setSuccessCount(importedTrades.length);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleLoadSample = () => {
    const sample = `Ticket,Open Time,Type,Size,Item,Price,S / L,T / P,Close Time,Price,Commission,Taxes,Swap,Profit
108291,2026.10.09 15:35,buy,0.10,NAS100,20450.2,20420.0,20520.0,2026.10.09 16:10,20490.5,0.00,0.00,0.00,40.30
108292,2026.10.09 16:20,sell,0.05,XAUUSD,2650.10,2655.00,2640.00,2026.10.09 17:00,2643.50,0.00,0.00,0.00,33.00
108293,2026.10.09 17:15,buy,0.02,US30,42100.0,42040.0,42250.0,2026.10.09 17:45,42080.0,0.00,0.00,0.00,-4.00`;
    setPasteContent(sample);
    handleParse(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#090d18] border border-slate-700/80 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                MT4 / MT5 &amp; CSV Statement Importer
              </h3>
              <p className="text-xs text-slate-400">
                Bulk upload MetaTrader trades directly into your Ayaan Trading journal.
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

        {/* Upload or Sample Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950/60 cursor-pointer transition-all group">
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white">Upload .CSV or .HTML File</span>
            <span className="text-[10px] text-slate-500">From MetaTrader History</span>
            <input type="file" accept=".csv,.txt,.html" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 hover:border-emerald-500 bg-slate-950/60 cursor-pointer transition-all group"
          >
            <FileText className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-white">Load Demo Statement</span>
            <span className="text-[10px] text-slate-500">Test NAS100, Gold &amp; US30</span>
          </button>
        </div>

        {/* Raw Text Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Or Paste Statement Text (CSV / Tab Delimited)
          </label>
          <textarea
            rows={4}
            value={pasteContent}
            onChange={(e) => {
              setPasteContent(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder="Paste CSV rows here: e.g. 108291, buy, 0.10, NAS100, 20450, 20490, 40.30"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Trades Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Detected Trades ({parsedRows.length})</span>
              <span className="font-mono text-cyan-400">Assigning to Day {settings.activeDay}</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {parsedRows.map((r, i) => (
                <div key={r.id || i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {r.type}
                    </span>
                    <span className="text-white font-semibold">{r.symbol}</span>
                    <span className="text-slate-500">{r.lots} lots</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${r.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(r.pnl, currency, settings.usdToKesRate, true)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Successfully imported {successCount} trades into Day {settings.activeDay} journal!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleApplyImport}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              parsedRows.length > 0
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:opacity-90 shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import {parsedRows.length} Trades</span>
          </button>
        </div>

      </div>
    </div>
  );
};
