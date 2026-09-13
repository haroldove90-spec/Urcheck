import React, { useState } from 'react';
import { AdminModule, EmployeeModule, UserRole } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
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
  UserCheck,
  BookOpen,
  DownloadCloud,
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
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setShowMoreMenu(false);
        return;
      }
    }
    setShowInstallModal(true);
  };

  // For Admin: Primary bottom bar has 4 items + "Más"
  const adminPrimaryItems: { id: AdminModule; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'attendance', label: 'Asistencias', icon: UserCheck },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'leaves', label: 'Permisos', icon: CalendarCheck, badge: pendingLeavesCount },
  ];

  const adminSecondaryItems: { id: AdminModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'overtime', label: 'Horas Extra', icon: Clock },
    { id: 'branches', label: 'Sucursales', icon: Building2 },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'manual', label: 'Manual de Uso', icon: BookOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  // For Employee: Modules including Manual
  const employeeItems: { id: EmployeeModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'punch', label: 'Marcaje', icon: Fingerprint },
    { id: 'leaves', label: 'Permisos', icon: CalendarCheck },
    { id: 'documents', label: 'Expediente', icon: FileText },
    { id: 'overtime', label: 'H. Extra', icon: Clock },
    { id: 'manual', label: 'Manual', icon: BookOpen },
  ];

  return (
    <>
      {/* "Más" Sheet Drawer for secondary admin items on mobile */}
      {showMoreMenu && isAdmin && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="bg-[#093244] text-white rounded-t-3xl p-5 border-t border-[#069AD8]/40 shadow-2xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
              <span className="text-sm font-bold text-white">Más Módulos de Administración</span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
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
                        ? 'bg-[#069AD8] text-white border-white/30 font-bold shadow-sm' 
                        : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white shrink-0" />
                    <span className="text-xs font-semibold text-white">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct PWA App Installation button in drawer */}
            {!isInstalled && (
              <div className="mt-4 pt-3 border-t border-white/15">
                <button
                  id="bottom-drawer-install-btn"
                  onClick={handleInstallClick}
                  type="button"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/15 hover:bg-[#069AD8] text-white transition-colors cursor-pointer border border-white/20"
                >
                  <div className="flex items-center gap-2.5">
                    <DownloadCloud className="w-5 h-5 text-[#069AD8] group-hover:text-white shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Instalar Urcheck como App</p>
                      <p className="text-[10px] text-white/70">Instalación nativa sin navegador</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-[#069AD8] text-white px-2 py-0.5 rounded-md">
                    Instalar
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Bar with Institutional Background and White Icons */}
      <nav 
        id="mobile-bottom-bar"
        className="fixed bottom-0 inset-x-0 bg-[#093244] border-t border-[#069AD8]/30 z-40 md:hidden shadow-2xl safe-area-pb"
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
                    className="flex flex-col items-center justify-center relative py-1 transition-all cursor-pointer group"
                  >
                    <div className="relative">
                      <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#069AD8] shadow-xs' : 'group-hover:bg-white/10'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#1F832D] text-white text-[9px] font-black flex items-center justify-center border border-[#093244]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[58px] ${
                      isActive ? 'text-white font-bold' : 'text-white/70 font-medium'
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}

              {/* More button */}
              <button
                id="bottom-nav-more"
                onClick={() => setShowMoreMenu(true)}
                type="button"
                className="flex flex-col items-center justify-center relative py-1 transition-all cursor-pointer group"
              >
                <div className={`p-1 rounded-xl transition-all ${
                  adminSecondaryItems.some(item => item.id === currentAdminModule)
                    ? 'bg-[#069AD8] shadow-xs'
                    : 'group-hover:bg-white/10'
                }`}>
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight leading-none truncate ${
                  adminSecondaryItems.some(item => item.id === currentAdminModule)
                    ? 'text-white font-bold'
                    : 'text-white/70 font-medium'
                }`}>
                  Más
                </span>
                {adminSecondaryItems.some(item => item.id === currentAdminModule) && (
                  <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-white" />
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
                    className="flex flex-col items-center justify-center relative py-1 transition-all cursor-pointer group"
                  >
                    <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#069AD8] shadow-xs' : 'group-hover:bg-white/10'}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[68px] ${
                      isActive ? 'text-white font-bold' : 'text-white/70 font-medium'
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* PWA Install Modal from mobile bottom bar */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};
