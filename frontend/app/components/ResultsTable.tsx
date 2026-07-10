'use client';
import { CRMRecord } from '../types';

const COLUMNS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'created_at', label: 'Created At' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'CC' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'crm_status', label: 'Status' },
  { key: 'crm_note', label: 'Note' },
  { key: 'data_source', label: 'Source' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' },
];

const statusConfig: Record<string, { class: string; dot: string }> = {
  GOOD_LEAD_FOLLOW_UP: {
    class: 'bg-slate-100/80 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50',
    dot: 'bg-slate-500',
  },
  DID_NOT_CONNECT: {
    class: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  BAD_LEAD: {
    class: 'bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200/50 dark:border-red-800/50',
    dot: 'bg-red-500',
  },
  SALE_DONE: {
    class: 'bg-slate-100/80 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50',
    dot: 'bg-slate-500',
  },
};

export default function ResultsTable({ records }: { records: CRMRecord[] }) {
  return (
    <div className="table-wrap animate-fade-in-up">
      <div className="table-scroll">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">#</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="group transition-colors duration-150 hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">{i + 1}</td>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate text-slate-700 dark:text-slate-300" title={String(r[c.key] ?? '')}>
                    {c.key === 'crm_status' && r[c.key] ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${statusConfig[r[c.key]]?.class || ''}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[r[c.key]]?.dot || 'bg-slate-400'}`} />
                        {r[c.key]}
                      </span>
                    ) : (
                      String(r[c.key] ?? '')
                    )}
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