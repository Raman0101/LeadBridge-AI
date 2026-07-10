'use client';
import { Loader2, Sparkles } from 'lucide-react';

export default function ProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-300 
                          flex items-center justify-center shadow-lg shadow-slate-900/25 dark:shadow-white/20">
            <Loader2 className="animate-spin text-white dark:text-slate-900" size={24} />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-slate-500/30 to-slate-400/30 
                          animate-pulse blur-sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              AI Processing
            </h3>
            <Sparkles size={14} className="text-slate-500 dark:text-slate-400 animate-bounce-gentle" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Extracting CRM fields from your data&hellip;
          </p>

          <div className="relative">
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 
                           dark:from-white dark:via-slate-200 dark:to-slate-400
                           transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 shimmer-bg opacity-50" />
              </div>
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{progress}% complete</span>
              <span className="font-mono">
                {progress < 30 ? 'Analyzing...' : progress < 60 ? 'Processing...' : progress < 90 ? 'Formatting...' : 'Finalizing...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}