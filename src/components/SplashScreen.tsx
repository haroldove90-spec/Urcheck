import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1600,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDurationMs);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        onFinish();
      }
    }, minDurationMs + 400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [minDurationMs, onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="urcheck-splash-screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ease-out px-6 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Real-size Logo on pure white background */}
      <div className="relative z-10 flex flex-col items-center max-w-full">
        <img
          id="splash-logo-image"
          src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png"
          alt="Urcheck"
          className="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[200px] object-contain transition-transform duration-700 ease-out scale-100 animate-in fade-in zoom-in-95"
          referrerPolicy="no-referrer"
        />

        {/* Minimal Progress Indicator with Brand Colors */}
        <div className="mt-5 w-32 sm:w-40 h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#069AD8] via-[#1F832D] to-[#069AD8] rounded-full animate-pulse" />
        </div>

        <p className="mt-2.5 text-[11px] sm:text-xs tracking-wider font-semibold text-[#093244]/70 uppercase">
          Control de Asistencia Biométrico
        </p>
      </div>
    </div>
  );
};
