import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  AdminModule, 
  EmployeeModule, 
  UserProfile, 
  Employee, 
  Branch, 
  AttendanceRecord, 
  LeaveRequest, 
  OvertimeRecord, 
  SystemSettings,
  CompanyDocument,
  DigitalSignature,
  AppNotification,
  Shift,
  OfficialHoliday,
  AuditLogEntry,
  SystemMode
} from './types';
import { getStoredSystemMode, saveStoredSystemMode } from './utils/systemModes';
import { SystemModeSelectorModal } from './components/SystemModeSelectorModal';
import { 
  INITIAL_PROFILES, 
  INITIAL_EMPLOYEES, 
  INITIAL_BRANCHES, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_OVERTIME_RECORDS, 
  INITIAL_SETTINGS,
  INITIAL_SHIFTS,
  INITIAL_HOLIDAYS,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { INITIAL_COMPANY_DOCUMENTS } from './utils/documentUtils';
import { playSystemNotificationSound } from './utils/audioSystem';

// Layout Components
import { LoginForm } from './components/LoginForm';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { OfflineIndicator } from './components/OfflineIndicator';

// Admin Views
import { DashboardView } from './views/admin/DashboardView';
import { AttendanceView } from './views/admin/AttendanceView';
import { EmployeesView } from './views/admin/EmployeesView';
import { DocumentsView } from './views/admin/DocumentsView';
import { BranchesView } from './views/admin/BranchesView';
import { LeavesView } from './views/admin/LeavesView';
import { OvertimeView } from './views/admin/OvertimeView';
import { ReportsView } from './views/admin/ReportsView';
import { UsersView } from './views/admin/UsersView';
import { SettingsView } from './views/admin/SettingsView';
import { PayrollView } from './views/admin/PayrollView';
import { ShiftsView } from './views/admin/ShiftsView';
import { AuditLogView } from './views/admin/AuditLogView';

// Common / Universal Views
import { UserManualView } from './views/common/UserManualView';
import { UserProfileView } from './views/common/UserProfileView';

// Supabase Sync Services
import { 
  syncAttendanceToSupabase, 
  syncBatchAttendanceCorroboration, 
  syncEmployeeToSupabase, 
  syncUserProfileToSupabase,
  syncBranchToSupabase, 
  syncLeaveRequestToSupabase, 
  syncOvertimeToSupabase, 
  syncDocumentToSupabase,
  syncAllInitialCatalogToSupabase,
  purgeAllMockDataFromSupabase,
  isMockDataPurged,
  setMockDataPurgedFlag,
  deleteEmployeeFromSupabase,
  deleteBranchFromSupabase,
  deleteAttendanceFromSupabase,
  deleteDocumentFromSupabase,
  fetchAllDataFromSupabase,
  loadStoredSession,
  saveStoredSession
} from './services/dbSync';

// Instant Realtime Notification Service & Cross-tab broadcast
import {
  subscribeToRealtimeNotifications,
  broadcastInstantNotification,
  buildInstantNotification,
  loadStoredNotifications,
  saveStoredNotifications,
  clearAllStoredNotifications,
} from './services/notificationService';

// Employee Views
import { BiometricPunchView } from './views/employee/BiometricPunchView';
import { EmployeeNotificationsView } from './views/employee/EmployeeNotificationsView';
import { MyLeavesView } from './views/employee/MyLeavesView';
import { MyDocumentsView } from './views/employee/MyDocumentsView';
import { MyOvertimeView } from './views/employee/MyOvertimeView';

export default function App() {
  // Global State - Preserved across browser refresh
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const saved = loadStoredSession();
    return saved ? saved.role : null;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = loadStoredSession();
    if (saved?.user) return saved.user;
    if (saved?.role) return INITIAL_PROFILES[saved.role];
    return INITIAL_PROFILES.admin;
  });
  
  // Navigation Modules - Preserved across browser refresh
  const [currentAdminModule, setCurrentAdminModule] = useState<AdminModule>(() => {
    const saved = loadStoredSession();
    return saved?.adminModule || 'dashboard';
  });
  const [currentEmployeeModule, setCurrentEmployeeModule] = useState<EmployeeModule>(() => {
    const saved = loadStoredSession();
    return saved?.employeeModule || 'punch';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core Data Stores - Respect mock data purge flag
  const [employees, setEmployees] = useState<Employee[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_EMPLOYEES;
  });
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_ATTENDANCE_RECORDS;
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_LEAVE_REQUESTS;
  });
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_OVERTIME_RECORDS;
  });
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_COMPANY_DOCUMENTS;
  });
  const [shifts, setShifts] = useState<Shift[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_SHIFTS;
  });
  const [holidays, setHolidays] = useState<OfficialHoliday[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_HOLIDAYS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return isMockDataPurged() ? [] : INITIAL_AUDIT_LOGS;
  });

  // Notifications State for Employees & System Alerts with local persistence
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return loadStoredNotifications();
  });

  // Splash screen: only show when there is NO saved active session
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const saved = loadStoredSession();
    return !saved || !saved.role;
  });

  // DB Sync State indicators
  const [isFetchingDb, setIsFetchingDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // System Mode State (Básica, Intermedia, Full Enterprise)
  const [systemMode, setSystemModeState] = useState<SystemMode>(() => getStoredSystemMode());
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState<boolean>(false);

  const setSystemMode = (mode: SystemMode) => {
    setSystemModeState(mode);
    saveStoredSystemMode(mode);
  };

  // Persist session state to localStorage on every change
  useEffect(() => {
    if (currentRole) {
      saveStoredSession({
        role: currentRole,
        user: currentUser,
        adminModule: currentAdminModule,
        employeeModule: currentEmployeeModule,
      });
    } else {
      saveStoredSession(null);
    }
  }, [currentRole, currentUser, currentAdminModule, currentEmployeeModule]);

  // Pull live database state from Supabase so deleted rows in Supabase immediately disappear
  const loadDataFromSupabase = useCallback(async () => {
    setIsFetchingDb(true);
    try {
      const res = await fetchAllDataFromSupabase();
      if (res.success) {
        // When tables exist in Supabase, Supabase is the single source of truth!
        if (res.employees !== undefined) {
          setEmployees(res.employees);
        }
        if (res.branches !== undefined && res.branches.length > 0) {
          setBranches(res.branches);
        }
        if (res.attendanceRecords !== undefined) {
          setAttendanceRecords(res.attendanceRecords);
        }
        if (res.leaveRequests !== undefined) {
          setLeaveRequests(res.leaveRequests);
        }
        if (res.overtimeRecords !== undefined) {
          setOvertimeRecords(res.overtimeRecords);
        }
        if (res.companyDocuments !== undefined) {
          setCompanyDocuments(res.companyDocuments);
        }
        if (res.settings) {
          setSettings(prev => ({
            ...prev,
            companyName: res.settings?.companyName || prev.companyName,
            taxId: res.settings?.taxId || prev.taxId,
            toleranceMinutes: res.settings?.toleranceMinutes ?? prev.toleranceMinutes,
          }));
        }
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('[App] Error fetching data from Supabase:', err);
    } finally {
      setIsFetchingDb(false);
    }
  }, []);

  // Realtime Notifications & Cross-Tab Instant Sync without needing page refresh
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeNotifications({
      onNotificationReceived: (newNotif) => {
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          const updated = [newNotif, ...prev];
          saveStoredNotifications(updated);
          return updated;
        });
        playSystemNotificationSound();
      },
      onRefreshDataNeeded: () => {
        loadDataFromSupabase();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadDataFromSupabase]);

  // Fetch live Supabase data on mount and whenever tab gets focus
  useEffect(() => {
    loadDataFromSupabase();

    const handleFocus = () => {
      loadDataFromSupabase();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDataFromSupabase]);

  // Role & Authentication Handler
  const handleSelectRole = (role: UserRole, customUser?: UserProfile) => {
    setCurrentRole(role);
    const profile = customUser || INITIAL_PROFILES[role];
    setCurrentUser(profile);
    const adminMod: AdminModule = 'dashboard';
    const empMod: EmployeeModule = 'punch';
    if (role === 'admin') {
      setCurrentAdminModule(adminMod);
    } else {
      setCurrentEmployeeModule(empMod);
    }
    saveStoredSession({
      role,
      user: profile,
      adminModule: adminMod,
      employeeModule: empMod,
    });
  };

  const handleLogout = () => {
    saveStoredSession(null);
    setCurrentRole(null);
    setShowSplash(false);
  };

  // Real-time Simulated Punch for Live Reactivity testing
  const handleAddSimulatedPunch = () => {
    const randomEmp = employees[Math.floor(Math.random() * employees.length)];
    const randomBranch = branches[Math.floor(Math.random() * branches.length)];
    const types: ('entry' | 'lunch_out' | 'lunch_in' | 'exit')[] = ['entry', 'lunch_out', 'lunch_in', 'exit'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const methods: ('fingerprint' | 'facial' | 'rfid')[] = ['facial', 'fingerprint', 'rfid'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att-sim-${Date.now()}`,
      employeeId: randomEmp.id,
      employeeName: randomEmp.name,
      employeeCode: randomEmp.employeeCode,
      employeeAvatar: randomEmp.avatar,
      branchId: randomBranch.id,
      branchName: randomBranch.name,
      timestamp: timeStr,
      type: randomType,
      method: randomMethod,
      status: Math.random() > 0.85 ? 'late' : 'on_time',
      biometricDeviceId: randomBranch.biometricDeviceName,
      verificationScore: Number((98.5 + Math.random() * 1.4).toFixed(1)),
      hashAudit: `SHA256: ${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    syncAttendanceToSupabase(newRecord);
  };

  // Record a punch from employee terminal
  const handleRecordPunch = (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => [newRecord, ...prev]);
    syncAttendanceToSupabase(newRecord);

    // Build and broadcast instant notification
    const newNotif = buildInstantNotification(
      `Marcaje ${newRecord.type === 'entry' ? 'de Entrada' : newRecord.type === 'exit' ? 'de Salida' : 'de Almuerzo'} Registrado`,
      `Tu asistencia a las ${newRecord.timestamp} ha sido sellada biométricamente (${newRecord.method === 'facial' ? 'Reconocimiento Facial' : newRecord.method === 'fingerprint' ? 'Huella Digital' : 'Tarjeta RFID'}) y sincronizada.`,
      'attendance',
      'punch',
      newRecord.employeeId
    );
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });
    broadcastInstantNotification({
      type: 'PUNCH',
      notification: newNotif,
      data: newRecord
    });
    playSystemNotificationSound();
  };

  // Employees Handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
    syncEmployeeToSupabase(newEmp);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    syncEmployeeToSupabase(updatedEmp);
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== empId));
    deleteEmployeeFromSupabase(empId);
  };

  // Branches Handlers
  const handleAddBranch = (newBranch: Branch) => {
    setBranches(prev => [...prev, newBranch]);
    syncBranchToSupabase(newBranch);
  };

  const handleUpdateBranch = (updatedBranch: Branch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
    syncBranchToSupabase(updatedBranch);
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches(prev => prev.filter(b => b.id !== branchId));
    deleteBranchFromSupabase(branchId);
  };

  const handleToggleBranchStatus = (branchId: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        const isCurrentlyInactive = b.status === 'inactive' || b.isActive === false;
        const nextStatus = isCurrentlyInactive ? 'active' : 'inactive';
        return {
          ...b,
          status: nextStatus,
          isActive: nextStatus === 'active',
          biometricStatus: nextStatus === 'active' ? 'online' : 'offline',
        };
      }
      return b;
    }));
  };

  // Leaves Handlers
  const handleApproveLeave = (leaveId: string) => {
    let affectedReq: LeaveRequest | undefined;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        affectedReq = {
          ...req,
          status: 'approved' as const,
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
        syncLeaveRequestToSupabase(affectedReq);
        return affectedReq;
      }
      return req;
    }));

    if (affectedReq) {
      const notif = buildInstantNotification(
        'Solicitud de Permiso Aprobada',
        `El permiso de ${affectedReq.employeeName} (${affectedReq.type}, ${affectedReq.daysCount} días) fue aprobado institucionalmente.`,
        'leave',
        'leaves',
        affectedReq.employeeId
      );
      setNotifications(prev => {
        const updated = [notif, ...prev];
        saveStoredNotifications(updated);
        return updated;
      });
      broadcastInstantNotification({
        type: 'LEAVE_STATUS',
        notification: notif,
        data: affectedReq
      });
      playSystemNotificationSound();
    }
  };

  const handleRejectLeave = (leaveId: string, reason: string) => {
    let affectedReq: LeaveRequest | undefined;
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        affectedReq = {
          ...req,
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
        syncLeaveRequestToSupabase(affectedReq);
        return affectedReq;
      }
      return req;
    }));

    if (affectedReq) {
      const notif = buildInstantNotification(
        'Solicitud de Permiso Declinada',
        `El permiso de ${affectedReq.employeeName} fue declinado. Motivo: ${reason}`,
        'leave',
        'leaves',
        affectedReq.employeeId
      );
      setNotifications(prev => {
        const updated = [notif, ...prev];
        saveStoredNotifications(updated);
        return updated;
      });
      broadcastInstantNotification({
        type: 'LEAVE_STATUS',
        notification: notif,
        data: affectedReq
      });
      playSystemNotificationSound();
    }
  };

  const handleSubmitLeaveRequest = (newReq: LeaveRequest) => {
    setLeaveRequests(prev => [newReq, ...prev]);
    syncLeaveRequestToSupabase(newReq);

    const notif = buildInstantNotification(
      'Nueva Solicitud de Permiso Registrada',
      `${newReq.employeeName} solicitó ${newReq.daysCount} día(s) por motivo de ${newReq.type}.`,
      'leave',
      'leaves',
      newReq.employeeId
    );
    setNotifications(prev => {
      const updated = [notif, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });
    broadcastInstantNotification({
      type: 'LEAVE_REQUEST',
      notification: notif,
      data: newReq
    });
    playSystemNotificationSound();
  };

  // Overtime Handlers
  const handleApproveOvertime = (recordId: string) => {
    let affectedRec: OvertimeRecord | undefined;
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        affectedRec = {
          ...rec,
          status: 'approved' as const,
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
        syncOvertimeToSupabase(affectedRec);
        return affectedRec;
      }
      return rec;
    }));

    if (affectedRec) {
      const notif = buildInstantNotification(
        'Horas Extras Aprobadas',
        `Las ${affectedRec.totalHours} horas extras de ${affectedRec.employeeName} (${affectedRec.date}) fueron aprobadas.`,
        'overtime',
        'overtime',
        affectedRec.employeeId
      );
      setNotifications(prev => {
        const updated = [notif, ...prev];
        saveStoredNotifications(updated);
        return updated;
      });
      broadcastInstantNotification({
        type: 'OVERTIME_STATUS',
        notification: notif,
        data: affectedRec
      });
      playSystemNotificationSound();
    }
  };

  const handleRejectOvertime = (recordId: string) => {
    let affectedRec: OvertimeRecord | undefined;
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        affectedRec = {
          ...rec,
          status: 'rejected' as const,
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
        syncOvertimeToSupabase(affectedRec);
        return affectedRec;
      }
      return rec;
    }));

    if (affectedRec) {
      const notif = buildInstantNotification(
        'Horas Extras Declinadas',
        `La solicitud de horas extras de ${affectedRec.employeeName} (${affectedRec.date}) fue declinada.`,
        'overtime',
        'overtime',
        affectedRec.employeeId
      );
      setNotifications(prev => {
        const updated = [notif, ...prev];
        saveStoredNotifications(updated);
        return updated;
      });
      broadcastInstantNotification({
        type: 'OVERTIME_STATUS',
        notification: notif,
        data: affectedRec
      });
      playSystemNotificationSound();
    }
  };

  const handleSubmitOvertime = (newRec: OvertimeRecord) => {
    setOvertimeRecords(prev => [newRec, ...prev]);
    syncOvertimeToSupabase(newRec);

    const notif = buildInstantNotification(
      'Nueva Solicitud de Horas Extras',
      `${newRec.employeeName} solicitó ${newRec.totalHours} horas extraordinarias para el día ${newRec.date}.`,
      'overtime',
      'overtime',
      newRec.employeeId
    );
    setNotifications(prev => {
      const updated = [notif, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });
    broadcastInstantNotification({
      type: 'OVERTIME_REQUEST',
      notification: notif,
      data: newRec
    });
    playSystemNotificationSound();
  };

  // Settings
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const handlePurgeMockData = async () => {
    await purgeAllMockDataFromSupabase();
    setAttendanceRecords([]);
    setLeaveRequests([]);
    setOvertimeRecords([]);
    setCompanyDocuments([]);
    setEmployees(prev => prev.filter(e => e.id === 'emp-001' || e.id === 'emp-002'));
    await loadDataFromSupabase();
  };

  const handleRestoreMockData = async () => {
    setMockDataPurgedFlag(false);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setOvertimeRecords(INITIAL_OVERTIME_RECORDS);
    setCompanyDocuments(INITIAL_COMPANY_DOCUMENTS);
    await syncAllInitialCatalogToSupabase(INITIAL_EMPLOYEES, INITIAL_BRANCHES);
    await loadDataFromSupabase();
  };

  // Company Documents Handlers (Synchronized between Admin and Employee)
  const handleAddDocument = (newDoc: CompanyDocument) => {
    setCompanyDocuments(prev => [newDoc, ...prev]);
    syncDocumentToSupabase(newDoc);
  };

  const handleUpdateDocument = (updatedDoc: CompanyDocument) => {
    setCompanyDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    syncDocumentToSupabase(updatedDoc);
  };

  const handleDeleteDocument = (docId: string) => {
    setCompanyDocuments(prev => prev.filter(d => d.id !== docId));
    deleteDocumentFromSupabase(docId);
  };

  const handleSignDocumentByEmployee = (docId: string, signature: DigitalSignature) => {
    setCompanyDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const updated = {
          ...doc,
          isEmployeeSigned: true,
          employeeSignature: signature,
          status: (doc.isAdminSigned ? 'signed_both' : 'pending_admin') as any,
        };
        syncDocumentToSupabase(updated);
        return updated;
      }
      return doc;
    }));
  };

  // User Profile Update (photo upload, personal data, and bidirectional sync to Supabase)
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);

    // Save updated profile to persistent session
    if (currentRole) {
      saveStoredSession({
        role: currentRole,
        adminModule: currentAdminModule,
        employeeModule: currentEmployeeModule,
        user: updatedProfile,
      });
    }

    // Direct sync of user profile (including name, details, and compressed photo) to Supabase
    await syncUserProfileToSupabase(updatedProfile);

    // Bidirectional sync with employee catalog if matching (Fernanda Soto emp-002, Carlos Mendoza emp-001)
    setEmployees(prev => prev.map(emp => {
      const isMatching = (updatedProfile.employeeId && emp.employeeCode === updatedProfile.employeeId) ||
                         (emp.email.toLowerCase() === updatedProfile.email.toLowerCase()) ||
                         (emp.id === updatedProfile.id) ||
                         (updatedProfile.role === 'admin' && emp.id === 'emp-002') ||
                         (updatedProfile.role === 'employee' && emp.id === 'emp-001');
      if (isMatching) {
        const updatedEmp: Employee = {
          ...emp,
          name: updatedProfile.name,
          email: updatedProfile.email || emp.email,
          phone: updatedProfile.phone || emp.phone,
          avatar: updatedProfile.avatar,
          position: updatedProfile.position || emp.position,
          department: updatedProfile.department || emp.department,
          branchName: updatedProfile.branch || emp.branchName,
        };
        syncEmployeeToSupabase(updatedEmp);
        return updatedEmp;
      }
      return emp;
    }));

    // If employee Carlos Mendoza or current user changed name or avatar, update associated attendance records
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.employeeId === updatedProfile.id || 
         (updatedProfile.role === 'employee' && rec.employeeId === 'emp-001') ||
         (updatedProfile.employeeId && rec.employeeCode === updatedProfile.employeeId)) {
        const updated = { 
          ...rec, 
          employeeName: updatedProfile.name, 
          employeeAvatar: updatedProfile.avatar 
        };
        syncAttendanceToSupabase(updated);
        return updated;
      }
      return rec;
    }));

    // Build and broadcast instant notification for profile update
    const notif = buildInstantNotification(
      'Perfil y Credenciales Actualizados',
      `Tus datos personales y fotografía biométrica han sido respaldados y sincronizados con éxito.`,
      'system',
      'profile',
      updatedProfile.id
    );
    setNotifications(prev => {
      const updated = [notif, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });
    broadcastInstantNotification({
      type: 'PROFILE_UPDATED',
      notification: notif,
      data: updatedProfile
    });
  };

  // Attendance Corroboration & Deletion Handlers
  const handleUpdateAttendanceRecord = (updatedRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    syncAttendanceToSupabase(updatedRecord);
  };

  const handleDeleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    deleteAttendanceFromSupabase(recordId);
  };

  const handleBatchCorroborateAttendance = (recordIds: string[], reviewerName: string) => {
    const nowStr = new Date().toLocaleString('es-MX');
    const notes = 'Corroboración masiva aprobada por Recursos Humanos.';
    setAttendanceRecords(prev => prev.map(r => {
      if (recordIds.includes(r.id)) {
        return {
          ...r,
          isCorroborated: true,
          corroboratedBy: reviewerName,
          corroboratedAt: nowStr,
          corroborationNotes: r.corroborationNotes || notes,
        };
      }
      return r;
    }));
    syncBatchAttendanceCorroboration(recordIds, reviewerName, nowStr, notes);
  };

  // Shift and Holiday Handlers
  const handleAddShift = (newShift: Shift) => {
    setShifts(prev => [...prev, newShift]);
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentRole || 'admin',
      action: 'CREAR_TURNO',
      module: 'Turnos',
      details: `Turno creado: ${newShift.name} (${newShift.code})`,
      severity: 'info'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const handleAssignEmployeeShift = (employeeId: string, shiftName: string) => {
    setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, shift: shiftName } : emp));
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentRole || 'admin',
      action: 'ASIGNAR_TURNO',
      module: 'Turnos',
      details: `Turno asignado: ${shiftName} a colaborador ID ${employeeId}`,
      severity: 'info'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // If no role is selected yet, render the institutional login form
  if (!currentRole) {
    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LoginForm onLogin={handleSelectRole} employees={employees} />
      </>
    );
  }

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'pending').length;
  const pendingOvertimeCount = overtimeRecords.filter(r => r.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const isAdmin = currentRole === 'admin';

  // Notification actions
  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    clearAllStoredNotifications();
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 selection:bg-[#069AD8] selection:text-white w-full max-w-full overflow-x-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      {/* 1. Unified Institutional Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onOpenProfile={() => {
          if (currentRole === 'admin') {
            setCurrentAdminModule('profile');
          } else {
            setCurrentEmployeeModule('profile');
          }
        }}
        employees={employees}
        branches={branches}
        onRefreshFromSupabase={loadDataFromSupabase}
        isRefreshing={isFetchingDb}
        lastSyncTime={lastSyncTime}
        onSelectAdminModule={setCurrentAdminModule}
        onSelectEmployeeModule={setCurrentEmployeeModule}
        currentAdminModule={currentAdminModule}
        currentEmployeeModule={currentEmployeeModule}
        pendingLeavesCount={pendingLeavesCount}
        pendingOvertimeCount={pendingOvertimeCount}
        systemMode={systemMode}
        onOpenModeSelector={() => setIsModeSelectorOpen(true)}
        notifications={notifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
      />

      {/* Main Workspace Layout (Desktop Sidebar + Content Area) */}
      <div className="flex-1 flex w-full min-w-0 max-w-full overflow-x-hidden">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          role={currentRole}
          currentAdminModule={currentAdminModule}
          currentEmployeeModule={currentEmployeeModule}
          onSelectAdminModule={setCurrentAdminModule}
          onSelectEmployeeModule={setCurrentEmployeeModule}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          pendingLeavesCount={pendingLeavesCount}
          pendingOvertimeCount={pendingOvertimeCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onLogout={handleLogout}
          systemMode={systemMode}
          onOpenModeSelector={() => setIsModeSelectorOpen(true)}
        />

        {/* Main Content Area (Clean, no redundant duplicate horizontal tabs) */}
        <main 
          id="main-content-viewport"
          className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-12 overflow-x-hidden"
        >
          {isAdmin ? (
            <>
              {currentAdminModule === 'dashboard' && (
                <DashboardView
                  employees={employees}
                  branches={branches}
                  attendanceRecords={attendanceRecords}
                  onAddSimulatedPunch={handleAddSimulatedPunch}
                  onNavigateToAttendance={() => setCurrentAdminModule('attendance')}
                  onNavigateToModule={setCurrentAdminModule}
                  pendingLeavesCount={pendingLeavesCount}
                  pendingOvertimeCount={pendingOvertimeCount}
                />
              )}

              {currentAdminModule === 'attendance' && (
                <AttendanceView
                  attendanceRecords={attendanceRecords}
                  employees={employees}
                  branches={branches}
                  currentUser={currentUser}
                  onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
                  onBatchCorroborate={handleBatchCorroborateAttendance}
                  onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
                />
              )}

              {currentAdminModule === 'employees' && (
                <EmployeesView
                  employees={employees}
                  branches={branches}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}

              {currentAdminModule === 'documents' && (
                <DocumentsView
                  documents={companyDocuments}
                  employees={employees}
                  currentUser={currentUser}
                  onAddDocument={handleAddDocument}
                  onUpdateDocument={handleUpdateDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}

              {currentAdminModule === 'branches' && (
                <BranchesView
                  branches={branches}
                  onAddBranch={handleAddBranch}
                  onUpdateBranch={handleUpdateBranch}
                  onDeleteBranch={handleDeleteBranch}
                  onToggleBranchStatus={handleToggleBranchStatus}
                />
              )}

              {currentAdminModule === 'leaves' && (
                <LeavesView
                  leaveRequests={leaveRequests}
                  onApproveLeave={handleApproveLeave}
                  onRejectLeave={handleRejectLeave}
                />
              )}

              {currentAdminModule === 'overtime' && (
                <OvertimeView
                  overtimeRecords={overtimeRecords}
                  onApproveOvertime={handleApproveOvertime}
                  onRejectOvertime={handleRejectOvertime}
                />
              )}

              {currentAdminModule === 'reports' && (
                <ReportsView
                  attendanceRecords={attendanceRecords}
                  employees={employees}
                  branches={branches}
                />
              )}

              {currentAdminModule === 'users' && (
                <UsersView 
                  onSwitchRole={handleSelectRole} 
                  onAddEmployee={handleAddEmployee}
                />
              )}

              {currentAdminModule === 'payroll' && (
                <PayrollView
                  attendanceRecords={attendanceRecords}
                  employees={employees}
                  overtimeRecords={overtimeRecords}
                />
              )}

              {currentAdminModule === 'shifts' && (
                <ShiftsView
                  shifts={shifts}
                  employees={employees}
                  holidays={holidays}
                  onAddShift={handleAddShift}
                  onAssignEmployeeShift={handleAssignEmployeeShift}
                />
              )}

              {currentAdminModule === 'audit' && (
                <AuditLogView logs={auditLogs} />
              )}

              {currentAdminModule === 'manual' && (
                <UserManualView 
                  currentRole={currentRole || 'admin'}
                  systemMode={systemMode}
                  onSwitchSystemMode={setSystemMode}
                  onOpenModeSelector={() => setIsModeSelectorOpen(true)}
                />
              )}

              {currentAdminModule === 'profile' && (
                <UserProfileView
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  branches={branches}
                  allEmployees={employees}
                  onPurgeMockData={handlePurgeMockData}
                  onRestoreMockData={handleRestoreMockData}
                  isMockDataPurged={isMockDataPurged()}
                />
              )}

              {currentAdminModule === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onPurgeMockData={handlePurgeMockData}
                  onRestoreMockData={handleRestoreMockData}
                  isMockDataPurged={isMockDataPurged()}
                />
              )}
            </>
          ) : (
            <>
              {currentEmployeeModule === 'punch' && (
                <BiometricPunchView
                  currentUser={currentUser}
                  attendanceRecords={attendanceRecords}
                  onRecordPunch={handleRecordPunch}
                />
              )}

              {currentEmployeeModule === 'profile' && (
                <UserProfileView
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  branches={branches}
                  allEmployees={employees}
                  onPurgeMockData={handlePurgeMockData}
                  onRestoreMockData={handleRestoreMockData}
                  isMockDataPurged={isMockDataPurged()}
                />
              )}

              {currentEmployeeModule === 'notifications' && (
                <EmployeeNotificationsView
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                  onClearAll={handleClearAllNotifications}
                  onDeleteNotification={handleDeleteNotification}
                  onNavigateModule={(mod) => setCurrentEmployeeModule(mod)}
                />
              )}

              {currentEmployeeModule === 'leaves' && (
                <MyLeavesView
                  currentUser={currentUser}
                  leaveRequests={leaveRequests}
                  onSubmitRequest={handleSubmitLeaveRequest}
                />
              )}

              {currentEmployeeModule === 'documents' && (
                <MyDocumentsView 
                  currentUser={currentUser} 
                  companyDocuments={companyDocuments}
                  onSignDocument={handleSignDocumentByEmployee}
                />
              )}

              {currentEmployeeModule === 'overtime' && (
                <MyOvertimeView
                  currentUser={currentUser}
                  overtimeRecords={overtimeRecords}
                  onSubmitOvertime={handleSubmitOvertime}
                />
              )}

              {currentEmployeeModule === 'manual' && (
                <UserManualView 
                  currentRole={currentRole || 'employee'} 
                  systemMode={systemMode}
                  onSwitchSystemMode={setSystemMode}
                  onOpenModeSelector={() => setIsModeSelectorOpen(true)}
                />
              )}

              {currentEmployeeModule === 'profile' && (
                <UserProfileView
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  branches={branches}
                  allEmployees={employees}
                  onPurgeMockData={handlePurgeMockData}
                  onRestoreMockData={handleRestoreMockData}
                  isMockDataPurged={isMockDataPurged()}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar */}
      <BottomBar
        role={currentRole}
        currentAdminModule={currentAdminModule}
        currentEmployeeModule={currentEmployeeModule}
        onSelectAdminModule={setCurrentAdminModule}
        onSelectEmployeeModule={setCurrentEmployeeModule}
        pendingLeavesCount={pendingLeavesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        systemMode={systemMode}
        onOpenModeSelector={() => setIsModeSelectorOpen(true)}
      />

      {/* System Complexity / Mode Switcher Modal */}
      <SystemModeSelectorModal
        isOpen={isModeSelectorOpen}
        onClose={() => setIsModeSelectorOpen(false)}
        currentMode={systemMode}
        onSelectMode={(mode) => {
          setSystemMode(mode);
          setIsModeSelectorOpen(false);
        }}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
