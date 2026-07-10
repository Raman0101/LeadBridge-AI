'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 
                 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
                 hover:bg-slate-100 dark:hover:bg-slate-700/80
                 active:scale-95 transition-all duration-300
                 shadow-sm hover:shadow-md
                 group overflow-hidden"
    >
      <div className="relative z-10 transition-transform duration-500"
           style={{ transform: dark ? 'rotate(360deg)' : 'rotate(0deg)' }}
      >
        {dark ? (
          <Sun size={18} className="text-amber-400 transition-all duration-300 group-hover:scale-110" />
        ) : (
          <Moon size={18} className="text-slate-600 transition-all duration-300 group-hover:scale-110" />
        )}
      </div>
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-r from-slate-500/5 to-slate-400/5" />
    </button>
  );
}