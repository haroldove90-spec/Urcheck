export type UserRole = 
  | 'admin'          // Administrador / Recursos Humanos
  | 'employee';      // Empleado / Colaborador

export type AdminModule = 
  | 'dashboard'
  | 'employees'
  | 'branches'
  | 'leaves'
  | 'overtime'
  | 'reports'
  | 'users'
  | 'settings';

export type EmployeeModule = 
  | 'punch'
  | 'leaves'
  | 'documents'
  | 'overtime';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName: string;
  avatar: string;
  position: string;
  department: string;
  branch: string;
  employeeId?: string;
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
