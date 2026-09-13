import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const ROLES: { id: UserRole; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'admin',
    name: 'Administrador',
    icon: ShieldCheck,
  },
  {
    id: 'employee',
    name: 'Empleado',
    icon: UserCheck,
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div id="role-selector-container" className="min-h-screen flex flex-col justify-between bg-[#f8f9fa] p-4 sm:p-8 lg:p-12">
      {/* Centered Content with Real-size Brand Logo Above Role Cards */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl w-full mx-auto py-4 sm:py-6">
        
        {/* Official Brand Logo - Well proportioned and clear */}
        <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
          <img
            id="home-urcheck-logo"
            src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png"
            alt="Urcheck Logo"
            className="h-16 sm:h-20 md:h-22 w-auto max-w-[240px] sm:max-w-[300px] object-contain transition-transform hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          <p className="mt-2.5 text-xs sm:text-sm font-medium tracking-wide text-[#093244]/75 text-center max-w-sm sm:max-w-md">
            Plataforma Integral de Control Biométrico y Gestión Laboral
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F832D] animate-pulse" />
            <span className="text-[11px] font-bold text-[#1F832D] uppercase tracking-wider">
               Sistema Cloud En Línea
            </span>
          </div>
        </div>

        {/* Roles Access Grid - 2 columns on mobile and larger devices */}
        <div 
          id="role-cards-grid"
          className="grid grid-cols-2 gap-3.5 sm:gap-6 md:gap-8 w-full max-w-3xl"
        >
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => onSelectRole(role.id)}
                type="button"
                className="group relative flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-10 bg-white rounded-2xl border-2 border-neutral-200 hover:border-[#069AD8] shadow-sm hover:shadow-xl transition-all duration-200 text-center cursor-pointer active:scale-98 focus:outline-none focus:ring-4 focus:ring-[#069AD8]/20"
              >
                {/* Icon Container with brand color transitions */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#093244]/5 group-hover:bg-[#093244] text-[#093244] group-hover:text-white flex items-center justify-center mb-2.5 sm:mb-5 transition-all duration-200 shadow-xs">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110" />
                </div>
                
                {/* Role Title */}
                <span className="text-sm sm:text-lg md:text-2xl font-bold text-[#093244] group-hover:text-[#069AD8] transition-colors leading-snug truncate max-w-full">
                  {role.name}
                </span>

                {/* Accent indicator line */}
                <div className="mt-2.5 sm:mt-5 w-8 sm:w-12 h-1 sm:h-1.5 rounded-full bg-neutral-200 group-hover:bg-[#069AD8] transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="pt-8 text-center border-t border-neutral-200 mt-6">
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">
          Desarrollado por Harold Anguiano - App Design – Whatsapp:{' '}
          <a
            id="whatsapp-link-role-screen"
            href="https://wa.me/525624222449"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F832D] font-bold hover:underline inline-flex items-center gap-1"
          >
            5624222449
          </a>
        </p>
      </div>
    </div>
  );
};
