import React, { useState } from 'react';
import { UserProfile, Employee, Branch } from '../types';
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
  X
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenProfile?: () => void;
  employees?: Employee[];
  branches?: Branch[];
  onRefreshFromSupabase?: () => void;
  isRefreshing?: boolean;
  lastSyncTime?: string | null;
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
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

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
          
          {/* System Logo: Urcheck - Optimized responsive size */}
          <div className="flex items-center shrink-0 py-1">
            <img 
              id="header-urcheck-logo"
              src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png" 
              alt="Urcheck" 
              className="h-6 sm:h-8 md:h-9 w-auto max-w-[85px] xs:max-w-[110px] sm:max-w-[200px] object-contain cursor-pointer"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right Actions: Compact & ultra-responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
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

            {/* Absenteeism & Incidents Notifications Bell */}
            <div className="relative">
              <button
                id="btn-alerts-bell"
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#093244] bg-neutral-100 hover:bg-neutral-200 active:scale-95 border border-neutral-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                title="Alertas de Ausentismo y Avisos Operativos"
              >
                <Bell className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadAlertsCount}
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
                      <ShieldAlert className="w-4 h-4 text-[#069AD8]" />
                      <span className="font-bold text-xs text-[#093244]">Alertas de Ausentismo</span>
                      {unreadAlertsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                          {unreadAlertsCount} nuevas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadAlertsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-semibold text-[#069AD8] hover:underline cursor-pointer"
                        >
                          Marcar leídas
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

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {alerts.map(a => (
                      <div
                        key={a.id}
                        className={`p-2.5 rounded-xl border text-xs transition ${
                          a.unread
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-neutral-50/60 border-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-[11px]">
                            {a.severity === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                            {a.severity === 'warning' && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            {a.severity === 'info' && <CheckCircle2 className="w-3.5 h-3.5 text-[#069AD8] shrink-0" />}
                            <span>{a.title}</span>
                          </div>
                          <span className="text-[9px] text-neutral-400 font-mono shrink-0">{a.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-snug">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                </>
              )}
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
