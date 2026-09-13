import React from 'react';
import { 
  DownloadCloud, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Zap, 
  WifiOff 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  };

  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="pwa-install-app-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-neutral-200 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Urcheck Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <img 
            src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urcheckicono.png" 
            alt="Urcheck Icon" 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-md border-2 border-[#069AD8]/30 object-contain p-1 bg-white shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1F832D]/10 text-[#1F832D]">
              <CheckCircle2 className="w-3 h-3" />
              App Nativa PWA Certificada
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#093244] mt-0.5">
              Instalar Urcheck en tu Móvil
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Instálala como aplicación independiente, sin barras de navegador.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 bg-[#f8f9fa] p-3.5 rounded-2xl border border-neutral-200/80">
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 text-left">
            <Zap className="w-4 h-4 text-[#069AD8] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#093244]">100% Pantalla Completa</p>
              <p className="text-[11px] text-neutral-500">Sin URL ni controles de navegador</p>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 text-left">
            <Smartphone className="w-4 h-4 text-[#1F832D] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#093244]">Ícono en tu Celular</p>
              <p className="text-[11px] text-neutral-500">En tu cajón de apps y pantalla</p>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 text-left">
            <WifiOff className="w-4 h-4 text-[#093244] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#093244]">Modo Sin Conexión</p>
              <p className="text-[11px] text-neutral-500">Carga rápida instantánea</p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        {isInstalled ? (
          <div className="p-3.5 rounded-xl bg-[#1F832D]/10 border border-[#1F832D]/30 text-center mb-4">
            <p className="text-xs font-bold text-[#1F832D] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Urcheck ya se encuentra instalada como App en este dispositivo
            </p>
          </div>
        ) : isInstallable ? (
          <div className="mb-5">
            <button
              id="modal-btn-direct-install"
              onClick={handleDirectInstall}
              type="button"
              className="w-full py-3.5 px-4 rounded-xl bg-[#093244] hover:bg-[#069AD8] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <DownloadCloud className="w-5 h-5 text-[#069AD8]" />
              Instalar Aplicación Ahora (1 Clic)
            </button>
            <p className="text-[11px] text-center text-neutral-500 mt-1.5">
              Se abrirá el instalador oficial de tu sistema operativo.
            </p>
          </div>
        ) : isInIframe ? (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
            <p className="text-xs font-bold text-amber-900 mb-1">
              Estás en la vista previa del editor
            </p>
            <p className="text-[11px] text-amber-800 mb-3">
              Por seguridad, los navegadores solo permiten la instalación directa cuando abres la aplicación en su propia ventana.
            </p>
            <button
              onClick={handleOpenStandalone}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-[#093244] hover:bg-[#069AD8] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en nueva pestaña para Instalar Directamente
            </button>
          </div>
        ) : null}

        {/* Device-Specific Direct Instructions */}
        <div className="space-y-3 border-t border-neutral-100 pt-4">
          <p className="text-xs font-bold text-[#093244] uppercase tracking-wider">
            Instalación según tu dispositivo:
          </p>

          {/* Android / Chrome Flow */}
          <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70">
            <div className="flex items-center gap-2 mb-1.5">
              <Smartphone className="w-4 h-4 text-[#1F832D]" />
              <span className="text-xs font-bold text-neutral-900">En Android (Google Chrome / Edge)</span>
            </div>
            <ol className="text-xs text-neutral-600 space-y-1 pl-5 list-decimal">
              <li>Toca el menú de <strong>tres puntos (⋮)</strong> en la esquina superior de Chrome.</li>
              <li>Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Instalar Urcheck"</strong>.</li>
              <li>Confirma en <strong>"Instalar"</strong>. Se descargará como app oficial con ícono propio.</li>
            </ol>
          </div>

          {/* iOS / iPhone Flow */}
          <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70">
            <div className="flex items-center gap-2 mb-1.5">
              <Share2 className="w-4 h-4 text-[#069AD8]" />
              <span className="text-xs font-bold text-neutral-900">En iPhone o iPad (Safari)</span>
            </div>
            <ol className="text-xs text-neutral-600 space-y-1 pl-5 list-decimal">
              <li>Abre el enlace en <strong>Safari</strong> y toca el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba).</li>
              <li>Desliza hacia abajo y pulsa <strong>"Agregar a Inicio"</strong> (o "Añadir a pantalla de inicio").</li>
              <li>Pulsa <strong>"Agregar"</strong> en la esquina superior. ¡Listo! Se iniciará a pantalla completa como App.</li>
            </ol>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
