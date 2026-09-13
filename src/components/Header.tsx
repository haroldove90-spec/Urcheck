import React, { useState } from 'react';
import { UserProfile } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  LogOut, 
  DownloadCloud, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  Smartphone,
  Fingerprint
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccessMessage('¡Urcheck instalado con éxito!');
        setTimeout(() => setInstallSuccessMessage(null), 4000);
      }
    } else {
      setShowInstallModal(true);
    }
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

            {/* Quick App Install Button */}
            <button
              id="btn-pwa-install"
              onClick={handleInstallClick}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 text-xs font-bold text-white bg-[#093244] hover:bg-[#069AD8] active:scale-95 transition-all rounded-xl shadow-xs cursor-pointer shrink-0"
              title="Instalar aplicación en tu dispositivo"
            >
              <DownloadCloud className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Instala Urcheck</span>
              <span className="hidden sm:inline md:hidden">Instalar</span>
            </button>

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
      {showInstallModal && (
        <div 
          id="pwa-install-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#069AD8]/10 text-[#069AD8] flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#093244]">
                  Instalar Urcheck
                </h3>
                <p className="text-xs text-neutral-500">
                  Control de asistencia biométrico disponible sin conexión
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#093244] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>En iPhone / iPad (Safari):</strong> Pulsa el botón <Share2 className="w-4 h-4 inline text-[#069AD8] mx-0.5" /> <em>Compartir</em> y selecciona <PlusSquare className="w-4 h-4 inline text-neutral-800 mx-0.5" /> <em>Agregar a pantalla de inicio</em>.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#093244] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>En Android (Chrome):</strong> Toca el menú de opciones (tres puntos verticales) y presiona <em>Instalar aplicación</em> o <em>Añadir a la pantalla principal</em>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#093244] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>En Computadora (Chrome / Edge):</strong> Haz clic en el ícono de instalar en la barra de direcciones o presiona el botón <em>Instala Urcheck</em>.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#093244] hover:bg-[#069AD8] text-white transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
