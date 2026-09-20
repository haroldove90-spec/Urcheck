import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer 
      id="institutional-footer"
      className="bg-white border-t border-neutral-200 pt-6 pb-36 sm:pb-32 md:pb-6 px-4 sm:px-6 lg:px-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
        <div className="flex items-center justify-center sm:justify-start gap-2.5 text-center sm:text-left py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1F832D] animate-pulse shrink-0 ring-4 ring-emerald-100" />
          <span className="font-black text-sm text-[#093244] tracking-wide">Urcheck</span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-600 font-medium">Servidor Biométrico Cloud Activo</span>
          <span className="text-neutral-400 hidden lg:inline">• 4 terminales sincronizadas</span>
        </div>

        <p className="text-center sm:text-right font-medium text-neutral-700 leading-normal">
          Desarrollado por Harold Anguiano - App Design – Whatsapp:{' '}
          <a
            id="footer-whatsapp-link"
            href="https://wa.me/525624222449"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[#1F832D] hover:text-[#186a24] hover:underline transition-colors"
          >
            <MessageSquare className="w-4 h-4 inline text-[#1F832D]" />
            5624222449
          </a>
        </p>
      </div>
    </footer>
  );
};
