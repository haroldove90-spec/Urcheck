import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface FeedbackData {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  details?: string;
  actionText?: string;
  onAction?: () => void;
  autoCloseMs?: number;
}

interface CenteredFeedbackModalProps {
  feedback: FeedbackData | null;
  onClose: () => void;
}

export const CenteredFeedbackModal: React.FC<CenteredFeedbackModalProps> = ({
  feedback,
  onClose,
}) => {
  useEffect(() => {
    if (!feedback) return;
    const timeout = feedback.autoCloseMs ?? 3500;
    if (timeout > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [feedback, onClose]);

  if (!feedback) return null;

  const type = feedback.type || 'success';

  const iconMap = {
    success: <CheckCircle2 className="w-9 h-9 text-[#1F832D] animate-in zoom-in-75 duration-300" />,
    error: <AlertCircle className="w-9 h-9 text-rose-600 animate-in zoom-in-75 duration-300" />,
    warning: <AlertCircle className="w-9 h-9 text-amber-500 animate-in zoom-in-75 duration-300" />,
    info: <Info className="w-9 h-9 text-[#069AD8] animate-in zoom-in-75 duration-300" />,
  };

  const bgRingMap = {
    success: 'bg-[#1F832D]/10 border-[#1F832D]/25 ring-8 ring-[#1F832D]/5',
    error: 'bg-rose-50 border-rose-200 ring-8 ring-rose-50',
    warning: 'bg-amber-50 border-amber-200 ring-8 ring-amber-50',
    info: 'bg-sky-50 border-sky-200 ring-8 ring-sky-50',
  };

  const buttonColorMap = {
    success: 'bg-[#1F832D] hover:bg-[#186a24] text-white',
    error: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-[#069AD8] hover:bg-[#0580b3] text-white',
  };

  return (
    <div 
      id="centered-feedback-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="centered-feedback-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200 text-center transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Animated Icon */}
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border transition-all ${bgRingMap[type]}`}>
          {iconMap[type]}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-1.5">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#093244] leading-snug">
            {feedback.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
            {feedback.message}
          </p>
          {feedback.details && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] sm:text-xs text-neutral-500 font-mono break-all text-left">
              {feedback.details}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {feedback.onAction && feedback.actionText && (
            <button
              type="button"
              onClick={() => {
                feedback.onAction?.();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              {feedback.actionText}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`w-full px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer ${buttonColorMap[type]}`}
          >
            Aceptar / Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
