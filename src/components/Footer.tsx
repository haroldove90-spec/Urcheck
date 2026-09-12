import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer 
      id="institutional-footer"
      className="bg-white border-t border-neutral-200 py-4 px-4 sm:px-6 lg:px-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-neutral-800">Control se asistencia PRO</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-500 hidden sm:inline">Servidor Biométrico Cloud v4.2 Activo</span>
        </div>

        <p className="text-center sm:text-right font-medium">
          Desarrollado por Harold Anguiano - App Design – Whatsapp:{' '}
          <a
            id="footer-whatsapp-link"
            href="https://wa.me/525624222449"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 inline text-emerald-600" />
            5624222449
          </a>
        </p>
      </div>
    </footer>
  );
};
