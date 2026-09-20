import { AppNotification, NotificationType, EmployeeModule } from '../types';
import { supabase } from '../lib/supabase';
import { playSystemNotificationSound } from '../utils/audioSystem';

export { playSystemNotificationSound } from '../utils/audioSystem';

const STORAGE_KEY = 'urcheck_notifications_v3';

export const INITIAL_SYSTEM_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    targetEmployeeId: 'all',
    title: '¡Terminal Biométrico Urcheck Conectado!',
    message: 'Reconocimiento facial y lector de huellas digitales sincronizados en la nube con respaldo seguro.',
    type: 'system',
    timestamp: 'Hoy, 08:00 AM',
    read: false,
    actionModule: 'punch',
  },
  {
    id: 'notif-doc-policy',
    targetEmployeeId: 'all',
    title: 'Políticas Laborales y Contratos',
    message: 'Recuerda revisar y firmar digitalmente tus contratos y adendas pendientes en el expediente.',
    type: 'document',
    timestamp: 'Ayer, 04:30 PM',
    read: false,
    actionModule: 'documents',
  },
  {
    id: 'notif-audit-sha',
    targetEmployeeId: 'all',
    title: 'Marcajes Biométricos Corroborados',
    message: 'Tus registros de asistencia fueron auditados y certificados por RRHH con sello digital SHA-256.',
    type: 'attendance',
    timestamp: '15 Sept, 10:15 AM',
    read: true,
    actionModule: 'punch',
  },
];

/**
 * Load notifications from persistent local storage
 */
export function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SYSTEM_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.warn('[NotificationService] Error loading stored notifications:', err);
  }
  return INITIAL_SYSTEM_NOTIFICATIONS;
}

/**
 * Save notifications list to persistent storage
 */
export function saveStoredNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.warn('[NotificationService] Error saving notifications to storage:', err);
  }
}

/**
 * Delete a single notification from storage
 */
export function deleteStoredNotification(id: string, current: AppNotification[]): AppNotification[] {
  const updated = current.filter(n => n.id !== id);
  saveStoredNotifications(updated);
  return updated;
}

/**
 * Clear all notifications from storage
 */
export function clearAllStoredNotifications(): AppNotification[] {
  saveStoredNotifications([]);
  return [];
}

export interface RealtimeEventPayload {
  type: 'PUNCH' | 'LEAVE_REQUEST' | 'LEAVE_STATUS' | 'OVERTIME_REQUEST' | 'OVERTIME_STATUS' | 'DOCUMENT_UPLOAD' | 'DOCUMENT_SIGNED' | 'PROFILE_UPDATED' | 'SYSTEM_ALERT';
  notification: AppNotification;
  data?: any;
}

// Cross-tab broadcast channel
let tabBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    tabBroadcastChannel = new BroadcastChannel('urcheck_realtime_notifications_bus');
  }
} catch (e) {
  console.warn('[NotificationService] BroadcastChannel not supported:', e);
}

/**
 * Broadcast an instant notification across open browser tabs/windows and Supabase Realtime channel
 */
export async function broadcastInstantNotification(
  event: RealtimeEventPayload,
  skipAudio: boolean = false
): Promise<void> {
  // 1. Cross-tab immediate broadcast
  try {
    if (tabBroadcastChannel) {
      tabBroadcastChannel.postMessage(event);
    }
  } catch (err) {
    console.warn('[NotificationService] BroadcastChannel send error:', err);
  }

  // 2. Audio chime
  if (!skipAudio) {
    playSystemNotificationSound();
  }

  // 3. Supabase Realtime Broadcast (if online and Supabase configured)
  try {
    const channel = supabase.channel('urcheck_realtime_broadcast');
    channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: event,
    }).catch(() => {
      // Ignored if channel not ready yet
    });
  } catch (err) {
    // Non-blocking
  }
}

export interface RealtimeListenerCallbacks {
  onNotificationReceived: (notification: AppNotification, eventType?: string, data?: any) => void;
  onRefreshDataNeeded?: () => void;
}

/**
 * Subscribes to Supabase Realtime (postgres_changes and broadcast) + Browser BroadcastChannel
 * Ensures instant real-time notifications arrive without browser refresh!
 */
export function subscribeToRealtimeNotifications(
  callbacks: RealtimeListenerCallbacks
): () => void {
  // 1. Cross-tab listener
  const handleTabMessage = (e: MessageEvent<RealtimeEventPayload>) => {
    if (e.data && e.data.notification) {
      callbacks.onNotificationReceived(e.data.notification, e.data.type, e.data.data);
      if (callbacks.onRefreshDataNeeded) {
        callbacks.onRefreshDataNeeded();
      }
    }
  };

  if (tabBroadcastChannel) {
    tabBroadcastChannel.addEventListener('message', handleTabMessage);
  }

  // 2. Supabase Realtime channel
  let supabaseChannel: any = null;
  try {
    supabaseChannel = supabase
      .channel('urcheck_live_notifications_channel')
      // A. Listen to broadcast events
      .on('broadcast', { event: 'notification' }, ({ payload }: { payload: RealtimeEventPayload }) => {
        if (payload?.notification) {
          callbacks.onNotificationReceived(payload.notification, payload.type, payload.data);
          if (callbacks.onRefreshDataNeeded) {
            callbacks.onRefreshDataNeeded();
          }
        }
      })
      // B. Listen to live postgres changes in attendance_records
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const typeLabel = row.type === 'entry' ? 'Entrada' : row.type === 'exit' ? 'Salida' : 'Almuerzo';
          const notif: AppNotification = {
            id: `notif-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: 'all',
            title: `Nuevo Marcaje de ${typeLabel}`,
            message: `${row.employee_name || 'Colaborador'} registró ${typeLabel.toLowerCase()} a las ${row.timestamp || 'recientemente'} (${row.branch_name || 'Sede'}).`,
            type: 'attendance',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'punch',
          };
          callbacks.onNotificationReceived(notif, 'PUNCH', row);
        }
      })
      // C. Listen to live postgres changes in leave_requests
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leave_requests' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const notif: AppNotification = {
            id: `notif-leave-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: 'all',
            title: 'Nueva Solicitud de Permiso',
            message: `${row.employee_name || 'Colaborador'} solicitó permiso por ${row.type || 'asuntos personales'} (${row.days_count || 1} días).`,
            type: 'leave',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'leaves',
          };
          callbacks.onNotificationReceived(notif, 'LEAVE_REQUEST', row);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leave_requests' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const statusLabel = row.status === 'approved' ? 'APROBADA' : row.status === 'rejected' ? 'RECHAZADA' : 'ACTUALIZADA';
          const notif: AppNotification = {
            id: `notif-leave-upd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: row.employee_id || 'all',
            title: `Dictamen de Permiso: ${statusLabel}`,
            message: `La solicitud de ${row.type || 'permiso'} de ${row.employee_name || 'colaborador'} fue marcada como ${statusLabel}.`,
            type: 'leave',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'leaves',
          };
          callbacks.onNotificationReceived(notif, 'LEAVE_STATUS', row);
        }
      })
      // D. Listen to live postgres changes in overtime_records
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'overtime_records' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const notif: AppNotification = {
            id: `notif-ot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: 'all',
            title: 'Horas Extras Solicitadas',
            message: `${row.employee_name || 'Colaborador'} registró ${row.hours || 1} horas extras para el día ${row.date || 'reciente'}.`,
            type: 'overtime',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'overtime',
          };
          callbacks.onNotificationReceived(notif, 'OVERTIME_REQUEST', row);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'overtime_records' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const statusLabel = row.status === 'approved' ? 'APROBADAS' : 'RECHAZADAS';
          const notif: AppNotification = {
            id: `notif-ot-upd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: row.employee_id || 'all',
            title: `Horas Extras: ${statusLabel}`,
            message: `Las horas extras solicitadas por ${row.employee_name || 'colaborador'} han sido ${statusLabel.toLowerCase()}.`,
            type: 'overtime',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'overtime',
          };
          callbacks.onNotificationReceived(notif, 'OVERTIME_STATUS', row);
        }
      })
      // E. Listen to live postgres changes in company_documents
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'company_documents' }, (payload: any) => {
        const row = payload.new;
        if (row) {
          const notif: AppNotification = {
            id: `notif-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: row.target_employee_id || 'all',
            title: 'Nuevo Documento Laboral Publicado',
            message: `Se ha cargado "${row.title || 'Documento'}". Requiere firma digital institucional.`,
            type: 'document',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'documents',
          };
          callbacks.onNotificationReceived(notif, 'DOCUMENT_UPLOAD', row);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'company_documents' }, (payload: any) => {
        const row = payload.new;
        if (row && row.is_employee_signed) {
          const notif: AppNotification = {
            id: `notif-doc-signed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            targetEmployeeId: 'all',
            title: 'Documento Firmado por Colaborador',
            message: `El documento "${row.title || 'Documento'}" fue firmado digitalmente con sello biométrico.`,
            type: 'document',
            timestamp: 'Justo ahora',
            read: false,
            actionModule: 'documents',
          };
          callbacks.onNotificationReceived(notif, 'DOCUMENT_SIGNED', row);
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[NotificationService] Supabase Realtime channel conectado en vivo.');
        }
      });
  } catch (err) {
    console.warn('[NotificationService] Supabase Realtime connection error:', err);
  }

  // Cleanup handler
  return () => {
    if (tabBroadcastChannel) {
      tabBroadcastChannel.removeEventListener('message', handleTabMessage);
    }
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Creates a formatted instant notification object
 */
export function buildInstantNotification(
  title: string,
  message: string,
  type: NotificationType = 'system',
  actionModule?: EmployeeModule,
  targetEmployeeId: string = 'all'
): AppNotification {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    targetEmployeeId,
    title,
    message,
    type,
    timestamp: `Hoy, ${timeStr}`,
    read: false,
    actionModule,
  };
}
