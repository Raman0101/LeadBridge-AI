'use client';
import { CheckCircle2, XCircle, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

function AnimatedNumber({ value, label, icon: Icon, color, gradient, delay = 0 }: {
  value: number;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          setDisplay(value);
          clearInterval(interval);
        } else {
          setDisplay(start);
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="relative group animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
           style={{ backgroundImage: gradient }} />
      <div className="relative p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 
                      bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm
                      hover:border-slate-300/80 dark:hover:border-slate-700/80 
                      transition-all duration-300 shadow-lg shadow-slate-200/50 dark:shadow-black/20
                      group-hover:shadow-xl group-hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </span>
          <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon size={16} className="text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold tabular-nums tracking-tight text-slate-800 dark:text-slate-200">
          {display}
        </div>
        <div className="mt-2 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${color}`}
               style={{ width: `${Math.min(100, (display / (value || 1)) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCard({ parsed, skipped, total }: { parsed: number; skipped: number; total: number }) {
  const cards = [
    { label: 'Total Processed', value: total, icon: FileSpreadsheet, color: 'from-slate-500 to-slate-600', gradient: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(71,85,105,0.1))' },
    { label: 'Imported', value: parsed, icon: CheckCircle2, color: 'from-slate-700 to-slate-800', gradient: 'linear-gradient(135deg, rgba(51,65,85,0.15), rgba(30,41,59,0.1))' },
    { label: 'Skipped', value: skipped, icon: XCircle, color: 'from-red-500 to-red-600', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))' },
  ];

  const successRate = total > 0 ? Math.round((parsed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <AnimatedNumber key={c.label} {...c} delay={i * 100} />
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 
                      bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</span>
          </div>
          <span className="text-lg font-bold gradient-text">{successRate}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-slate-700 to-slate-500 dark:from-white dark:to-slate-300 transition-all duration-1000 ease-out shadow-lg shadow-slate-900/25 dark:shadow-white/20"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}