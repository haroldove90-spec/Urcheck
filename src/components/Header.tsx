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
  ShieldAlert,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccessMessage('¡Aplicación instalada con éxito!');
        setTimeout(() => setInstallSuccessMessage(null), 4000);
      }
    } else {
      // Show guided instructions for iOS or desktop browser
      setShowInstallModal(true);
    }
  };

  return (
    <header 
      id="main-institutional-header"
      className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* System Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-900 flex items-center justify-center p-2 shadow-sm border border-neutral-800">
              {/* Biometric Shield Motif in Red and White */}
              <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                <path d="M24 4L38 9V22C38 31 32 39 24 43C16 39 10 31 10 22V9L24 4Z" fill="#dc2626" />
                <path d="M24 14C27.31 14 30 16.69 30 20C30 23.31 27.31 26 24 26C20.69 26 18 23.31 18 20C18 16.69 20.69 14 24 14Z" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="24" cy="20" r="2.5" fill="#ffffff" />
                <path d="M19 28C19 25 29 25 29 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900 leading-none">
                CONTROL <span className="text-red-600">PRO</span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-0.5">
                Control se asistencia PRO
              </span>
            </div>
          </div>

          {/* Right Actions: Role identification, Install PWA button, Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Active Role Identification Badge */}
            <div 
              id="active-role-badge"
              className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-red-600 shadow-xs"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-red-700 leading-none">
                  {currentUser.roleName}
                </span>
              </div>
            </div>

            {/* Quick App Install Button: "Instala Gestión Escolar" */}
            <button
              id="btn-pwa-install"
              onClick={handleInstallClick}
              type="button"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-1 cursor-pointer"
              title="Instalar aplicación en Android, iOS o Computadora"
            >
              <DownloadCloud className="w-4 h-4 shrink-0 animate-bounce" />
              <span className="hidden sm:inline">Instala Gestión Escolar</span>
              <span className="sm:hidden">Instalar</span>
            </button>

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión o cambiar de rol"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="hidden md:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {installSuccessMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {installSuccessMessage}
        </div>
      )}

      {/* PWA Install Guide Modal (Android, iOS Safari, Desktop) */}
      {showInstallModal && (
        <div 
          id="pwa-install-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Instalar Gestión Escolar / Asistencia
                </h3>
                <p className="text-xs text-neutral-500">
                  Instala la app en tu teléfono o computadora para acceso sin conexión
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex items-start gap-3">
                <span className="font-bold text-red-600 bg-red-100 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>En iPhone / iPad (Safari):</strong> Pulsa el botón <Share2 className="w-4 h-4 inline text-blue-600 mx-0.5" /> <em>Compartir</em> en la barra de navegación y selecciona <PlusSquare className="w-4 h-4 inline text-neutral-800 mx-0.5" /> <em>Agregar a pantalla de inicio</em>.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-bold text-red-600 bg-red-100 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>En Android (Chrome):</strong> Toca el menú de opciones (tres puntos verticales) y presiona <em>Instalar aplicación</em> o <em>Añadir a la pantalla principal</em>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-bold text-red-600 bg-red-100 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>En Computadora (Chrome / Edge):</strong> Haz clic en el ícono de instalar en la barra de direcciones o presiona <em>Instala Gestión Escolar</em>.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
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
