import React, { useState } from 'react';
import { AdminModule, EmployeeModule, UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  FileBarChart,
  UserCog,
  Settings,
  Fingerprint,
  FileText,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface BottomBarProps {
  role: UserRole;
  currentAdminModule: AdminModule;
  currentEmployeeModule: EmployeeModule;
  onSelectAdminModule: (module: AdminModule) => void;
  onSelectEmployeeModule: (module: EmployeeModule) => void;
  pendingLeavesCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  role,
  currentAdminModule,
  currentEmployeeModule,
  onSelectAdminModule,
  onSelectEmployeeModule,
  pendingLeavesCount = 0,
}) => {
  const isAdmin = role === 'admin';
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // For Admin: Primary bottom bar has 4 items + "Más"
  const adminPrimaryItems: { id: AdminModule; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'leaves', label: 'Permisos', icon: CalendarCheck, badge: pendingLeavesCount },
    { id: 'overtime', label: 'H. Extra', icon: Clock },
  ];

  const adminSecondaryItems: { id: AdminModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'branches', label: 'Sucursales', icon: Building2 },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  // For Employee: Exactly 4 modules!
  const employeeItems: { id: EmployeeModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'punch', label: 'Marcaje', icon: Fingerprint },
    { id: 'leaves', label: 'Permisos', icon: CalendarCheck },
    { id: 'documents', label: 'Expediente', icon: FileText },
    { id: 'overtime', label: 'H. Extra', icon: Clock },
  ];

  return (
    <>
      {/* "Más" Sheet Drawer for secondary admin items on mobile */}
      {showMoreMenu && isAdmin && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="bg-white rounded-t-2xl p-5 border-t border-neutral-200 shadow-2xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <span className="text-sm font-bold text-[#0A3142]">Más Módulos de Administración</span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {adminSecondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentAdminModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectAdminModule(item.id);
                      setShowMoreMenu(false);
                    }}
                    type="button"
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isActive 
                        ? 'bg-[#0A3142] text-white border-[#0871A0] font-bold' 
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0871A0]' : 'text-neutral-500'}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Bar */}
      <nav 
        id="mobile-bottom-bar"
        className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-40 md:hidden shadow-lg safe-area-pb"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {isAdmin ? (
            <>
              {adminPrimaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentAdminModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`bottom-nav-${item.id}`}
                    onClick={() => onSelectAdminModule(item.id)}
                    type="button"
                    className={`flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer ${
                      isActive ? 'text-[#0871A0] font-bold' : 'text-neutral-600 hover:text-[#0A3142]'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#0871A0] text-white text-[9px] font-black flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[58px]">
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#0871A0]" />
                    )}
                  </button>
                );
              })}

              {/* More button */}
              <button
                id="bottom-nav-more"
                onClick={() => setShowMoreMenu(true)}
                type="button"
                className={`flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer ${
                  adminSecondaryItems.some(item => item.id === currentAdminModule)
                    ? 'text-[#0871A0] font-bold'
                    : 'text-neutral-600 hover:text-[#0A3142]'
                }`}
              >
                <MoreHorizontal className="w-5 h-5" />
                <span className="text-[10px] mt-1 tracking-tight leading-none truncate">
                  Más
                </span>
                {adminSecondaryItems.some(item => item.id === currentAdminModule) && (
                  <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#0871A0]" />
                )}
              </button>
            </>
          ) : (
            // Employee view has exactly 4 items
            <div className="col-span-5 grid grid-cols-4 h-full">
              {employeeItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentEmployeeModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`bottom-nav-emp-${item.id}`}
                    onClick={() => onSelectEmployeeModule(item.id)}
                    type="button"
                    className={`flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer ${
                      isActive ? 'text-[#0871A0] font-bold' : 'text-neutral-600 hover:text-[#0A3142]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[68px]">
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#0871A0]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
