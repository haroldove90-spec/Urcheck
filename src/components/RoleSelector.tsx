import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const ROLES: { id: UserRole; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'admin',
    name: 'Administrador / Recursos Humanos',
    icon: ShieldCheck,
  },
  {
    id: 'employee',
    name: 'Empleado / Colaborador',
    icon: UserCheck,
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div id="role-selector-container" className="min-h-screen flex flex-col justify-between bg-[#f8f9fa] p-4 sm:p-8 lg:p-12">
      {/* Centered Role Cards */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto">
        <div 
          id="role-cards-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full"
        >
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => onSelectRole(role.id)}
                type="button"
                className="group relative flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border-2 border-neutral-200 hover:border-[#0871A0] shadow-sm hover:shadow-xl transition-all duration-200 text-center cursor-pointer active:scale-98 focus:outline-none focus:ring-4 focus:ring-[#0871A0]/20"
              >
                {/* Icon Container with subtle brand color transitions */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0A3142]/5 group-hover:bg-[#0A3142] text-[#0A3142] group-hover:text-white flex items-center justify-center mb-6 transition-all duration-200 shadow-xs">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110" />
                </div>
                
                {/* Role Title */}
                <span className="text-lg sm:text-2xl font-bold text-[#0A3142] group-hover:text-[#0871A0] transition-colors leading-snug">
                  {role.name}
                </span>

                {/* Accent indicator line */}
                <div className="mt-5 w-10 h-1.5 rounded-full bg-neutral-200 group-hover:bg-[#0871A0] transition-colors" />
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
            className="text-[#138128] font-bold hover:underline inline-flex items-center gap-1"
          >
            5624222449
          </a>
        </p>
      </div>
    </div>
  );
};
