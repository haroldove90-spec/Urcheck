import { supabase } from '../lib/supabase';
import { AttendanceRecord, Branch, Employee, LeaveRequest, OvertimeRecord, CompanyDocument, SystemSettings } from '../types';

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

export async function syncEmployeeToSupabase(employee: Employee): Promise<boolean> {
  try {
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
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Error syncing employee:', err);
    return false;
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
