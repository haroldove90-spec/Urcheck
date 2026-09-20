import React, { useState } from 'react';
import { UserProfile, Employee, Branch, AdminModule, EmployeeModule, SystemMode, AppNotification } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { SupabaseConnectionModal } from './SupabaseConnectionModal';
import { 
  LogOut, 
  DownloadCloud, 
  CheckCircle2, 
  Database,
  RefreshCw,
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X,
  LayoutGrid,
  Search,
  LayoutDashboard,
  UserCheck,
  DollarSign,
  CalendarDays,
  Users,
  FileText,
  Building2,
  CalendarCheck,
  FileBarChart,
  ShieldCheck,
  UserCog,
  User,
  BookOpen,
  Settings,
  Fingerprint,
  ChevronDown,
  Sliders,
  Trash2,
} from 'lucide-react';
import { isModuleAllowedInMode } from '../utils/systemModes';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenProfile?: () => void;
  employees?: Employee[];
  branches?: Branch[];
  onRefreshFromSupabase?: () => void;
  isRefreshing?: boolean;
  lastSyncTime?: string | null;
  onSelectAdminModule?: (module: AdminModule) => void;
  onSelectEmployeeModule?: (module: EmployeeModule) => void;
  currentAdminModule?: AdminModule;
  currentEmployeeModule?: EmployeeModule;
  pendingLeavesCount?: number;
  pendingOvertimeCount?: number;
  systemMode?: SystemMode;
  onOpenModeSelector?: () => void;
  notifications?: AppNotification[];
  unreadNotificationsCount?: number;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout,
  onOpenProfile,
  employees = [],
  branches = [],
  onRefreshFromSupabase,
  isRefreshing = false,
  lastSyncTime,
  onSelectAdminModule,
  onSelectEmployeeModule,
  currentAdminModule,
  currentEmployeeModule,
  pendingLeavesCount = 0,
  pendingOvertimeCount = 0,
  systemMode = 'basic',
  onOpenModeSelector,
  notifications,
  unreadNotificationsCount,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onClearAllNotifications,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);
  const [showModulesMenu, setShowModulesMenu] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // 15 Admin Modules Definition
  const adminModulesList: {
    id: AdminModule;
    label: string;
    group: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Inicio / Monitoreo', group: 'Operación', description: 'Métricas en tiempo real y terminales', icon: LayoutDashboard },
    { id: 'attendance', label: 'Asistencias en Vivo', group: 'Operación', description: 'Registro con foto, retardos y bitácora', icon: UserCheck },
    { id: 'shifts', label: 'Turnos y Horarios', group: 'Operación', description: 'Jornadas matutinas, vespertinas y nocturnas', icon: CalendarDays },
    { id: 'employees', label: 'Empleados', group: 'Operación', description: 'Padrón activo, datos laborales y contratos', icon: Users },
    { id: 'branches', label: 'Sucursales y Sedes', group: 'Operación', description: 'Sedes y hardware ZKTeco biométrico', icon: Building2 },
    { id: 'payroll', label: 'Pre-Nómina', group: 'Nómina & RRHH', description: 'Cálculo de horas, retardos y deducciones', icon: DollarSign },
    { id: 'leaves', label: 'Permisos y Vacaciones', group: 'Nómina & RRHH', description: 'Aprobación de ausencias y justificantes', icon: CalendarCheck, badge: pendingLeavesCount },
    { id: 'overtime', label: 'Horas Extra', group: 'Nómina & RRHH', description: 'LFT Art. 66-68 autorización de extras', icon: Clock, badge: pendingOvertimeCount },
    { id: 'documents', label: 'Expedientes / Docs', group: 'Nómina & RRHH', description: 'Contratos, identificaciones y credenciales', icon: FileText },
    { id: 'reports', label: 'Reportes Laborales', group: 'Control & Auditoría', description: 'Exportaciones en Excel/PDF y kardex', icon: FileBarChart },
    { id: 'audit', label: 'Auditoría Forense', group: 'Control & Auditoría', description: 'Bitácora inmutable SHA-256', icon: ShieldCheck },
    { id: 'users', label: 'Usuarios y Accesos', group: 'Control & Auditoría', description: 'Gestión de cuentas y envío WhatsApp', icon: UserCog },
    { id: 'profile', label: 'Mi Perfil', group: 'Sistema & Cuenta', description: 'Foto de perfil, datos y firma digital', icon: User },
    { id: 'manual', label: 'Manual de Usuario', group: 'Sistema & Cuenta', description: 'Guía oficial de uso del sistema', icon: BookOpen },
    { id: 'settings', label: 'Configuración General', group: 'Sistema & Cuenta', description: 'Políticas de tolerancia y geofencing', icon: Settings },
  ];

  // 7 Employee Modules Definition
  const employeeModulesList: {
    id: EmployeeModule;
    label: string;
    group: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'punch', label: 'Marcaje Biométrico', group: 'Mi Asistencia', description: 'Checar entrada/salida con foto y GPS', icon: Fingerprint },
    { id: 'profile', label: 'Mi Perfil', group: 'Mi Cuenta', description: 'Mis datos personales, foto y firma', icon: User },
    { id: 'notifications', label: 'Notificaciones', group: 'Mi Cuenta', description: 'Avisos y comunicados de la empresa', icon: Bell },
    { id: 'leaves', label: 'Mis Permisos', group: 'Mi Asistencia', description: 'Solicitudes de vacaciones y permisos', icon: CalendarCheck },
    { id: 'documents', label: 'Mi Expediente', group: 'Mi Asistencia', description: 'Contratos, credencial y recibos', icon: FileText },
    { id: 'overtime', label: 'Mis Horas Extra', group: 'Mi Asistencia', description: 'Registro y validación de horas extra', icon: Clock },
    { id: 'manual', label: 'Manual de Usuario', group: 'Ayuda', description: 'Instrucciones paso a paso', icon: BookOpen },
  ];

  // Absenteeism & Operational Alerts
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 'al-1',
      title: 'Ausentismo Crítico Detectado',
      message: 'Carlos Ramírez Morales ha acumulado 2 faltas consecutivas no justifcadas en Sede Central.',
      severity: 'critical' as const,
      timestamp: 'Hoy 09:30 AM',
      unread: true,
    },
    {
      id: 'al-2',
      title: 'Reiteración de Retardos',
      message: 'Ana Luisa Gómez registra 3 retardos en la presente catorcena. Se recomienda apercibimiento.',
      severity: 'warning' as const,
      timestamp: 'Hoy 08:45 AM',
      unread: true,
    },
    {
      id: 'al-3',
      title: 'Justificante Médico Recibido',
      message: 'Roberto Méndez adjuntó certificado de incapacidad IMSS (Folio ST-4921).',
      severity: 'info' as const,
      timestamp: 'Ayer 17:10 PM',
      unread: false,
    },
  ]);

  const unreadAlertsCount = alerts.filter(a => a.unread).length;

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallSuccessMessage('¡Urcheck instalado con éxito como App!');
        setTimeout(() => setInstallSuccessMessage(null), 4000);
        return;
      }
    }
    setShowInstallModal(true);
  };

  return (
    <header 
      id="main-institutional-header"
      className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-13 sm:h-16 md:h-18 gap-1.5 sm:gap-3 w-full">
          
          {/* System Logo & Quick Modules Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 py-1">
            <img 
              id="header-urcheck-logo"
              src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png" 
              alt="Urcheck" 
              className="h-6 sm:h-8 md:h-9 w-auto max-w-[85px] xs:max-w-[110px] sm:max-w-[200px] object-contain cursor-pointer"
              referrerPolicy="no-referrer"
            />

            {/* Quick Modules Menu Trigger (Visible on all screen sizes) */}
            <div className="relative">
              <button
                id="btn-header-modules-menu"
                type="button"
                onClick={() => setShowModulesMenu(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#093244] bg-[#093244]/5 hover:bg-[#069AD8]/10 hover:text-[#069AD8] rounded-xl border border-neutral-200 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Explorar todos los módulos del sistema"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#069AD8]" />
                <span className="hidden sm:inline">Módulos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#093244] text-white">
                  {isAdmin ? '15' : '7'}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:inline" />
              </button>

              {/* Modules Mega-Menu Dropdown / Modal */}
              {showModulesMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                    onClick={() => setShowModulesMenu(false)}
                  />
                  <div className="fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-[460px] md:w-[560px] max-h-[80vh] overflow-hidden bg-white rounded-2xl border border-neutral-200 shadow-2xl z-50 flex flex-col animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="p-3.5 border-b border-neutral-100 bg-[#093244] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-[#069AD8]" />
                        <span className="font-bold text-xs sm:text-sm">
                          {isAdmin ? 'Módulos del Sistema Urcheck (15 Módulos)' : 'Mis Módulos (7 Módulos)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowModulesMenu(false)}
                        className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/50">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar módulo por nombre o función..."
                          value={moduleSearch}
                          onChange={(e) => setModuleSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#069AD8] text-neutral-800"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="p-3 overflow-y-auto max-h-[55vh] space-y-3 sidebar-scroll">
                      {isAdmin ? (
                        ['Operación', 'Nómina & RRHH', 'Control & Auditoría', 'Sistema & Cuenta'].map(groupName => {
                          const groupModules = adminModulesList
                            .filter(m => isModuleAllowedInMode('admin', m.id, systemMode))
                            .filter(
                              m => m.group === groupName && (
                                m.label.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                                m.description.toLowerCase().includes(moduleSearch.toLowerCase())
                              )
                            );
                          if (groupModules.length === 0) return null;

                          return (
                            <div key={groupName} className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
                                {groupName}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {groupModules.map(item => {
                                  const Icon = item.icon;
                                  const isActive = currentAdminModule === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        if (onSelectAdminModule) onSelectAdminModule(item.id);
                                        setShowModulesMenu(false);
                                      }}
                                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                        isActive
                                          ? 'bg-[#093244] text-white border-[#069AD8] shadow-sm'
                                          : 'bg-neutral-50/70 hover:bg-neutral-100/90 border-neutral-200 text-neutral-800'
                                      }`}
                                    >
                                      <div className={`p-1.5 rounded-lg shrink-0 ${
                                        isActive ? 'bg-[#069AD8] text-white' : 'bg-white text-[#093244] border border-neutral-200'
                                      }`}>
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-bold text-xs truncate">{item.label}</span>
                                          {Boolean(item.badge && item.badge > 0) && (
                                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shrink-0">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className={`text-[10px] line-clamp-1 leading-snug mt-0.5 ${
                                          isActive ? 'text-white/80' : 'text-neutral-500'
                                        }`}>
                                          {item.description}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {employeeModulesList
                            .filter(m => isModuleAllowedInMode('employee', m.id, systemMode))
                            .filter(m => 
                              m.label.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                              m.description.toLowerCase().includes(moduleSearch.toLowerCase())
                            )
                            .map(item => {
                              const Icon = item.icon;
                              const isActive = currentEmployeeModule === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    if (onSelectEmployeeModule) onSelectEmployeeModule(item.id);
                                    setShowModulesMenu(false);
                                  }}
                                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-[#093244] text-white border-[#069AD8] shadow-sm'
                                      : 'bg-neutral-50/70 hover:bg-neutral-100/90 border-neutral-200 text-neutral-800'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 ${
                                    isActive ? 'bg-[#069AD8] text-white' : 'bg-white text-[#093244] border border-neutral-200'
                                  }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-xs truncate block">{item.label}</span>
                                    <p className={`text-[10px] line-clamp-1 leading-snug mt-0.5 ${
                                      isActive ? 'text-white/80' : 'text-neutral-500'
                                    }`}>
                                      {item.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Actions: Compact & ultra-responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Smart System Complexity Mode Button (Admin Only) */}
            {isAdmin && onOpenModeSelector && (
              <button
                id="btn-header-smart-mode"
                type="button"
                onClick={onOpenModeSelector}
                className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                  systemMode === 'basic' 
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : systemMode === 'intermediate' 
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                }`}
                title={`Versión activa: ${systemMode === 'basic' ? 'Básica' : systemMode === 'intermediate' ? 'Intermedia' : 'Full'}. Clic para cambiar la versión del sistema.`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  systemMode === 'basic' ? 'bg-emerald-500' : systemMode === 'intermediate' ? 'bg-amber-500' : 'bg-blue-600'
                }`} />
                <span className="text-[11px] sm:text-xs">
                  {systemMode === 'basic' ? 'Básica' : systemMode === 'intermediate' ? 'Intermedia' : 'Full'}
                </span>
                <Sliders className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
              </button>
            )}
            
            {/* Active Role Identification Badge / User Profile Trigger */}
            <button 
              id="active-role-badge"
              type="button"
              onClick={onOpenProfile}
              title={`Mi Perfil: ${currentUser.name} (${currentUser.roleName}) - Clic para ver y editar`}
              className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#093244]/5 hover:bg-[#093244]/10 active:scale-95 border border-[#069AD8]/20 shrink-0 cursor-pointer transition-all"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#069AD8] shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1F832D] border-2 border-white" />
              </div>
              <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[110px] md:max-w-[160px]">
                <span className="text-xs sm:text-sm font-bold text-[#093244] leading-tight truncate">
                  {currentUser.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#069AD8] leading-none truncate">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
            </button>

            {/* Realtime Notifications Bell */}
            <div className="relative">
              {(() => {
                const effectiveNotifications: AppNotification[] = notifications !== undefined
                  ? notifications
                  : alerts.map(a => ({
                      id: a.id,
                      targetEmployeeId: 'all',
                      title: a.title,
                      message: a.message,
                      type: (a.severity === 'critical' || a.severity === 'warning' ? 'attendance' : 'system') as any,
                      timestamp: a.timestamp,
                      read: !a.unread,
                      actionModule: 'punch' as const,
                    }));

                const effectiveUnreadCount = typeof unreadNotificationsCount === 'number'
                  ? unreadNotificationsCount
                  : effectiveNotifications.filter(n => !n.read).length;

                return (
                  <>
                    <button
                      id="btn-alerts-bell"
                      type="button"
                      onClick={() => setShowNotifications(prev => !prev)}
                      className="relative inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#093244] bg-neutral-100 hover:bg-neutral-200 active:scale-95 border border-neutral-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                      title="Avisos y Notificaciones del Sistema"
                    >
                      <Bell className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />
                      {effectiveUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                          {effectiveUnreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown panel - Perfectly centered on mobile and docked on desktop */}
                    {showNotifications && (
                      <>
                        {/* Backdrop on mobile for closing */}
                        <div
                          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs sm:hidden"
                          onClick={() => setShowNotifications(false)}
                        />
                        <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white rounded-2xl border border-neutral-200 shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                            <div className="flex items-center gap-1.5">
                              <Bell className="w-4 h-4 text-[#069AD8]" />
                              <span className="font-bold text-xs text-[#093244]">Avisos y Notificaciones</span>
                              {effectiveUnreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                                  {effectiveUnreadCount} nuevas
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {effectiveUnreadCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onMarkAllNotificationsAsRead) onMarkAllNotificationsAsRead();
                                    else handleMarkAllRead();
                                  }}
                                  className="text-[10px] font-semibold text-[#069AD8] hover:underline cursor-pointer"
                                >
                                  Marcar leídas
                                </button>
                              )}
                              {effectiveNotifications.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const confirmClear = window.confirm('¿Deseas eliminar todas las notificaciones?');
                                    if (confirmClear) {
                                      if (onClearAllNotifications) onClearAllNotifications();
                                      else setAlerts([]);
                                    }
                                  }}
                                  className="text-[10px] font-semibold text-neutral-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
                                  title="Borrar todas las notificaciones"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="hidden xs:inline">Borrar</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowNotifications(false)}
                                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {effectiveNotifications.length > 0 ? (
                              effectiveNotifications.map(n => (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    if (!n.read && onMarkNotificationAsRead) {
                                      onMarkNotificationAsRead(n.id);
                                    }
                                    if (n.actionModule) {
                                      if (isAdmin && onSelectAdminModule) {
                                        if (n.actionModule === 'punch') onSelectAdminModule('attendance');
                                        else if (n.actionModule === 'leaves') onSelectAdminModule('leaves');
                                        else if (n.actionModule === 'overtime') onSelectAdminModule('overtime');
                                        else if (n.actionModule === 'documents') onSelectAdminModule('documents');
                                        else if (n.actionModule === 'profile') onSelectAdminModule('profile');
                                      } else if (!isAdmin && onSelectEmployeeModule) {
                                        onSelectEmployeeModule(n.actionModule);
                                      }
                                      setShowNotifications(false);
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start justify-between gap-2 group ${
                                    !n.read
                                      ? 'bg-sky-50/50 border-[#069AD8]/30 shadow-2xs'
                                      : 'bg-neutral-50/60 border-neutral-200/80 hover:bg-neutral-100/80'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-[11px]">
                                      {n.type === 'attendance' && <Fingerprint className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />}
                                      {n.type === 'document' && <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                      {n.type === 'leave' && <CalendarCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                      {n.type === 'overtime' && <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                                      {n.type === 'system' && <ShieldCheck className="w-3.5 h-3.5 text-[#1F832D] shrink-0" />}
                                      <span className="truncate">{n.title}</span>
                                      {!n.read && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#069AD8] shrink-0 animate-pulse" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-neutral-600 mt-1 leading-snug break-words">
                                      {n.message}
                                    </p>
                                    <div className="flex items-center justify-between gap-2 mt-1.5">
                                      <span className="text-[9px] text-neutral-400 font-mono">
                                        {n.timestamp}
                                      </span>
                                      {n.actionModule && (
                                        <span className="text-[9px] font-bold text-[#069AD8] group-hover:underline">
                                          Ver detalle →
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Individual Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteNotification) {
                                        onDeleteNotification(n.id);
                                      } else {
                                        setAlerts(prev => prev.filter(x => x.id !== n.id));
                                      }
                                    }}
                                    className="p-1 rounded-lg text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                                    title="Eliminar notificación"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center text-neutral-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                                <p className="text-xs font-semibold text-neutral-600">No hay notificaciones</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Las alertas y avisos del sistema se mostrarán aquí.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Supabase Realtime Database Test Button - hidden on mobile, visible from sm */}
            <button
              id="btn-test-supabase-header"
              onClick={() => setShowSupabaseModal(true)}
              type="button"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-[#093244] bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 border border-emerald-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
              title="Probar conexión en vivo con Supabase Database"
            >
              <div className="relative flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="hidden md:inline text-neutral-700">Supabase</span>
              <span className="hidden sm:inline-block px-1 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                Test
              </span>
            </button>

            {/* Quick Manual Sync Button - hidden on mobile, visible from sm */}
            {onRefreshFromSupabase && (
              <button
                id="btn-sync-supabase-header"
                onClick={onRefreshFromSupabase}
                type="button"
                disabled={isRefreshing}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#093244] bg-sky-50 hover:bg-sky-100 active:scale-95 border border-sky-200 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-60"
                title={lastSyncTime ? `Última sincronización con Supabase: ${lastSyncTime}. Clic para refrescar datos ahora.` : 'Sincronizar datos con Supabase'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#069AD8] shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline text-neutral-700 font-medium">Sincronizar</span>
              </button>
            )}

            {/* Quick App Install Button - hidden on mobile, visible from sm (available in bottom bar on mobile) */}
            {!isInstalled && (
              <button
                id="btn-pwa-install"
                onClick={handleInstallClick}
                type="button"
                className="hidden sm:inline-flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-white bg-[#093244] hover:bg-[#069AD8] active:scale-95 transition-all rounded-xl shadow-xs cursor-pointer shrink-0 border border-[#069AD8]/40"
                title="Instalar Urcheck directamente en tu dispositivo como App móvil"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-[#069AD8] group-hover:text-white shrink-0 animate-pulse" />
                <span className="hidden sm:inline text-xs">Instalar</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-neutral-700 hover:text-[#093244] bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión o cambiar de rol"
            >
              <LogOut className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {installSuccessMessage && (
        <div className="bg-[#1F832D] text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {installSuccessMessage}
        </div>
      )}

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onSuccess={() => {
          setInstallSuccessMessage('¡Urcheck instalado con éxito como App!');
          setTimeout(() => setInstallSuccessMessage(null), 4000);
        }}
      />

      {/* Supabase Connection Test & Health Modal */}
      <SupabaseConnectionModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        employees={employees}
        branches={branches}
      />
    </header>
  );
};
