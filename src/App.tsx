import React, { useState } from 'react';
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
  DigitalSignature
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

// Layout Components
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { Footer } from './components/Footer';

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

// Employee Views
import { BiometricPunchView } from './views/employee/BiometricPunchView';
import { MyLeavesView } from './views/employee/MyLeavesView';
import { MyDocumentsView } from './views/employee/MyDocumentsView';
import { MyOvertimeView } from './views/employee/MyOvertimeView';

export default function App() {
  // Global State
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES.admin);
  
  // Navigation Modules
  const [currentAdminModule, setCurrentAdminModule] = useState<AdminModule>('dashboard');
  const [currentEmployeeModule, setCurrentEmployeeModule] = useState<EmployeeModule>('punch');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core Data Stores
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(INITIAL_OVERTIME_RECORDS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>(INITIAL_COMPANY_DOCUMENTS);

  // Role Switch Handler
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(INITIAL_PROFILES[role]);
    if (role === 'admin') {
      setCurrentAdminModule('dashboard');
    } else {
      setCurrentEmployeeModule('punch');
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
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
  };

  // Record a punch from employee terminal
  const handleRecordPunch = (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => [newRecord, ...prev]);
  };

  // Employees Handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== empId));
  };

  // Branches Handlers
  const handleAddBranch = (newBranch: Branch) => {
    setBranches(prev => [...prev, newBranch]);
  };

  const handleUpdateBranch = (updatedBranch: Branch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches(prev => prev.filter(b => b.id !== branchId));
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
        return {
          ...req,
          status: 'approved',
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
      }
      return req;
    }));
  };

  const handleRejectLeave = (leaveId: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        return {
          ...req,
          status: 'rejected',
          rejectionReason: reason,
          reviewedBy: currentUser.name,
          reviewedDate: new Date().toISOString().split('T')[0],
        };
      }
      return req;
    }));
  };

  const handleSubmitLeaveRequest = (newReq: LeaveRequest) => {
    setLeaveRequests(prev => [newReq, ...prev]);
  };

  // Overtime Handlers
  const handleApproveOvertime = (recordId: string) => {
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: 'approved',
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
      }
      return rec;
    }));
  };

  const handleRejectOvertime = (recordId: string) => {
    setOvertimeRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: 'rejected',
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString().split('T')[0],
        };
      }
      return rec;
    }));
  };

  const handleSubmitOvertime = (newRec: OvertimeRecord) => {
    setOvertimeRecords(prev => [newRec, ...prev]);
  };

  // Settings
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  // Company Documents Handlers (Synchronized between Admin and Employee)
  const handleAddDocument = (newDoc: CompanyDocument) => {
    setCompanyDocuments(prev => [newDoc, ...prev]);
  };

  const handleUpdateDocument = (updatedDoc: CompanyDocument) => {
    setCompanyDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleDeleteDocument = (docId: string) => {
    setCompanyDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSignDocumentByEmployee = (docId: string, signature: DigitalSignature) => {
    setCompanyDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          isEmployeeSigned: true,
          employeeSignature: signature,
          status: doc.isAdminSigned ? 'signed_both' : 'pending_admin',
        };
      }
      return doc;
    }));
  };

  // Attendance Corroboration Handlers
  const handleUpdateAttendanceRecord = (updatedRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleBatchCorroborateAttendance = (recordIds: string[], reviewerName: string) => {
    const nowStr = new Date().toLocaleString('es-MX');
    setAttendanceRecords(prev => prev.map(r => {
      if (recordIds.includes(r.id)) {
        return {
          ...r,
          isCorroborated: true,
          corroboratedBy: reviewerName,
          corroboratedAt: nowStr,
          corroborationNotes: r.corroborationNotes || 'Corroboración masiva aprobada por Recursos Humanos.',
        };
      }
      return r;
    }));
  };

  // If no role is selected yet, render the clean role selection screen
  if (!currentRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'pending').length;
  const pendingOvertimeCount = overtimeRecords.filter(r => r.status === 'pending').length;
  const isAdmin = currentRole === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 selection:bg-[#0871A0] selection:text-white">
      
      {/* 1. Unified Institutional Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
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
                <UsersView onSwitchRole={handleSelectRole} />
              )}

              {currentAdminModule === 'manual' && (
                <UserManualView currentRole={currentRole} />
              )}

              {currentAdminModule === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
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
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
