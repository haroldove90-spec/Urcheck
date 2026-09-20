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
      {/* Collapse/Expand button & Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-200 bg-neutral-50/70">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#093244]">
              Módulos
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#069AD8]/15 text-[#069AD8]">
              {isAdmin ? '15 Activos' : '7 Activos'}
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          type="button"
          className="p-1 rounded-lg text-neutral-400 hover:text-[#093244] hover:bg-neutral-200/60 transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List with styled visible scrollbar */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 sidebar-scroll">
        {isAdmin ? (
          adminNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentAdminModule === item.id;
            
            // Subtle section dividers for admin
            const isFirstOfGroup = !isCollapsed && (index === 0 || index === 5 || index === 9);
            const groupTitle = index === 0 ? 'Operación' : index === 5 ? 'Nómina & RRHH' : 'Control & Sistema';

            return (
              <React.Fragment key={item.id}>
                {isFirstOfGroup && (
                  <div className={`px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 ${index > 0 ? 'pt-2.5 border-t border-neutral-100' : 'pt-1'}`}>
                    {groupTitle}
                  </div>
                )}
                <button
                  id={`sidebar-admin-nav-${item.id}`}
                  onClick={() => onSelectAdminModule(item.id)}
                  type="button"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 sm:py-2 rounded-lg font-medium text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#093244] text-white font-semibold shadow-xs border-l-4 border-[#069AD8]'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#093244]'
                  } ${isCollapsed ? 'justify-center px-1.5' : ''}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#069AD8]' : 'text-neutral-500'}`} />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                  )}
                  {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#069AD8] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
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
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 sm:py-2 rounded-lg font-medium text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#093244] text-white font-semibold shadow-xs border-l-4 border-[#069AD8]'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#093244]'
                } ${isCollapsed ? 'justify-center px-1.5' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#069AD8]' : 'text-neutral-500'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                )}
                {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#1F832D] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Hardware Biometric Sync Status Widget (Compact) */}
      <div className="p-2 border-t border-neutral-200 bg-neutral-50/80">
        {!isCollapsed ? (
          <div className="p-2 rounded-lg bg-white border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#1F832D]" />
                ZKTeco Biometric
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1F832D]/10 text-[#1F832D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F832D] animate-pulse" />
                ONLINE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Hardware Biométrico en línea">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F832D] ring-2 ring-[#1F832D]/20 animate-pulse" />
          </div>
        )}

        <button
          onClick={onLogout}
          type="button"
          className={`mt-1.5 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-[#093244] hover:bg-neutral-200/50 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};
