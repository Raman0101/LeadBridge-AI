import './globals.css';
import type { Metadata } from 'next';
import ThemeToggle from './components/ThemeToggle';
import MouseGradient from './components/MouseGradient';
import { Github } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LeadBridge AI — Universal CRM Lead Importer',
  description: 'AI-powered universal CSV lead importer. Upload any CSV and intelligently map it to your CRM.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html:
          `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`
        }} />
      </head>
      <body className="min-h-screen font-sans">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-slate-800/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-700/10 dark:bg-slate-300/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Mouse-following gradient overlay */}
        <MouseGradient />

        {/* Header with glass morphism */}
        <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-white dark:to-slate-300 shadow-lg shadow-slate-900/25 dark:shadow-white/20">
                  <svg className="w-5 h-5 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold gradient-text">LeadBridge</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">AI Importer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Raman0101/LeadBridge-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                             text-slate-500 dark:text-slate-400 
                             hover:text-slate-700 dark:hover:text-slate-200 
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             rounded-lg transition-all duration-200"
                >
                  <Github size={14} />
                  <span>GitHub Repo</span>
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Built with{' '}
                <span className="text-red-500 inline-block animate-bounce-gentle">❤</span>
                {' '}by{' '}
                <span className="font-semibold gradient-text">
                  Raman
                </span>
                {' '}— passionate about building great software.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/raman-kumar-bhagat0101/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                             text-slate-500 dark:text-slate-400 
                             hover:text-slate-700 dark:hover:text-slate-200 
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             rounded-lg transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Raman0101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                             text-slate-500 dark:text-slate-400 
                             hover:text-slate-700 dark:hover:text-slate-200 
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             rounded-lg transition-all duration-200"
                >
                  <Github size={14} />
                  GitHub
                </a>
                <a
                  href="mailto:rkinfo1104@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                             text-slate-500 dark:text-slate-400 
                             hover:text-slate-700 dark:hover:text-slate-200 
                             hover:bg-slate-100 dark:hover:bg-slate-800
                             rounded-lg transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
                &copy; {new Date().getFullYear()} LeadBridge AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}