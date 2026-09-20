import { AdminModule, EmployeeModule, SystemMode, SystemModeInfo, UserRole } from '../types';

export const SYSTEM_MODES: Record<SystemMode, SystemModeInfo> = {
  basic: {
    id: 'basic',
    name: 'Básica',
    title: 'Básica',
    badge: 'Básica',
    tagline: 'Checador Ágil y Sencillo',
    badgeLabel: 'Versión Básica',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    description: 'Cero complicaciones. Diseñada para negocios que buscan registrar checadas con selfie/GPS, corroborar asistencia y ver quién llegó hoy sin saturación.',
    targetAudience: 'Negocios locales, comercios, talleres o empresas que inician con control de asistencia.',
    adminModules: ['dashboard', 'attendance', 'employees', 'profile', 'manual', 'settings'],
    employeeModules: ['punch', 'profile', 'manual'],
    includedFeatures: [
      'Kiosko Biométrico con Reconocimiento Facial e IA',
      'Marcaje Móvil PWA con Geolocalización GPS',
      'Monitoreo de Asistencias en Vivo y Retardos',
      'Directorio de Colaboradores y Códigos de Identificación',
      'Perfil Personal con Fotografía y Datos',
      'Manual de Usuario Versión Básica',
    ],
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermedia',
    title: 'Intermedia',
    badge: 'Intermedia',
    tagline: 'Control Operativo & RRHH',
    badgeLabel: 'Versión Intermedia',
    badgeColor: 'text-amber-800',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    description: 'Control de jornadas completas. Suma gestión de turnos rotativos, solicitudes y aprobación de vacaciones/permisos, horas extras y sucursales.',
    targetAudience: 'Empresas en crecimiento con múltiples sedes o requerimiento de autorizar ausencias y extras.',
    adminModules: ['dashboard', 'attendance', 'shifts', 'employees', 'branches', 'leaves', 'overtime', 'profile', 'manual', 'settings'],
    employeeModules: ['punch', 'profile', 'notifications', 'leaves', 'overtime', 'manual'],
    includedFeatures: [
      'Todo lo incluido en la Versión Básica',
      'Matriz de Turnos, Horarios y Días Feriados Oficiales (LFT)',
      'Gestión de Sucursales y Geocercas Perimetrales GPS',
      'Solicitudes de Vacaciones, Permisos y Justificantes',
      'Cálculo y Aprobación de Horas Extraordinarias (LFT Art. 66-68)',
      'Buzón de Notificaciones y Avisos de Empresa',
      'Manual de Usuario Versión Intermedia',
    ],
  },
  full: {
    id: 'full',
    name: 'Full Enterprise',
    title: 'Full Enterprise',
    badge: 'Full Enterprise',
    tagline: 'Suite Integral de Personal',
    badgeLabel: 'Versión Full',
    badgeColor: 'text-blue-800',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-300',
    description: 'Suite integral para departamentos de Recursos Humanos: pre-nómina con deducciones, contratos con firma electrónica, reportes avanzados y auditoría forense.',
    targetAudience: 'Corporativos, plantas industriales y departamentos formales de Recursos Humanos.',
    adminModules: [
      'dashboard',
      'attendance',
      'payroll',
      'shifts',
      'employees',
      'branches',
      'leaves',
      'overtime',
      'reports',
      'users',
      'documents',
      'audit',
      'profile',
      'manual',
      'settings',
    ],
    employeeModules: [
      'punch',
      'notifications',
      'leaves',
      'documents',
      'overtime',
      'profile',
      'manual',
    ],
    includedFeatures: [
      'Todo lo incluido en la Versión Intermedia',
      'Expediente Laboral Digital y Contratos en la Nube',
      'Firma Electrónica Avanzada con Validez Criptográfica SHA-256',
      'Matriz de Pre-Nómina Quincenal con Deducciones por Retardo/Falta',
      'Generador de Constancias de Trabajo y Cartas Patronales',
      'Reportes Ejecutivos Avanzados y Exportaciones en CSV/Excel',
      'Bitácora de Auditoría Forense y Trazabilidad de Acciones',
      'Conexión y Sincronización Directa con Supabase Cloud',
      'Manual de Usuario Versión Full Enterprise',
    ],
  },
};

const SYSTEM_MODE_STORAGE_KEY = 'urcheck_system_mode';

export function getStoredSystemMode(): SystemMode {
  try {
    const saved = localStorage.getItem(SYSTEM_MODE_STORAGE_KEY);
    if (saved === 'basic' || saved === 'intermediate' || saved === 'full') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'basic'; // Default to basic as requested to keep system clean and simple
}

export function saveStoredSystemMode(mode: SystemMode): void {
  try {
    localStorage.setItem(SYSTEM_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

export function isModuleAllowedInMode(role: UserRole, moduleId: string, mode?: SystemMode | string): boolean {
  const safeMode = (mode === 'basic' || mode === 'intermediate' || mode === 'full') ? mode : 'basic';
  const modeInfo = SYSTEM_MODES[safeMode] || SYSTEM_MODES.basic;
  if (role === 'admin') {
    return modeInfo.adminModules.includes(moduleId as AdminModule);
  } else {
    return modeInfo.employeeModules.includes(moduleId as EmployeeModule);
  }
}
