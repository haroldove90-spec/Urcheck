export type UserRole = 
  | 'admin'          // Administrador
  | 'employee';      // Empleado

export type AdminModule = 
  | 'dashboard'
  | 'attendance'
  | 'payroll'
  | 'shifts'
  | 'employees'
  | 'branches'
  | 'leaves'
  | 'overtime'
  | 'reports'
  | 'users'
  | 'documents'
  | 'audit'
  | 'manual'
  | 'profile'
  | 'settings';

export type EmployeeModule = 
  | 'punch'
  | 'notifications'
  | 'leaves'
  | 'documents'
  | 'overtime'
  | 'profile'
  | 'manual';

export interface DigitalSignature {
  id: string;
  signerName: string;
  signerRole: UserRole;
  signerTitle?: string;
  signedAt: string;
  signatureImage: string;
  ipAddress: string;
  deviceInfo: string;
  securityHash: string;
}

export type DocumentCategory = 
  | 'contrato' 
  | 'nda' 
  | 'politica' 
  | 'addendum' 
  | 'constancia';

export interface CompanyDocument {
  id: string;
  code: string;
  title: string;
  category: DocumentCategory;
  categoryLabel: string;
  description: string;
  fileSize: string;
  fileName?: string;
  fileDataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  targetEmployeeId: string | 'all'; // 'all' or specific employeeId
  targetEmployeeName?: string;
  contentClauses: string[];
  
  requiresAdminSignature: boolean;
  isAdminSigned: boolean;
  adminSignature?: DigitalSignature;

  requiresEmployeeSignature: boolean;
  isEmployeeSigned: boolean;
  employeeSignature?: DigitalSignature;

  status: 'pending_both' | 'pending_employee' | 'pending_admin' | 'signed_both';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bio?: string;
  birthDate?: string;
  curpOrTaxId?: string;
  role: UserRole;
  roleName: string;
  avatar: string;
  position: string;
  department: string;
  branch: string;
  employeeId?: string;
  rfidCode?: string;
  pinCode?: string;
  biometricEnrolled?: boolean;
  status: 'active' | 'inactive';
}

export type DocumentStatus = 'complete' | 'pending' | 'missing';

export interface EmployeeDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  lastUpdated?: string;
  fileUrl?: string;
  required: boolean;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  branchId: string;
  branchName: string;
  shift: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'leave';
  avatar: string;
  dossierStatus: DocumentStatus;
  documents: EmployeeDocument[];
  vacationDaysLeft: number;
  hourlyRate: number;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  employeeCount: number;
  managerName: string;
  biometricDeviceName: string;
  biometricIp: string;
  biometricStatus: 'online' | 'syncing' | 'offline';
  status?: 'active' | 'inactive';
  isActive?: boolean;
  lastPing: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
}

export type PunchType = 'entry' | 'lunch_out' | 'lunch_in' | 'exit';
export type BiometricMethod = 'facial' | 'fingerprint' | 'rfid' | 'pin';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeAvatar: string;
  branchId: string;
  branchName: string;
  timestamp: string; // ISO or readable
  type: PunchType;
  method: BiometricMethod;
  status: 'on_time' | 'late' | 'early_departure' | 'overtime';
  biometricDeviceId: string;
  verificationScore?: number;
  hashAudit: string;
  photoSnapshot?: string;
  isCorroborated?: boolean;
  corroboratedBy?: string;
  corroboratedAt?: string;
  corroborationNotes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  type: 'vacaciones' | 'enfermedad' | 'personal' | 'paternidad' | 'maternidad' | 'luto' | 'vacation' | 'medical' | string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
  attachmentName?: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  branchId?: string;
  branchName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  hourlyRate?: number;
  rateMultiplier: 1.5 | 2.0 | 3.0 | number; // Tarifa legal
  estimatedPay: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
}

export interface BiometricHardwareConfig {
  serverIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'HTTP_PUSH';
  cloudSyncApiKey: string;
  autoSyncIntervalSec: number;
  lastSyncTimestamp: string;
  status: 'connected' | 'syncing' | 'disconnected';
  devicesCount: number;
}

export interface SystemSettings {
  companyName: string;
  taxId: string; // RFC
  toleranceMinutes: number;
  standardWorkHours: number;
  defaultShiftStart: string;
  defaultShiftEnd: string;
  biometricConfig: BiometricHardwareConfig;
}

export type NotificationType = 'attendance' | 'document' | 'leave' | 'overtime' | 'system';

export interface AppNotification {
  id: string;
  targetEmployeeId: string; // 'all' or specific employeeId
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionModule?: EmployeeModule;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  type: 'matutino' | 'vespertino' | 'nocturno' | 'mixto' | 'operativo_12x24' | 'administrativo';
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "17:00"
  lunchBreakMinutes: number;
  toleranceMinutes: number;
  workingDays: string[]; // ['Lun', 'Mar', 'Mie', 'Jue', 'Vie']
  assignedEmployeesCount: number;
  description: string;
  color: string;
}

export interface IncidentJustification {
  id: string;
  attendanceRecordId?: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  incidentType: 'retardo' | 'falta' | 'salida_anticipada' | 'falta_injustificada';
  date?: string;
  incidentDate?: string;
  reasonCategory: 'salud_imss' | 'transporte' | 'transporte_vialidad' | 'tramite_oficial' | 'familiar' | 'fuerza_mayor' | 'otro';
  reasonDescription: string;
  attachmentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  createdAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
}

export interface OfficialHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isStatutoryLFT: boolean; // Obligatorio por Ley Federal del Trabajo
  multiplierRate: number; // 2x or 3x
}

export interface PayrollRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  position: string;
  department: string;
  dailyRate: number;
  hourlyRate: number;
  workedDays: number;
  expectedDays: number;
  overtimeHours: number;
  overtimePay: number;
  lateOccurrences: number;
  lateMinutes: number;
  lateDeduction: number;
  unexcusedAbsences: number;
  excusedAbsences: number;
  absenceDeduction: number;
  grossPay: number;
  netPay: number;
  status: 'audit_ok' | 'has_incidents' | 'paid';
}


