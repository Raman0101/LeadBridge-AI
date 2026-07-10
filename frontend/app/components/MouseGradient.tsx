'use client';

import { useEffect, useRef } from 'react';

export default function MouseGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      el.style.background = `radial-gradient(600px circle at ${x}% ${y}%, rgba(148, 163, 184, 0.08) 0%, transparent 80%)`;
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{ background: 'radial-gradient(600px circle at 50% 50%, transparent 0%, transparent 80%)' }}
    />
  );
}