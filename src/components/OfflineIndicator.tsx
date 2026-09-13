import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      id="pwa-offline-indicator"
      className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#093244] text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-400 animate-in fade-in"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>Modo sin conexión — Datos locales activos en la App</span>
    </div>
  );
};
