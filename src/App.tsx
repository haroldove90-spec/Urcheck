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
  AppNotification
} from './types';
import { 
  INITIAL_PROFILES, 
  INITIAL_EMPLOYEES, 
  INITIAL_BRANCHES, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_OVERTIME_RECORDS, 
  INITIAL_SETTINGS 
} from './data/mockData';
import { INITIAL_COMPANY_DOCUMENTS } from './utils/documentUtils';
import { playSystemNotificationSound } from './utils/audioSystem';

// Layout Components
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

// Common / Universal Views
import { UserManualView } from './views/common/UserManualView';

// Supabase Sync Services
import { 
  syncAttendanceToSupabase, 
  syncBatchAttendanceCorroboration, 
  syncEmployeeToSupabase, 
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

  // Notifications State for Employees
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      targetEmployeeId: 'all',
      title: '¡Bienvenido al Portal Biométrico Urcheck!',
      message: 'Tu terminal móvil y reconocimiento facial están activos. Recuerda checar tu entrada y salida diariamente.',
      type: 'system',
      timestamp: 'Hoy, 08:00 AM',
      read: false,
      actionModule: 'punch',
    },
    {
      id: 'notif-2',
      targetEmployeeId: 'all',
      title: 'Contrato y Políticas Pendientes de Firma',
      message: 'Recursos Humanos ha cargado un nuevo documento laboral. Por favor fírmalo digitalmente con tu trazo desde el móvil.',
      type: 'document',
      timestamp: 'Ayer, 04:30 PM',
      read: false,
      actionModule: 'documents',
    },
    {
      id: 'notif-3',
      targetEmployeeId: 'all',
      title: 'Marcaje Biométrico Corroborado',
      message: 'Tus registros de asistencia de la semana fueron auditados y certificados por RRHH con sello digital SHA-256.',
      type: 'attendance',
      timestamp: '15 Sept, 10:15 AM',
      read: true,
      actionModule: 'punch',
    }
  ]);

  // Splash screen: only show when there is NO saved active session
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const saved = loadStoredSession();
    return !saved || !saved.role;
  });

  // DB Sync State indicators
  const [isFetchingDb, setIsFetchingDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

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

  // Fetch live Supabase data on mount and whenever tab gets focus
  useEffect(() => {
    loadDataFromSupabase();

    const handleFocus = () => {
      loadDataFromSupabase();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDataFromSupabase]);

  // Role Switch Handler
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    const profile = INITIAL_PROFILES[role];
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

    // Notify employee with sound
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetEmployeeId: newRecord.employeeId,
      title: `Marcaje ${newRecord.type === 'entry' ? 'de Entrada' : newRecord.type === 'exit' ? 'de Salida' : 'de Almuerzo'} Registrado`,
      message: `Tu asistencia a las ${newRecord.timestamp} ha sido sellada biométricamente (${newRecord.method === 'facial' ? 'Reconocimiento Facial' : newRecord.method === 'fingerprint' ? 'Huella Digital' : 'Tarjeta RFID'}) y sincronizada.`,
      type: 'attendance',
      timestamp: 'Justo ahora',
      read: false,
      actionModule: 'punch',
    };
    setNotifications(prev => [newNotif, ...prev]);
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
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        const updated = {
          ...req,
          status: 'approved' as const,
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
        syncLeaveRequestToSupabase(updated);
        return updated;
      }
      return req;
    }));
  };

  const handleRejectLeave = (leaveId: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        const updated = {
          ...req,
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
        syncLeaveRequestToSupabase(updated);
        return updated;
      }
      return req;
    }));
  };

  const handleSubmitLeaveRequest = (newReq: LeaveRequest) => {
    setLeaveRequests(prev => [newReq, ...prev]);
    syncLeaveRequestToSupabase(newReq);
  };

  // Overtime Handlers
  const handleApproveOvertime = (recordId: string) => {
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        const updated = {
          ...rec,
          status: 'approved' as const,
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
        syncOvertimeToSupabase(updated);
        return updated;
      }
      return rec;
    }));
  };

  const handleRejectOvertime = (recordId: string) => {
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        const updated = {
          ...rec,
          status: 'rejected' as const,
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
        syncOvertimeToSupabase(updated);
        return updated;
      }
      return rec;
    }));
  };

  const handleSubmitOvertime = (newRec: OvertimeRecord) => {
    setOvertimeRecords(prev => [newRec, ...prev]);
    syncOvertimeToSupabase(newRec);
  };

  // Settings
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const handlePurgeMockData = async () => {
    await purgeAllMockDataFromSupabase();
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

  // If no role is selected yet, render the clean role selection screen
  if (!currentRole) {
    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <RoleSelector onSelectRole={handleSelectRole} />
      </>
    );
  }

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'pending').length;
  const pendingOvertimeCount = overtimeRecords.filter(r => r.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const isAdmin = currentRole === 'admin';

  // Notification actions
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 selection:bg-[#069AD8] selection:text-white">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      {/* 1. Unified Institutional Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        employees={employees}
        branches={branches}
        onRefreshFromSupabase={loadDataFromSupabase}
        isRefreshing={isFetchingDb}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Workspace Layout (Desktop Sidebar + Content Area) */}
      <div className="flex-1 flex w-full">
        
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
        />

        {/* Main Content Area (Clean, no redundant duplicate horizontal tabs) */}
        <main 
          id="main-content-viewport"
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-12"
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

              {currentAdminModule === 'manual' && (
                <UserManualView currentRole={currentRole} />
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

              {currentEmployeeModule === 'notifications' && (
                <EmployeeNotificationsView
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                  onClearAll={handleClearAllNotifications}
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
                <UserManualView currentRole={currentRole} />
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
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
