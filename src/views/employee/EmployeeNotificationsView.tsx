import React from 'react';
import { AppNotification, EmployeeModule } from '../../types';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  FileText, 
  CalendarCheck, 
  ShieldCheck, 
  Volume2, 
  Trash2, 
  ExternalLink,
  Info
} from 'lucide-react';
import { playSystemNotificationSound } from '../../utils/audioSystem';

interface EmployeeNotificationsViewProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification?: (id: string) => void;
  onNavigateModule: (module: EmployeeModule) => void;
}

export const EmployeeNotificationsView: React.FC<EmployeeNotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateModule,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTestSound = () => {
    playSystemNotificationSound();
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-[#069AD8]" />;
      case 'leave':
        return <CalendarCheck className="w-5 h-5 text-amber-600" />;
      case 'overtime':
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-[#093244]" />;
    }
  };

  return (
    <div id="employee-notifications-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#069AD8]/10 text-[#069AD8] flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              Notificaciones Institucionales
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1F832D] text-white">
                {unreadCount} sin leer
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#093244]">
            Bandeja de Avisos y Notificaciones
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Comprobantes de asistencia, dictámenes de permisos, requerimientos de firma de contratos y avisos de RRHH.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleTestSound}
            className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Reproducir timbre oficial de notificación del sistema"
          >
            <Volume2 className="w-4 h-4 text-[#069AD8]" />
            <span>Probar Sonido</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="px-3 py-2 rounded-xl bg-[#093244] hover:bg-[#069AD8] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar leídas</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const confirmClear = window.confirm('¿Deseas eliminar todas las notificaciones recibidas?');
                if (confirmClear) onClearAll();
              }}
              className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Borrar todas las notificaciones"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Borrar todas</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Total Avisos
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#093244]">{notifications.length}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">recibidos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1F832D] block leading-tight">
            Sin Leer
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#1F832D]">{unreadCount}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">pendientes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#069AD8] block leading-tight">
            Asistencia
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#069AD8]">
              {notifications.filter(n => n.type === 'attendance').length}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">marcajes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Permisos & Extra
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {notifications.filter(n => n.type === 'leave' || n.type === 'overtime').length}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">trámites</span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) onMarkAsRead(notif.id);
                if (notif.actionModule) onNavigateModule(notif.actionModule);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.read
                  ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                  : 'bg-sky-50/40 border-[#069AD8]/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  notif.read ? 'bg-neutral-100' : 'bg-white shadow-2xs border border-[#069AD8]/20'
                }`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm sm:text-base leading-tight ${notif.read ? 'font-bold text-neutral-800' : 'font-black text-[#093244]'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#069AD8] animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] font-medium text-neutral-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {notif.actionModule && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-[#093244] hover:border-[#069AD8] hover:text-[#069AD8] transition shadow-2xs">
                    <span>Ver módulo</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                {onDeleteNotification && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notif.id);
                    }}
                    className="p-2 rounded-xl border border-neutral-200 bg-white hover:border-rose-300 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition shadow-2xs cursor-pointer active:scale-95"
                    title="Eliminar esta notificación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">
              No tienes notificaciones pendientes
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Cada vez que marques asistencia, recibas un dictamen o un contrato de RRHH, aparecerá aquí con audio de alerta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
