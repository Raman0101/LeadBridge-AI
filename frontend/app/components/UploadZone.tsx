'use client';
import { useState, useCallback, DragEvent } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFile, disabled }: Props) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDrag(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.toLowerCase().endsWith('.csv')) { setFile(f); onFile(f); }
  }, [disabled, onFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); onFile(f); }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative group cursor-pointer overflow-hidden',
        'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300',
        drag
          ? 'border-slate-400 dark:border-slate-500 bg-slate-100/80 dark:bg-transparent scale-[1.02]'
          : file
            ? 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-transparent'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-transparent',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && document.getElementById('csv-input')?.click()}
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-slate-500/0 via-slate-500/0 to-slate-400/0 transition-opacity duration-500',
        isHovered && !disabled && !drag && 'from-slate-500/[0.03] via-slate-500/[0.02] to-slate-400/[0.03]'
      )} />

      <input id="csv-input" type="file" accept=".csv" hidden onChange={handleFileSelect} />

      {file ? (
        <div className="relative animate-scale-in">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="text-slate-600 dark:text-slate-400" size={32} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white dark:text-slate-900" />
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(1)} KB &middot; Ready for preview
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 
                       bg-red-50 dark:bg-red-950/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 
                       transition-colors"
          >
            <X size={14} />
            Remove
          </button>
        </div>
      ) : (
        <div className="relative space-y-4">
          <div className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500',
            drag
              ? 'bg-slate-200 dark:bg-white/10 scale-110'
              : 'bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10'
          )}>
            <UploadCloud
              className={cn(
                'transition-all duration-500',
                drag ? 'text-slate-700 dark:text-slate-300 scale-110' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              )}
              size={40}
            />
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {drag ? 'Drop your file here' : 'Drag & drop your CSV here'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              or <span className="text-slate-700 dark:text-slate-300 font-medium underline underline-offset-2 decoration-slate-400/30">click to browse</span>
              {' '}&mdash; Facebook, Google Ads, real estate CRM exports&hellip;
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">.csv</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Max 50MB</span>
          </div>
        </div>
      )}
    </div>
  );
}