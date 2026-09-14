import React, { useState } from 'react';
import { UserProfile, Employee, Branch } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { SupabaseConnectionModal } from './SupabaseConnectionModal';
import { 
  LogOut, 
  DownloadCloud, 
  CheckCircle2, 
  Database,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  employees?: Employee[];
  branches?: Branch[];
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout,
  employees = [],
  branches = [],
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallSuccessMessage('¡Urcheck instalado con éxito como App!');
        setTimeout(() => setInstallSuccessMessage(null), 4000);
        return;
      }
    }
    setShowInstallModal(true);
  };

  return (
    <header 
      id="main-institutional-header"
      className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 gap-2">
          
          {/* System Logo: Urcheck - Real-size, unencapsulated, pristine aspect ratio */}
          <div className="flex items-center shrink-0 py-1">
            <img 
              id="header-urcheck-logo"
              src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png" 
              alt="Urcheck" 
              className="h-8 sm:h-9 md:h-10 w-auto max-w-[180px] sm:max-w-[240px] object-contain cursor-pointer"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right Actions: Role identification, Install button, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            
            {/* Active Role Identification Badge */}
            <div 
              id="active-role-badge"
              title={`${currentUser.name} (${currentUser.roleName})`}
              className="flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-3 py-1 rounded-full bg-[#093244]/5 border border-[#069AD8]/20 max-w-[150px] sm:max-w-[220px] md:max-w-none"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#069AD8] shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1F832D] border-2 border-white" />
              </div>
              <div className="hidden xs:flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#093244] leading-tight truncate">
                  {currentUser.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-[#069AD8] leading-none truncate">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
            </div>

            {/* Supabase Realtime Database Test Button - Always visible to verify connection */}
            <button
              id="btn-test-supabase-header"
              onClick={() => setShowSupabaseModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-[#093244] bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 border border-emerald-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
              title="Probar conexión en vivo con Supabase Database"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="hidden sm:inline text-neutral-700">Supabase</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Test
              </span>
            </button>

            {/* Quick App Install Button - Always accessible and visible */}
            {!isInstalled && (
              <button
                id="btn-pwa-install"
                onClick={handleInstallClick}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-[#093244] hover:bg-[#069AD8] active:scale-95 transition-all rounded-xl shadow-xs cursor-pointer shrink-0 border border-[#069AD8]/40"
                title="Instalar Urcheck directamente en tu dispositivo como App móvil"
              >
                <DownloadCloud className="w-4 h-4 text-[#069AD8] group-hover:text-white shrink-0 animate-pulse" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden text-[11px]">Instalar</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-neutral-700 hover:text-[#093244] bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión o cambiar de rol"
            >
              <LogOut className="w-4 h-4 text-[#069AD8] shrink-0" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {installSuccessMessage && (
        <div className="bg-[#1F832D] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {installSuccessMessage}
        </div>
      )}

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onSuccess={() => {
          setInstallSuccessMessage('¡Urcheck instalado con éxito como App!');
          setTimeout(() => setInstallSuccessMessage(null), 4000);
        }}
      />

      {/* Supabase Connection Test & Health Modal */}
      <SupabaseConnectionModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        employees={employees}
        branches={branches}
      />
    </header>
  );
};
