'use client';
import { RecordString } from '../types';
import { Table2 } from 'lucide-react';

export default function PreviewTable({ headers, records }: { headers: string[]; records: RecordString[] }) {
  return (
    <div className="table-wrap animate-fade-in-up">
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <Table2 size={16} className="text-slate-500 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Previewing {records.length} rows &middot; {headers.length} columns
        </span>
      </div>
      <div className="table-scroll">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">#</th>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((row, i) => (
              <tr key={i} className="group transition-colors duration-150 hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">{i + 1}</td>
                {headers.map((h) => (
                  <td key={h} className="px-4 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {row[h] ?? <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}