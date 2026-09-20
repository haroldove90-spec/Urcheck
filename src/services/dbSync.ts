import { supabase } from '../lib/supabase';
import { 
  AttendanceRecord, 
  Branch, 
  Employee, 
  LeaveRequest, 
  OvertimeRecord, 
  CompanyDocument, 
  SystemSettings, 
  UserProfile,
  UserRole,
  AdminModule,
  EmployeeModule,
  PunchType,
  BiometricMethod
} from '../types';

/**
 * Service to sync Urcheck BioCloud data with Supabase.
 * In case tables don't exist yet, fails gracefully without crashing the app.
 */

export async function syncAttendanceToSupabase(record: AttendanceRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('attendance_records').upsert({
      id: record.id,
      employee_id: record.employeeId,
      employee_name: record.employeeName,
      employee_code: record.employeeCode,
      employee_avatar: record.employeeAvatar,
      branch_id: record.branchId,
      branch_name: record.branchName,
      timestamp: record.timestamp,
      type: record.type,
      method: record.method,
      status: record.status,
      biometric_device_id: record.biometricDeviceId,
      verification_score: record.verificationScore,
      hash_audit: record.hashAudit,
      photo_snapshot: record.photoSnapshot || null,
      is_corroborated: record.isCorroborated || false,
      corroborated_by: record.corroboratedBy || null,
      corroborated_at: record.corroboratedAt || null,
      corroboration_notes: record.corroborationNotes || null,
    });

    if (error) {
      console.warn('[Supabase Sync] Attendance sync skipped (table may need creation):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network issue syncing attendance:', err);
    return false;
  }
}

export async function syncBatchAttendanceCorroboration(
  recordIds: string[],
  reviewerName: string,
  timestamp: string,
  notes: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .update({
        is_corroborated: true,
        corroborated_by: reviewerName,
        corroborated_at: timestamp,
        corroboration_notes: notes,
      })
      .in('id', recordIds);

    if (error) {
      console.warn('[Supabase Sync] Batch corroboration update skipped:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error during batch corroboration sync:', err);
    return false;
  }
}

export async function syncEmployeeToSupabase(employee: Employee): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure the target branch exists in Supabase to prevent foreign key violation (23503)
    if (employee.branchId) {
      const { data: branchData } = await supabase
        .from('branches')
        .select('id')
        .eq('id', employee.branchId)
        .maybeSingle();

      if (!branchData) {
        await supabase.from('branches').upsert({
          id: employee.branchId,
          name: employee.branchName || 'Sede Principal',
          code: `SUC-${employee.branchId.toUpperCase()}`,
          is_active: true,
          status: 'active',
          biometric_device_name: 'Terminal Cloud Urcheck',
          biometric_status: 'online',
        });
      }
    }

    const { error } = await supabase.from('employees').upsert({
      id: employee.id,
      employee_code: employee.employeeCode,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      avatar: employee.avatar,
      position: employee.position,
      department: employee.department,
      branch_id: employee.branchId,
      branch_name: employee.branchName,
      hire_date: employee.hireDate,
      status: employee.status,
      shift: employee.shift,
      vacation_days_left: employee.vacationDaysLeft,
      hourly_rate: employee.hourlyRate,
      dossier_status: employee.dossierStatus,
    });

    if (error) {
      console.warn('[Supabase Sync] Employee sync skipped:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Sync] Error syncing employee:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Optional helper to upload avatar to Supabase Storage bucket 'avatars'
 * If the bucket is not available or permissions deny it, gracefully falls back to base64.
 */
export async function uploadAvatarToSupabaseStorage(
  userId: string,
  dataUrlOrFile: string | File
): Promise<string | null> {
  try {
    let blob: Blob;
    let contentType = 'image/jpeg';
    if (typeof dataUrlOrFile === 'string') {
      if (!dataUrlOrFile.startsWith('data:')) return dataUrlOrFile;
      const res = await fetch(dataUrlOrFile);
      blob = await res.blob();
      contentType = blob.type || 'image/jpeg';
    } else {
      blob = dataUrlOrFile;
      contentType = dataUrlOrFile.type;
    }

    const fileExt = contentType.includes('png') ? 'png' : 'jpg';
    const filePath = `avatar-${userId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType,
        upsert: true,
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('[Supabase Storage] Storage bucket upload fallback:', err);
  }
  return null;
}

/**
 * Synchronize a registered user profile directly into Supabase (employees and system_users tables)
 */
export async function syncUserProfileToSupabase(
  user: UserProfile,
  extra?: { phone?: string; shift?: string; hourlyRate?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const branchName = user.branch || 'Corporativo Reforma';
    const branchId = user.branch?.toLowerCase().includes('norte') ? 'suc-02' : 'suc-01';

    // Ensure branch exists
    const { data: bData } = await supabase
      .from('branches')
      .select('id')
      .eq('id', branchId)
      .maybeSingle();

    if (!bData) {
      await supabase.from('branches').upsert({
        id: branchId,
        name: branchName,
        code: `SUC-${branchId.toUpperCase()}`,
        is_active: true,
        status: 'active',
      });
    }

    // Try uploading avatar to Supabase Storage if it is a new data URL
    let finalAvatar = user.avatar;
    if (user.avatar && user.avatar.startsWith('data:image')) {
      const storageUrl = await uploadAvatarToSupabaseStorage(user.id, user.avatar);
      if (storageUrl) {
        finalAvatar = storageUrl;
        user.avatar = storageUrl;
      }
    }

    // Target employee ID in the employees table
    // For admin (Fernanda Soto), her employee catalog ID is emp-002 (code EMP-7743)
    // For employee (Carlos Mendoza), his employee catalog ID is emp-001 (code EMP-7742)
    const targetEmployeeId = user.role === 'admin' 
      ? 'emp-002' 
      : (user.id.startsWith('usr-') ? 'emp-001' : user.id);

    const targetEmployeeCode = user.employeeId || (
      user.role === 'admin' 
        ? 'EMP-7743' 
        : (targetEmployeeId === 'emp-001' ? 'EMP-7742' : `EMP-${targetEmployeeId.toUpperCase()}`)
    );

    // 1. Sync primary profile into employees table
    const { error: empError } = await supabase.from('employees').upsert({
      id: targetEmployeeId,
      employee_code: targetEmployeeCode,
      name: user.name,
      email: user.email,
      phone: extra?.phone || user.phone || '55 1234 5678',
      avatar: finalAvatar,
      position: user.position || (user.role === 'admin' ? 'Directora de Recursos Humanos' : 'Colaborador'),
      department: user.department || (user.role === 'admin' ? 'Gestión de Talento Humano' : 'Operaciones'),
      branch_id: branchId,
      branch_name: branchName,
      hire_date: '2023-03-15',
      status: user.status || 'active',
      shift: extra?.shift || 'Matutino (08:00 - 17:00)',
      vacation_days_left: 12,
      hourly_rate: extra?.hourlyRate || (user.role === 'admin' ? 250 : 185),
      dossier_status: 'complete',
    });

    if (empError) {
      console.warn('[Supabase Sync] Employees table profile sync failed:', empError.message);
    }

    // 2. Also keep system_users table synchronized (if created in Supabase)
    try {
      const systemUserId = user.role === 'admin' ? 'usr-admin-01' : (user.id === 'emp-001' ? 'usr-emp-01' : user.id);
      await supabase.from('system_users').upsert({
        id: systemUserId,
        name: user.name,
        email: user.email,
        username: user.role === 'admin' ? 'admin' : (user.email.split('@')[0] || 'empleado'),
        password_hash: user.role === 'admin' ? 'admin123' : 'empleado123',
        role: user.role,
        role_name: user.roleName || (user.role === 'admin' ? 'Administrador' : 'Empleado'),
        position: user.position || (user.role === 'admin' ? 'Directora de Recursos Humanos' : 'Colaborador'),
        department: user.department || (user.role === 'admin' ? 'Gestión de Talento Humano' : 'Operaciones'),
        branch: branchName,
        avatar: finalAvatar,
        phone: user.phone || '55 1234 5678',
        pin_code: user.pinCode || '1988',
        biometric_enrolled: true,
        status: user.status || 'active',
        updated_at: new Date().toISOString(),
      });
    } catch (sysErr) {
      console.warn('[Supabase Sync] system_users upsert skipped:', sysErr);
    }

    // 3. Keep attendance records updated with new employee name & avatar
    try {
      await supabase
        .from('attendance_records')
        .update({
          employee_name: user.name,
          employee_avatar: finalAvatar,
        })
        .eq('employee_id', targetEmployeeId);
    } catch (attErr) {
      console.warn('[Supabase Sync] attendance records update skipped:', attErr);
    }

    // 4. Keep leave requests and overtime records updated
    try {
      await supabase
        .from('leave_requests')
        .update({
          employee_name: user.name,
          employee_avatar: finalAvatar,
        })
        .eq('employee_id', targetEmployeeId);

      await supabase
        .from('overtime_records')
        .update({
          employee_name: user.name,
          employee_avatar: finalAvatar,
        })
        .eq('employee_id', targetEmployeeId);
    } catch (subErr) {
      console.warn('[Supabase Sync] sub-records update skipped:', subErr);
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Sync] Error syncing user profile:', msg);
    return { success: false, error: msg };
  }
}

export async function syncBranchToSupabase(branch: Branch): Promise<boolean> {
  try {
    const { error } = await supabase.from('branches').upsert({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      latitude: branch.latitude,
      longitude: branch.longitude,
      geofence_radius_meters: branch.geofenceRadiusMeters,
      is_active: true,
      status: 'active',
      biometric_device_name: branch.biometricDeviceName,
      biometric_device_model: 'Cloud Terminal',
      biometric_status: branch.biometricStatus,
    });

    if (error) {
      console.warn('[Supabase Sync] Branch sync skipped:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error syncing branch:', err);
    return false;
  }
}

export async function syncLeaveRequestToSupabase(leave: LeaveRequest): Promise<boolean> {
  try {
    const { error } = await supabase.from('leave_requests').upsert({
      id: leave.id,
      employee_id: leave.employeeId,
      employee_name: leave.employeeName,
      employee_avatar: leave.employeeAvatar,
      type: leave.type,
      start_date: leave.startDate,
      end_date: leave.endDate,
      days_count: leave.daysCount,
      reason: leave.reason,
      status: leave.status,
      requested_date: leave.requestDate,
      reviewed_by: leave.reviewedBy || null,
      reviewed_date: leave.reviewedDate || null,
      rejection_reason: leave.rejectionReason || null,
    });

    if (error) {
      console.warn('[Supabase Sync] Leave request sync skipped:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error syncing leave request:', err);
    return false;
  }
}

export async function syncOvertimeToSupabase(overtime: OvertimeRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('overtime_records').upsert({
      id: overtime.id,
      employee_id: overtime.employeeId,
      employee_name: overtime.employeeName,
      employee_avatar: overtime.employeeAvatar,
      date: overtime.date,
      hours: overtime.totalHours,
      reason: overtime.reason,
      status: overtime.status,
      approved_by: overtime.approvedBy || null,
      approved_date: overtime.approvedDate || null,
    });

    if (error) {
      console.warn('[Supabase Sync] Overtime sync skipped:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error syncing overtime record:', err);
    return false;
  }
}

export async function syncDocumentToSupabase(doc: CompanyDocument): Promise<boolean> {
  try {
    const { error } = await supabase.from('company_documents').upsert({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      category: doc.category,
      category_label: doc.categoryLabel,
      description: doc.description,
      file_size: doc.fileSize,
      file_name: doc.fileName,
      file_data_url: doc.fileDataUrl || null,
      uploaded_at: doc.uploadedAt,
      uploaded_by: doc.uploadedBy,
      target_employee_id: doc.targetEmployeeId,
      target_employee_name: doc.targetEmployeeName || null,
      content_clauses: doc.contentClauses,
      requires_admin_signature: doc.requiresAdminSignature,
      is_admin_signed: doc.isAdminSigned,
      admin_signature: doc.adminSignature || null,
      requires_employee_signature: doc.requiresEmployeeSignature,
      is_employee_signed: doc.isEmployeeSigned,
      employee_signature: doc.employeeSignature || null,
      status: doc.status,
    });

    if (error) {
      console.warn('[Supabase Sync] Document sync skipped:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error syncing document:', err);
    return false;
  }
}

/**
 * Bulk sync current employees and branches to ensure all foreign keys in Supabase are satisfied.
 */
export async function syncAllInitialCatalogToSupabase(
  employees: Employee[],
  branches: Branch[]
): Promise<{ success: boolean; employeesSynced: number; branchesSynced: number; error?: string }> {
  try {
    let branchesSynced = 0;
    for (const b of branches) {
      const ok = await syncBranchToSupabase(b);
      if (ok) branchesSynced++;
    }

    let employeesSynced = 0;
    for (const e of employees) {
      const res = await syncEmployeeToSupabase(e);
      if (res.success) employeesSynced++;
    }

    return {
      success: true,
      employeesSynced,
      branchesSynced,
    };
  } catch (err) {
    return {
      success: false,
      employeesSynced: 0,
      branchesSynced: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const MOCK_DATA_PURGED_STORAGE_KEY = 'urcheck_mock_data_purged';

export function isMockDataPurged(): boolean {
  try {
    return localStorage.getItem(MOCK_DATA_PURGED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMockDataPurgedFlag(purged: boolean): void {
  try {
    if (purged) {
      localStorage.setItem(MOCK_DATA_PURGED_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(MOCK_DATA_PURGED_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage access warning:', e);
  }
}

/**
 * Permanently purge demo/sample mock records from Supabase and mark persistent state
 * so they are never re-seeded or re-loaded into the database.
 */
export async function purgeAllMockDataFromSupabase(
  keepEmployeeIds: string[] = ['emp-001', 'emp-002', 'usr-admin-01']
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    setMockDataPurgedFlag(true);

    const sampleEmpIds = ['emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008'];
    const allDemoIds = ['emp-001', 'emp-002', ...sampleEmpIds];
    const idsToDelete = sampleEmpIds.filter(id => !keepEmployeeIds.includes(id));

    // 1. Delete demo attendance records
    await supabase.from('attendance_records').delete().in('employee_id', allDemoIds);
    await supabase.from('attendance_records').delete().ilike('id', 'att-%');

    // 2. Delete demo leaves
    await supabase.from('leave_requests').delete().in('employee_id', allDemoIds);
    await supabase.from('leave_requests').delete().ilike('id', 'leave-%');

    // 3. Delete demo overtime
    await supabase.from('overtime_records').delete().in('employee_id', allDemoIds);
    await supabase.from('overtime_records').delete().ilike('id', 'ot-%');

    // 4. Delete demo documents
    await supabase.from('company_documents').delete().ilike('id', 'doc-%');

    // 5. Delete sample demo employees (keeping the active admin and employee)
    if (idsToDelete.length > 0) {
      await supabase.from('employees').delete().in('id', idsToDelete);
    }

    return {
      success: true,
      message: 'Registros de muestra eliminados de Supabase exitosamente. Los datos de prueba no se volverán a cargar.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Sync] Error during demo purge:', msg);
    return {
      success: false,
      message: 'Ocurrió un error al depurar los datos de Supabase',
      error: msg,
    };
  }
}

// ====================================================================
// PERSISTENT BROWSER SESSION MANAGEMENT (Keeps section active on refresh)
// ====================================================================

export const SESSION_STORAGE_KEY = 'urcheck_active_user_session';

export interface StoredSession {
  role: UserRole;
  user: UserProfile;
  adminModule: AdminModule;
  employeeModule: EmployeeModule;
}

export function loadStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'admin' || parsed.role === 'employee')) {
      return parsed;
    }
  } catch (e) {
    console.warn('[Session] Could not parse stored session:', e);
  }
  return null;
}

export function saveStoredSession(session: StoredSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.warn('[Session] Could not persist session to localStorage:', e);
  }
}

// ====================================================================
// DELETE ENTITIES FROM SUPABASE (Ensures deletes in UI reflect in database)
// ====================================================================

export async function deleteEmployeeFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting employee:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting employee:', err);
    return false;
  }
}

export async function deleteBranchFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting branch:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting branch:', err);
    return false;
  }
}

export async function deleteAttendanceFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('attendance_records').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting attendance record:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting attendance record:', err);
    return false;
  }
}

export async function deleteDocumentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('company_documents').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting document:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting document:', err);
    return false;
  }
}

export async function deleteLeaveRequestFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting leave request:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting leave request:', err);
    return false;
  }
}

export async function deleteOvertimeFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('overtime_records').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Sync] Error deleting overtime record:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Network error deleting overtime record:', err);
    return false;
  }
}

// ====================================================================
// FETCH LIVE DATA FROM SUPABASE
// Crucial: When rows are deleted from Supabase, this fetches the REAL state
// from Supabase so deleted records disappear immediately from the frontend.
// ====================================================================

export interface SupabaseFetchResult {
  success: boolean;
  employees?: Employee[];
  branches?: Branch[];
  attendanceRecords?: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  overtimeRecords?: OvertimeRecord[];
  companyDocuments?: CompanyDocument[];
  settings?: Partial<SystemSettings>;
  error?: string;
}

export async function fetchAllDataFromSupabase(): Promise<SupabaseFetchResult> {
  try {
    const result: SupabaseFetchResult = { success: true };

    // 1. Fetch Employees
    const { data: empData, error: empErr } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });

    if (!empErr && Array.isArray(empData)) {
      result.employees = empData.map((r: any) => ({
        id: String(r.id),
        employeeCode: r.employee_code || `EMP-${r.id}`,
        name: r.name || 'Sin nombre',
        email: r.email || '',
        phone: r.phone || '',
        avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        position: r.position || 'Colaborador',
        department: r.department || 'Operaciones',
        branchId: r.branch_id || 'suc-01',
        branchName: r.branch_name || 'Sede Principal',
        shift: r.shift || 'Matutino (08:00 - 17:00)',
        hireDate: r.hire_date || new Date().toISOString().split('T')[0],
        status: (r.status as 'active' | 'inactive' | 'leave') || 'active',
        dossierStatus: (r.dossier_status as any) || 'complete',
        documents: [],
        vacationDaysLeft: typeof r.vacation_days_left === 'number' ? r.vacation_days_left : 12,
        hourlyRate: typeof r.hourly_rate === 'number' ? r.hourly_rate : 160,
      }));
    }

    // 2. Fetch Branches
    const { data: branchData, error: branchErr } = await supabase
      .from('branches')
      .select('*')
      .order('name', { ascending: true });

    if (!branchErr && Array.isArray(branchData) && branchData.length > 0) {
      result.branches = branchData.map((r: any) => ({
        id: String(r.id),
        name: r.name || 'Sucursal',
        code: r.code || `SUC-${r.id}`,
        address: r.address || 'Av. Insurgentes Sur 1602',
        city: r.city || 'Ciudad de México',
        employeeCount: 0,
        managerName: 'Gerencia de Sede',
        biometricDeviceName: r.biometric_device_name || 'Terminal Biométrica',
        biometricIp: '192.168.1.100',
        biometricStatus: (r.biometric_status as any) || 'online',
        status: (r.status as any) || 'active',
        isActive: r.is_active ?? true,
        lastPing: 'En línea',
        latitude: typeof r.latitude === 'number' ? r.latitude : 19.4326,
        longitude: typeof r.longitude === 'number' ? r.longitude : -99.1332,
        geofenceRadiusMeters: typeof r.geofence_radius_meters === 'number' ? r.geofence_radius_meters : 150,
      }));
    }

    // 3. Fetch Attendance Records
    const { data: attData, error: attErr } = await supabase
      .from('attendance_records')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!attErr && Array.isArray(attData)) {
      result.attendanceRecords = attData.map((r: any) => ({
        id: String(r.id),
        employeeId: String(r.employee_id || ''),
        employeeName: r.employee_name || 'Colaborador',
        employeeCode: r.employee_code || '',
        employeeAvatar: r.employee_avatar || '',
        branchId: r.branch_id || 'suc-01',
        branchName: r.branch_name || 'Sede Principal',
        timestamp: r.timestamp || '',
        type: (r.type as PunchType) || 'entry',
        method: (r.method as BiometricMethod) || 'facial',
        status: (r.status as any) || 'on_time',
        biometricDeviceId: r.biometric_device_id || 'Terminal Cloud',
        verificationScore: Number(r.verification_score) || 99,
        hashAudit: r.hash_audit || `SHA256:${String(r.id).slice(0, 10)}`,
        photoSnapshot: r.photo_snapshot || undefined,
        isCorroborated: Boolean(r.is_corroborated),
        corroboratedBy: r.corroborated_by || undefined,
        corroboratedAt: r.corroborated_at || undefined,
        corroborationNotes: r.corroboration_notes || undefined,
      }));
    }

    // 4. Fetch Leave Requests
    const { data: leaveData, error: leaveErr } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!leaveErr && Array.isArray(leaveData)) {
      result.leaveRequests = leaveData.map((r: any) => ({
        id: String(r.id),
        employeeId: String(r.employee_id || ''),
        employeeName: r.employee_name || '',
        employeeAvatar: r.employee_avatar || '',
        type: r.type || 'vacaciones',
        startDate: r.start_date || '',
        endDate: r.end_date || '',
        daysCount: Number(r.days_count) || 1,
        reason: r.reason || '',
        status: (r.status as any) || 'pending',
        requestDate: r.requested_date || new Date().toISOString().split('T')[0],
        reviewedBy: r.reviewed_by || undefined,
        reviewedDate: r.reviewed_date || undefined,
        rejectionReason: r.rejection_reason || undefined,
      }));
    }

    // 5. Fetch Overtime Records
    const { data: otData, error: otErr } = await supabase
      .from('overtime_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (!otErr && Array.isArray(otData)) {
      result.overtimeRecords = otData.map((r: any) => {
        const hoursNum = Number(r.hours) || 2;
        return {
          id: String(r.id),
          employeeId: String(r.employee_id || ''),
          employeeName: r.employee_name || '',
          employeeAvatar: r.employee_avatar || '',
          branchId: 'suc-01',
          branchName: 'Sede Principal',
          date: r.date || new Date().toISOString().split('T')[0],
          startTime: '17:00',
          endTime: '19:30',
          totalHours: hoursNum,
          hourlyRate: 160,
          rateMultiplier: 2.0,
          estimatedPay: hoursNum * 160 * 2.0,
          reason: r.reason || '',
          status: (r.status as any) || 'pending',
          approvedBy: r.approved_by || undefined,
          approvedDate: r.approved_date || undefined,
        };
      });
    }

    // 6. Fetch Company Documents
    const { data: docData, error: docErr } = await supabase
      .from('company_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!docErr && Array.isArray(docData)) {
      result.companyDocuments = docData.map((r: any) => ({
        id: String(r.id),
        code: r.code || 'DOC-001',
        title: r.title || 'Documento',
        category: r.category || 'contrato',
        categoryLabel: r.category_label || 'Contrato',
        description: r.description || '',
        fileSize: r.file_size || '1.0 MB',
        fileName: r.file_name || undefined,
        fileDataUrl: r.file_data_url || undefined,
        uploadedAt: r.uploaded_at || new Date().toISOString().split('T')[0],
        uploadedBy: r.uploaded_by || 'Administrador',
        targetEmployeeId: r.target_employee_id || 'all',
        targetEmployeeName: r.target_employee_name || undefined,
        contentClauses: Array.isArray(r.content_clauses) ? r.content_clauses : [],
        requiresAdminSignature: r.requires_admin_signature ?? true,
        isAdminSigned: r.is_admin_signed ?? false,
        adminSignature: r.admin_signature || undefined,
        requiresEmployeeSignature: r.requires_employee_signature ?? true,
        isEmployeeSigned: r.is_employee_signed ?? false,
        employeeSignature: r.employee_signature || undefined,
        status: (r.status as any) || 'pending_employee',
      }));
    }

    // 7. Fetch System Settings
    const { data: settData, error: settErr } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'primary')
      .maybeSingle();

    if (!settErr && settData) {
      result.settings = {
        companyName: settData.company_name,
        taxId: settData.tax_id,
        toleranceMinutes: settData.late_tolerance_minutes,
      };
    }

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Sync] Error during fetchAllDataFromSupabase:', msg);
    return { success: false, error: msg };
  }
}



