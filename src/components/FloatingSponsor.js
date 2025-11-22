"use client";
import React, { useEffect, useState } from 'react';
import Sponsor from './Sponsor';

const STORAGE_KEY = 'floatingSponsorDismissed';

const FloatingSponsor = ({ href = 'https://astralshiftpro.com', alt = 'Astral Shift Pro', imgSrc = '/images/astralshift-logo-light.png' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed flag
    try {
      const dismissed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const dismiss = (remember = true) => {
    setVisible(false);
    if (typeof window !== 'undefined' && remember) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch (e) {
        // ignore
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:hidden">
      {/* White rounded background so the logo and text are readable on dark backgrounds */}
      <div className="relative flex flex-col items-center gap-2 bg-white/95 text-black px-3 py-3 rounded-full shadow-lg backdrop-blur-md hover:scale-105 transition-transform transform-gpu">
        {/* Top text */}
        <span className="text-xs uppercase text-slate-700 leading-none">Patrocínios</span>

        {/* Centered logo */}
        <Sponsor showText={false} isCircular={true} imgSrc={imgSrc} alt={alt} href={href} imgClassName="h-8" containerClass="p-0" />

        {/* Dismiss button: positioned top-right */}
        <button
          aria-label="Dismiss sponsor"
          title="Dismiss"
          onClick={() => dismiss(true)}
          className="absolute right-1 top-1 text-gray-800 opacity-80 hover:opacity-100 p-1 rounded"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FloatingSponsor;
