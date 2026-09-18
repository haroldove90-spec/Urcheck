import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  UserCheck,
  BookOpen,
  Bell,
  DollarSign,
  CalendarDays,
  ShieldCheck,
  User,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentAdminModule: AdminModule;
  currentEmployeeModule: EmployeeModule;
  onSelectAdminModule: (module: AdminModule) => void;
  onSelectEmployeeModule: (module: EmployeeModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingLeavesCount?: number;
  pendingOvertimeCount?: number;
  unreadNotificationsCount?: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentAdminModule,
  currentEmployeeModule,
  onSelectAdminModule,
  onSelectEmployeeModule,
  isCollapsed,
  onToggleCollapse,
  pendingLeavesCount = 0,
  pendingOvertimeCount = 0,
  unreadNotificationsCount = 0,
  onLogout,
}) => {
  const isAdmin = role === 'admin';

  const adminNavItems: { id: AdminModule; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'attendance', label: 'Asistencias', icon: UserCheck },
    { id: 'payroll', label: 'Pre-Nómina', icon: DollarSign },
    { id: 'shifts', label: 'Turnos y Horarios', icon: CalendarDays },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'documents', label: 'Mis Documentos', icon: FileText },
    { id: 'branches', label: 'Sucursales', icon: Building2 },
    { id: 'leaves', label: 'Permisos y Vacaciones', icon: CalendarCheck, badge: pendingLeavesCount },
    { id: 'overtime', label: 'Horas extra', icon: Clock, badge: pendingOvertimeCount },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
    { id: 'audit', label: 'Auditoría', icon: ShieldCheck },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'manual', label: 'Manual de Usuario', icon: BookOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const employeeNavItems: { id: EmployeeModule; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'punch', label: 'Marcaje Biométrico', icon: Fingerprint },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadNotificationsCount },
    { id: 'leaves', label: 'Permisos y Vacaciones', icon: CalendarCheck },
    { id: 'documents', label: 'Expediente / Docs', icon: FileText },
    { id: 'overtime', label: 'Horas extra', icon: Clock },
    { id: 'manual', label: 'Manual de Usuario', icon: BookOpen },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className={`hidden md:flex flex-col bg-white border-r border-neutral-200 transition-all duration-200 shrink-0 sticky top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse/Expand button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#093244]/60">
            Módulos del Sistema
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          type="button"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-[#093244] hover:bg-neutral-100 transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isAdmin ? (
          adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentAdminModule === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-admin-nav-${item.id}`}
                onClick={() => onSelectAdminModule(item.id)}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#093244] text-white font-semibold shadow-xs border-l-4 border-[#069AD8]'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#093244]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#069AD8]' : 'text-neutral-500'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#069AD8] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          employeeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentEmployeeModule === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-employee-nav-${item.id}`}
                onClick={() => onSelectEmployeeModule(item.id)}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#093244] text-white font-semibold shadow-xs border-l-4 border-[#069AD8]'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#093244]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#069AD8]' : 'text-neutral-500'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#1F832D] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Hardware Biometric Sync Status Widget */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1F832D]" />
                Biométrico ZKTeco
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1F832D]/10 text-[#1F832D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F832D] animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 truncate">
              Hub Cloud • 4 sedes sincronizadas
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Hardware Biométrico en línea">
            <span className="w-3 h-3 rounded-full bg-[#1F832D] ring-4 ring-[#1F832D]/20 animate-pulse" />
          </div>
        )}

        <button
          onClick={onLogout}
          type="button"
          className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-[#093244] hover:bg-[#093244]/5 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 text-[#069AD8] shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};
