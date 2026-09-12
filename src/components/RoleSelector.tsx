import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Building2, FileSpreadsheet } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const ROLES: { id: UserRole; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: 'admin',
    name: 'Administrador / RRHH',
    icon: ShieldCheck,
  },
  {
    id: 'employee',
    name: 'Empleado / Colaborador',
    icon: UserCheck,
  },
  {
    id: 'supervisor',
    name: 'Supervisor de Sucursal',
    icon: Building2,
  },
  {
    id: 'auditor',
    name: 'Auditor / Nómina',
    icon: FileSpreadsheet,
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div id="role-selector-container" className="min-h-screen flex flex-col justify-between bg-[#f8f9fa] p-4 sm:p-8 lg:p-12">
      {/* Spacer to center cleanly vertically */}
      <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto">
        {/* Strictly: Sin header, sin descripciones, solo nombre del rol en cuadrícula 2 cols móvil / 4 cols escritorio */}
        <div 
          id="role-cards-grid"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full"
        >
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => onSelectRole(role.id)}
                type="button"
                className="group relative flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 bg-white rounded-2xl border-2 border-neutral-200 hover:border-red-600 shadow-sm hover:shadow-xl transition-all duration-200 text-center cursor-pointer active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                {/* Subtle visual accent */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-100 group-hover:bg-red-50 text-neutral-800 group-hover:text-red-600 flex items-center justify-center mb-4 sm:mb-6 transition-colors">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" />
                </div>
                
                {/* Solo nombre del rol */}
                <span className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 group-hover:text-red-600 transition-colors leading-snug">
                  {role.name}
                </span>

                {/* Micro indicator */}
                <div className="mt-4 w-6 h-1 rounded-full bg-neutral-200 group-hover:bg-red-600 transition-colors" />
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
            className="text-red-600 font-bold hover:underline inline-flex items-center gap-1"
          >
            5624222449
          </a>
        </p>
      </div>
    </div>
  );
};
