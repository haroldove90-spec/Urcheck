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
          
          {/* System Logo: Urcheck */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0A3142] flex items-center justify-center p-1.5 sm:p-2 shadow-xs border border-[#082633] shrink-0">
              {/* Shield & Fingerprint in #0871A0 and White */}
              <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                <path d="M24 4L38 9V22C38 31 32 39 24 43C16 39 10 31 10 22V9L24 4Z" fill="#0871A0" />
                <path d="M24 14C27.31 14 30 16.69 30 20C30 23.31 27.31 26 24 26C20.69 26 18 23.31 18 20C18 16.69 20.69 14 24 14Z" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="24" cy="20" r="2.5" fill="#ffffff" />
                <path d="M19 28C19 25 29 25 29 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[#0A3142] leading-none">
                Ur<span className="text-[#0871A0]">check</span>
              </span>
              <span className="hidden sm:block text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-0.5">
                Control Biométrico
              </span>
            </div>
          </div>

          {/* Right Actions: Role identification, Install button, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            
            {/* Active Role Identification Badge */}
            <div 
              id="active-role-badge"
              title={`${currentUser.name} (${currentUser.roleName})`}
              className="flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-3 py-1 rounded-full bg-[#0A3142]/5 border border-[#0871A0]/20 max-w-[150px] sm:max-w-[220px] md:max-w-none"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#0871A0] shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#138128] border-2 border-white" />
              </div>
              <div className="hidden xs:flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#0A3142] leading-tight truncate">
                  {currentUser.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-[#0871A0] leading-none truncate">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
            </div>

            {/* Quick App Install Button */}
            <button
              id="btn-pwa-install"
              onClick={handleInstallClick}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 text-xs font-bold text-white bg-[#0A3142] hover:bg-[#0871A0] active:scale-95 transition-all rounded-xl shadow-xs cursor-pointer shrink-0"
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
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-neutral-700 hover:text-[#0A3142] bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión o cambiar de rol"
            >
              <LogOut className="w-4 h-4 text-[#0871A0] shrink-0" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {installSuccessMessage && (
        <div className="bg-[#138128] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
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
              <div className="w-12 h-12 rounded-xl bg-[#0871A0]/10 text-[#0871A0] flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A3142]">
                  Instalar Urcheck
                </h3>
                <p className="text-xs text-neutral-500">
                  Control de asistencia biométrico disponible sin conexión
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#0A3142] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>En iPhone / iPad (Safari):</strong> Pulsa el botón <Share2 className="w-4 h-4 inline text-[#0871A0] mx-0.5" /> <em>Compartir</em> y selecciona <PlusSquare className="w-4 h-4 inline text-neutral-800 mx-0.5" /> <em>Agregar a pantalla de inicio</em>.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#0A3142] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>En Android (Chrome):</strong> Toca el menú de opciones (tres puntos verticales) y presiona <em>Instalar aplicación</em> o <em>Añadir a la pantalla principal</em>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-white bg-[#0A3142] w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
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
                className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white transition-colors cursor-pointer"
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
