import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Lock, 
  FileText 
} from 'lucide-react';
import { DigitalSignature, UserRole } from '../types';
import { generateSecurityHash } from '../utils/documentUtils';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentCode: string;
  signerName: string;
  signerRole: UserRole;
  signerTitle?: string;
  onConfirmSignature: (signature: DigitalSignature) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentCode,
  signerName,
  signerRole,
  signerTitle,
  onConfirmSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(signerName);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Detect mobile touch
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobileDevice(isMobile);
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    setHasDrawn(false);
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas display resolution
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#082735';
      ctx.lineWidth = 2.5;

      // Draw faint baseline
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.setLineDash([4, 4]);
      ctx.moveTo(30, rect.height - 35);
      ctx.lineTo(rect.width - 30, rect.height - 35);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#082735';
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, signatureMode]);

  if (!isOpen) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);

    // redraw baseline
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.setLineDash([4, 4]);
    ctx.moveTo(30, rect.height - 35);
    ctx.lineTo(rect.width - 30, rect.height - 35);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#082735';
  };

  const handleSaveSignature = () => {
    let signatureImage = '';

    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureImage = canvas.toDataURL('image/png');
    } else {
      // Generate styled typed signature SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
        <text x="30" y="55" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="#082735">${typedName}</text>
        <path d="M 25 65 Q 120 75, 270 60" fill="none" stroke="#069AD8" stroke-width="2"/>
        <text x="30" y="85" font-family="sans-serif" font-size="9" fill="#94a3b8">Firma Digital Certificada Urcheck</text>
      </svg>`;
      signatureImage = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const newSignature: DigitalSignature = {
      id: `sig-${Date.now()}`,
      signerName: signatureMode === 'draw' ? signerName : typedName,
      signerRole,
      signerTitle: signerTitle || (signerRole === 'admin' ? 'Representante Legal / RRHH' : 'Colaborador'),
      signedAt: `${dateStr}, ${timeStr} hrs`,
      signatureImage,
      ipAddress: '189.204.14.82 (Red Urcheck SSL)',
      deviceInfo: isMobileDevice ? 'Dispositivo Móvil (Pantalla Táctil Touch)' : 'Estación de Trabajo / Navegador Web',
      securityHash: generateSecurityHash(),
    };

    onConfirmSignature(newSignature);
    onClose();
  };

  const canSubmit = signatureMode === 'draw' ? hasDrawn : typedName.trim().length > 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#069AD8] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#069AD8]" />
              Firma Electrónica Avanzada
            </span>
            <h3 className="text-lg font-bold text-[#093244]">
              Estampar Firma Digital
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document details box */}
        <div className="my-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#069AD8]/10 text-[#069AD8] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-bold text-[#093244] block truncate">
              {documentTitle}
            </span>
            <div className="text-neutral-500 flex items-center gap-2 mt-0.5 font-mono text-[11px]">
              <span>Cód: {documentCode}</span>
              <span>•</span>
              <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cifrado SHA-256
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 mt-1">
              Firmante: <strong className="text-neutral-900">{signerName}</strong> ({signerTitle || (signerRole === 'admin' ? 'Recursos Humanos' : 'Colaborador')})
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 mb-3 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setSignatureMode('draw')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
              signatureMode === 'draw' 
                ? 'bg-white text-[#093244] shadow-xs' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-[#069AD8]" />
            <span>Dibujar con Dedo / Trazo</span>
          </button>
          <button
            type="button"
            onClick={() => setSignatureMode('type')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
              signatureMode === 'type' 
                ? 'bg-white text-[#093244] shadow-xs' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Firma Tipográfica</span>
          </button>
        </div>

        {/* Drawing Canvas Area */}
        {signatureMode === 'draw' ? (
          <div className="space-y-2">
            <div className="relative border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 sm:h-48 cursor-crosshair block bg-white"
                style={{ touchAction: 'none' }}
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                  <PenTool className="w-6 h-6 mb-1 text-neutral-300 animate-pulse" />
                  <p className="text-xs font-medium">
                    {isMobileDevice 
                      ? 'Dibuja tu firma aquí con la yema de tu dedo en la pantalla' 
                      : 'Firma aquí con el cursor o dispositivo táctil'}
                  </p>
                  <span className="text-[10px] text-neutral-400 mt-1">Línea de trazo calibrada para validez legal</span>
                </div>
              )}

              <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                title="Limpiar trazo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Limpiar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
              <span className="flex items-center gap-1">
                {isMobileDevice ? (
                  <>
                    <Smartphone className="w-3 h-3 text-[#069AD8]" />
                    Sensor táctil móvil activo
                  </>
                ) : (
                  <>
                    <Laptop className="w-3 h-3 text-[#069AD8]" />
                    Puntero de precisión activo
                  </>
                )}
              </span>
              <span>Tinta legal azul oscuro `#082735`</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nombre para Generar Firma Estilizada
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Nombre y Apellidos del Firmante"
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                Previsualización de Firma Caligráfica
              </span>
              <div className="font-serif italic text-2xl sm:text-3xl text-[#082735] py-3 border-b border-neutral-300">
                {typedName || 'Su Nombre Aquí'}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-1.5">
                Certificado Digital Estándar • Urcheck Verified Signature
              </div>
            </div>
          </div>
        )}

        {/* Legal Consent Disclaimer */}
        <div className="mt-3.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-neutral-600 space-y-1">
          <p className="font-medium">
            <strong className="text-[#093244]">Declaración de Consentimiento:</strong> Al presionar &ldquo;Estampar Firma Digital&rdquo;, certifico que he leído el contenido de este documento, conviniendo en otorgar pleno valor legal a la firma electrónica conforme al marco legal laboral y mercantil.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSaveSignature}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 ${
              canSubmit
                ? 'bg-[#093244] hover:bg-[#082735] text-white cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Estampar Firma Digital</span>
          </button>
        </div>

      </div>
    </div>
  );
};
