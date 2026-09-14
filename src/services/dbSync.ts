import { supabase } from '../lib/supabase';
import { AttendanceRecord, Branch, Employee, LeaveRequest, OvertimeRecord, CompanyDocument, SystemSettings, UserProfile } from '../types';

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
 * Synchronize a registered user profile directly into Supabase (employees table)
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

    const generatedCode = user.id.startsWith('emp-') 
      ? user.id.toUpperCase() 
      : `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('employees').upsert({
      id: user.id,
      employee_code: generatedCode,
      name: user.name,
      email: user.email,
      phone: extra?.phone || '55 1234 5678',
      avatar: user.avatar,
      position: user.position || (user.role === 'admin' ? 'Administrador del Sistema' : 'Colaborador'),
      department: user.department || (user.role === 'admin' ? 'Recursos Humanos' : 'Operaciones'),
      branch_id: branchId,
      branch_name: branchName,
      hire_date: new Date().toISOString().split('T')[0],
      status: user.status || 'active',
      shift: extra?.shift || 'Matutino (08:00 - 17:00)',
      vacation_days_left: 12,
      hourly_rate: extra?.hourlyRate || (user.role === 'admin' ? 250 : 160),
      dossier_status: 'complete',
    });

    if (error) {
      console.warn('[Supabase Sync] User profile sync failed:', error.message);
      return { success: false, error: error.message };
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
  keepEmployeeIds: string[] = []
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    setMockDataPurgedFlag(true);

    const sampleEmpIds = ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008'];
    const idsToDelete = sampleEmpIds.filter(id => !keepEmployeeIds.includes(id));

    // 1. Delete demo attendance records
    await supabase.from('attendance_records').delete().in('employee_id', sampleEmpIds);
    await supabase.from('attendance_records').delete().ilike('id', 'att-0%');

    // 2. Delete demo leaves
    await supabase.from('leave_requests').delete().in('employee_id', sampleEmpIds);
    await supabase.from('leave_requests').delete().ilike('id', 'leave-0%');

    // 3. Delete demo overtime
    await supabase.from('overtime_records').delete().in('employee_id', sampleEmpIds);
    await supabase.from('overtime_records').delete().ilike('id', 'ot-0%');

    // 4. Delete demo documents
    await supabase.from('company_documents').delete().ilike('id', 'doc-0%');

    // 5. Delete sample employees
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


