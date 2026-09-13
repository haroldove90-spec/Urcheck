import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Phone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  Share2,
  Lock,
  User,
  Building2
} from 'lucide-react';
import { 
  ACCESS_PORTAL_URL, 
  ShareCredentialsData, 
  formatWhatsAppMessage, 
  getWhatsAppShareUrl 
} from '../utils/credentialUtils';

interface ShareCredentialsModalProps {
  data: ShareCredentialsData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCredentialsModal: React.FC<ShareCredentialsModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [editablePhone, setEditablePhone] = useState(data?.phone || '');

  // Keep editablePhone in sync when data changes
  React.useEffect(() => {
    if (data?.phone) {
      setEditablePhone(data.phone);
    } else {
      setEditablePhone('');
    }
  }, [data?.phone]);

  if (!isOpen || !data) return null;

  const currentData: ShareCredentialsData = {
    ...data,
    phone: editablePhone,
  };

  const messageText = formatWhatsAppMessage(currentData);
  const whatsappUrl = getWhatsAppShareUrl(editablePhone, messageText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="share-credentials-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1F832D]/10 text-[#1F832D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#1F832D] block">
                Registro Exitoso • Acceso Activado
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#093244]">
                Compartir Credenciales de Acceso
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs sm:text-sm">
          
          {/* Success banner */}
          <div className="bg-[#093244] text-white p-4 rounded-2xl border border-[#082735] shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-neutral-300">Colaborador / Usuario</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#069AD8] text-white">
                {data.roleName}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">{data.name}</h4>
                {data.branchName && (
                  <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#069AD8]" />
                    {data.branchName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Credentials Box */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Link de Acceso Oficial
              </span>
              <div className="mt-1 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-neutral-300">
                <a 
                  href={ACCESS_PORTAL_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#069AD8] font-bold hover:underline truncate"
                >
                  {ACCESS_PORTAL_URL}
                </a>
                <a
                  href={ACCESS_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-[#069AD8] p-1"
                  title="Abrir enlace"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Usuario Asignado
                </span>
                <div className="mt-1 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold text-[#093244]">
                  <span className="truncate">{data.username}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Contraseña Segura
                </span>
                <div className="mt-1 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold text-[#093244]">
                  <span className="truncate">
                    {showPassword ? data.password : '••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-[#069AD8] p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Destination WhatsApp Phone */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Número de WhatsApp para Envío Directo
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#1F832D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Ej. +52 55 1234 5678"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-[#1F832D] bg-white"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Si no ingresas número, WhatsApp abrirá tu lista de contactos para seleccionar.
              </span>
            </div>
          </div>

          {/* Preview of text */}
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Vista previa del mensaje:
            </span>
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-950 font-sans whitespace-pre-line leading-relaxed">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold text-xs transition cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#1F832D]" />
                <span className="text-[#1F832D]">¡Credenciales Copiadas!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-500" />
                <span>Copiar al Portapapeles</span>
              </>
            )}
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-xs"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F832D] hover:bg-[#0e661f] active:scale-95 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              {/* WhatsApp Icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
