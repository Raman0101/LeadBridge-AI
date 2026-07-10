'use client';
import { useState } from 'react';
import UploadZone from './components/UploadZone';
import PreviewTable from './components/PreviewTable';
import ResultsTable from './components/ResultsTable';
import StatsCard from './components/StatsCard';
import ProgressIndicator from './components/ProgressIndicator';
import { parseCSV, extractCRM } from './lib/api';
import type { ParsedCSVResponse, ExtractionResult } from './types';
import { ArrowRight, RotateCcw, Download, AlertCircle, ArrowLeft, Database, Sparkles, Zap, Shield, Brain, BarChart3 } from 'lucide-react';

type Stage = 'upload' | 'preview' | 'processing' | 'results';

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload');
  const [parsed, setParsed] = useState<ParsedCSVResponse | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'parsed' | 'skipped'>('parsed');

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const data = await parseCSV(file);
      setParsed(data);
      setStage('preview');
    } catch (e: any) {
      setError(e.message || 'Failed to parse CSV');
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setStage('processing');
    setError(null);
    setProgress(0);

    const total = parsed.records.length;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.max(1, Math.floor(100 / Math.ceil(total / 25))), 95));
    }, 500);

    try {
      const res: ExtractionResult = await extractCRM(parsed.records);
      clearInterval(interval);
      setProgress(100);
      setResult(res);
      setActiveTab('parsed');
      setTimeout(() => setStage('results'), 300);
    } catch (e: any) {
      clearInterval(interval);
      setError(e.message || 'AI extraction failed');
      setStage('preview');
    }
  };

  const handleReset = () => {
    setParsed(null); setResult(null); setError(null); setProgress(0); setStage('upload');
  };

  const downloadCSV = () => {
    if (!result) return;
    const headers = Object.keys(result.parsed[0] || {}).join(',');
    const rows = result.parsed.map((r) =>
      Object.values(r).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'groweasy_crm_import.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="error-banner animate-fade-in-down flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Something went wrong</p>
            <p className="text-sm mt-0.5 opacity-80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-200/50 dark:hover:bg-red-900/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Stage */}
      {(stage === 'upload' || stage === 'preview') && (
        <div className="animate-fade-in-up">
          {/* Stage indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                              ${stage === 'upload' 
                                ? 'bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 shadow-lg shadow-slate-900/25 dark:shadow-white/20 scale-110' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                1
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${stage === 'upload' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                Upload
              </span>
            </div>
            <div className={`w-20 h-0.5 rounded-full transition-colors duration-500 ${stage === 'preview' ? 'bg-slate-600 dark:bg-slate-300' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                              ${stage === 'preview' 
                                ? 'bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 shadow-lg shadow-slate-900/25 dark:shadow-white/20 scale-110' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                2
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${stage === 'preview' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                Preview
              </span>
            </div>
          </div>

          {/* Hero Section */}
          {stage === 'upload' && !error && (
            <div className="text-center mb-10 space-y-6 animate-fade-in">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                              bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 
                              border border-slate-200/60 dark:border-slate-700/50 
                              shadow-sm">
                <Sparkles size={14} className="text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Universal CRM Compatibility
                </span>
              </div>

              {/* Main heading */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  <span className="gradient-text">
                    LeadBridge AI
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
                  AI-Powered Universal CRM Lead Importer
                </p>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Upload any CSV file — from Facebook Ads, Google Ads, real estate CRM exports, or any other source — 
                  and let our AI intelligently extract and map the data to your CRM fields. No manual mapping required.
                </p>
              </div>

              {/* Trust metrics / Value props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  { icon: Zap, label: 'Smart Detection', desc: 'Auto-detects fields & formats' },
                  { icon: Brain, label: 'AI-Powered', desc: 'Intelligent data extraction' },
                  { icon: Shield, label: 'Secure', desc: 'Your data stays private' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl 
                                          bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm
                                          border border-slate-300/80 dark:border-slate-700/80
                                          hover:border-slate-400/80 dark:hover:border-slate-600/80
                                          transition-all duration-300 group">
                    <div className="p-2 rounded-lg bg-slate-300 dark:bg-slate-800 
                                    group-hover:scale-110 transition-transform duration-300">
                      <item.icon size={16} className="text-slate-800 dark:text-slate-300" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <UploadZone onFile={handleFile} disabled={stage === 'preview'} />
        </div>
      )}

      {/* Preview Stage */}
      {stage === 'preview' && parsed && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 shadow-lg shadow-slate-900/25 dark:shadow-white/20">
                <Database size={20} className="text-white dark:text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Preview Your Data
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{parsed.total_rows}</span> rows,{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{parsed.headers.length}</span> columns detected
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleReset} className="btn-secondary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-sm">
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={handleConfirm} className="btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-sm">
                Confirm Import
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <PreviewTable headers={parsed.headers} records={parsed.records.slice(0, 200)} />

          {parsed.total_rows > 200 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              Showing first 200 rows. All <strong>{parsed.total_rows}</strong> rows will be sent to AI on confirm.
            </div>
          )}
        </div>
      )}

      {/* Processing Stage */}
      {stage === 'processing' && (
        <div className="py-12 animate-scale-in">
          <ProgressIndicator progress={progress} />
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Stage indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/25 dark:shadow-white/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploaded</span>
            </div>
            <div className="w-20 h-0.5 bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-300 dark:to-slate-400 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/25 dark:shadow-white/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Processed</span>
            </div>
            <div className="w-20 h-0.5 bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-300 dark:to-slate-400 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/25 dark:shadow-white/20">
                3
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Results</span>
            </div>
          </div>

          <StatsCard parsed={result.total_parsed} skipped={result.total_skipped} total={result.total_processed} />

          {/* Tabs & actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('parsed')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'parsed' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Parsed ({result.total_parsed})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('skipped')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'skipped' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  Skipped ({result.total_skipped})
                </span>
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={downloadCSV} className="btn-secondary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-sm">
                <Download size={16} />
                Download CSV
              </button>
              <button onClick={handleReset} className="btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-sm">
                <RotateCcw size={16} />
                Import Another
              </button>
            </div>
          </div>

          {activeTab === 'parsed' ? (
            <ResultsTable records={result.parsed} />
          ) : (
            <div className="table-wrap animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Rows that could not be imported
                </span>
              </div>
              <div className="table-scroll">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skipped.map((s) => (
                      <tr key={s.row_index} className="group transition-colors duration-150 hover:bg-red-50/50 dark:hover:bg-red-950/20">
                        <td className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">{s.row_index + 1}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Row {s.row_index + 1}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium 
                                        bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-300 
                                        border border-red-200/50 dark:border-red-800/50">
                            {s.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}