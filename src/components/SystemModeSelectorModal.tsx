import React from 'react';
import { SystemMode } from '../types';
import { SYSTEM_MODES } from '../utils/systemModes';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';

interface SystemModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: SystemMode;
  onSelectMode: (mode: SystemMode) => void;
}

export const SystemModeSelectorModal: React.FC<SystemModeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const modes: SystemMode[] = ['basic', 'intermediate', 'full'];

  return (
    <div 
      id="system-mode-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="system-mode-modal-content"
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#093244] via-[#0b3c53] to-[#0871A0] text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-1.5 rounded-lg bg-[#069AD8]/30 text-[#069AD8] inline-flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#069AD8] bg-white/10 px-2.5 py-0.5 rounded-full">
              Control de Complejidad
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selector Inteligente de Versión Urcheck
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 mt-1 max-w-xl">
            Adapta la interfaz desactivando módulos no esenciales para que el uso sea ágil, intuitivo y sin saturación para tu equipo.
          </p>
        </div>

        {/* Informative banner */}
        <div className="bg-sky-50 border-b border-sky-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 text-xs text-[#093244]">
          <Info className="w-4 h-4 text-[#069AD8] shrink-0" />
          <span>
            <strong>Sin pérdida de datos:</strong> Al cambiar a una versión más sencilla, los registros existentes se conservan intactos; solo se ocultan los módulos de navegación.
          </span>
        </div>

        {/* Modes List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {modes.map((modeKey) => {
            const mode = SYSTEM_MODES[modeKey];
            const isSelected = currentMode === modeKey;

            return (
              <div
                key={modeKey}
                id={`card-mode-${modeKey}`}
                className={`relative rounded-2xl border-2 p-4 sm:p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#069AD8] bg-sky-50/40 shadow-md ring-2 ring-[#069AD8]/20'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
                }`}
                onClick={() => {
                  onSelectMode(modeKey);
                  onClose();
                }}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#093244] text-white text-[11px] font-bold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Versión Activa</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pr-24 sm:pr-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      modeKey === 'basic' ? 'bg-emerald-500' : modeKey === 'intermediate' ? 'bg-amber-500' : 'bg-blue-600'
                    }`} />
                    <h3 className="text-base sm:text-lg font-extrabold text-[#093244]">
                      {mode.name}
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${mode.badgeBg} ${mode.badgeColor} ${mode.badgeBorder}`}>
                      {mode.tagline}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                  {mode.description}
                </p>

                {/* Features checklist */}
                <div className="bg-white rounded-xl p-3 border border-neutral-200/80 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Módulos y funciones visibles:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-700">
                    {mode.includedFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {modeKey === 'basic' && '• 4 Módulos esenciales activos'}
                    {modeKey === 'intermediate' && '• 8 Módulos de gestión activos'}
                    {modeKey === 'full' && '• 15 Módulos completos activos'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMode(modeKey);
                      onClose();
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        : 'bg-[#093244] text-white hover:bg-[#069AD8] shadow-xs'
                    }`}
                  >
                    <span>{isSelected ? 'Mantener Activa' : `Activar ${mode.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-3 sm:p-4 flex items-center justify-between text-xs text-neutral-600">
          <span>
            El <strong>Manual de Usuario</strong> se adaptará automáticamente a la versión elegida.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-xl font-bold text-neutral-700 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
