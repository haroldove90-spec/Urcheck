import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AttendanceRecord, Branch, Employee, LeaveRequest, OvertimeRecord, CompanyDocument, SystemSettings } from '../types';

// Supabase Configuration from Environment or User Credentials
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://ljymwaifrkaedgmpdpwv.supabase.co';
// Sanitize URL in case user supplied the /rest/v1 suffix
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

export const SUPABASE_ANON_KEY = 
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeW13YWlmcmthZWRnbXBkcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTY1MDAsImV4cCI6MjEwNDg5MjUwMH0.E5DjUm0q1tCbWRwV3UBwjoBn6gIYo_iliDBCbdZZWVk';

export const SUPABASE_PROJECT_ID = 'ljymwaifrkaedgmpdpwv';
export const SUPABASE_PROJECT_NAME = "urcheck@appdesignsoftware.com's Project";

// Singleton Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// SQL Schema for the user to execute in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- URCHECK BIOCLOUD ENTERPRISE - ESQUEMA COMPLETO DE BASE DE DATOS
-- Proyecto Supabase: urcheck@appdesignsoftware.com's Project (ID: ljymwaifrkaedgmpdpwv)
-- Instrucciones: Copia y pega este script en el "SQL Editor" de tu panel Supabase y presiona "Run".
-- ====================================================================

-- 1. SUCURSALES Y SEDES (branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    latitude DOUBLE PRECISION DEFAULT 19.4326,
    longitude DOUBLE PRECISION DEFAULT -99.1332,
    geofence_radius_meters INTEGER DEFAULT 150,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    biometric_device_name TEXT,
    biometric_device_model TEXT,
    biometric_status TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. EMPLEADOS / COLABORADORES (employees)
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    employee_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    position TEXT,
    department TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    branch_name TEXT,
    hire_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active',
    nfc_card_id TEXT,
    biometric_enrolled BOOLEAN DEFAULT TRUE,
    facial_enrolled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. REGISTROS DE ASISTENCIA Y MARCAJES CON EVIDENCIA FOTOGRÁFICA (attendance_records)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    employee_avatar TEXT,
    branch_id TEXT,
    branch_name TEXT,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('entry', 'lunch_out', 'lunch_in', 'exit')),
    method TEXT NOT NULL CHECK (method IN ('facial', 'fingerprint', 'rfid', 'pin')),
    status TEXT NOT NULL CHECK (status IN ('on_time', 'late', 'early_departure', 'overtime')),
    biometric_device_id TEXT,
    verification_score NUMERIC DEFAULT 99.5,
    hash_audit TEXT NOT NULL,
    photo_snapshot TEXT,
    is_corroborated BOOLEAN DEFAULT FALSE,
    corroborated_by TEXT,
    corroborated_at TEXT,
    corroboration_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SOLICITUDES DE PERMISOS E INCIDENCIAS (leave_requests)
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_date DATE DEFAULT CURRENT_DATE,
    reviewed_by TEXT,
    reviewed_date DATE,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. HORAS EXTRAORDINARIAS (overtime_records)
CREATE TABLE IF NOT EXISTS public.overtime_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    date DATE NOT NULL,
    hours NUMERIC(4,2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by TEXT,
    approved_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. EXPEDIENTE DIGITAL Y CONTRATOS FIRMADOS (company_documents)
CREATE TABLE IF NOT EXISTS public.company_documents (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    description TEXT,
    file_size TEXT,
    file_name TEXT,
    file_data_url TEXT,
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    target_employee_id TEXT DEFAULT 'all',
    target_employee_name TEXT,
    content_clauses JSONB DEFAULT '[]'::jsonb,
    requires_admin_signature BOOLEAN DEFAULT TRUE,
    is_admin_signed BOOLEAN DEFAULT FALSE,
    admin_signature JSONB,
    requires_employee_signature BOOLEAN DEFAULT TRUE,
    is_employee_signed BOOLEAN DEFAULT FALSE,
    employee_signature JSONB,
    status TEXT DEFAULT 'pending_employee',
    security_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. PARÁMETROS DEL SISTEMA (system_settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    company_name TEXT NOT NULL DEFAULT 'Urcheck BioCloud Enterprise México S.A. de C.V.',
    tax_id TEXT NOT NULL DEFAULT 'UBM210915HA8',
    time_zone TEXT NOT NULL DEFAULT 'America/Mexico_City (UTC-6)',
    late_tolerance_minutes INTEGER NOT NULL DEFAULT 10,
    geofence_strict_mode BOOLEAN NOT NULL DEFAULT TRUE,
    biometric_sync_interval_seconds INTEGER NOT NULL DEFAULT 60,
    allow_mobile_clocking BOOLEAN NOT NULL DEFAULT TRUE,
    require_selfie_evidence BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- POLÍTICAS DE ACCESO ROW LEVEL SECURITY (RLS)
-- Permite lectura y escritura inmediata desde la aplicación
-- ====================================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Reglas permisivas para anon y authenticated
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public full access branches" ON public.branches;
    CREATE POLICY "Public full access branches" ON public.branches FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access employees" ON public.employees;
    CREATE POLICY "Public full access employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access attendance" ON public.attendance_records;
    CREATE POLICY "Public full access attendance" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access leaves" ON public.leave_requests;
    CREATE POLICY "Public full access leaves" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access overtime" ON public.overtime_records;
    CREATE POLICY "Public full access overtime" ON public.overtime_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access documents" ON public.company_documents;
    CREATE POLICY "Public full access documents" ON public.company_documents FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access settings" ON public.system_settings;
    CREATE POLICY "Public full access settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ====================================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ====================================================================

-- 1. Sucursal principal
INSERT INTO public.branches (id, name, code, address, city, latitude, longitude, geofence_radius_meters, is_active, status, biometric_device_name, biometric_device_model, biometric_status)
VALUES 
('suc-01', 'Corporativo Reforma', 'SUC-CDMX-01', 'Paseo de la Reforma 483, Cuauhtémoc', 'Ciudad de México', 19.4269, -99.1678, 150, true, 'active', 'ZKTeco SpeedFace-V5L Cloud', 'SpeedFace V5L [TD]', 'online'),
('suc-02', 'Planta Norte Industrial', 'SUC-MTY-02', 'Av. Sendero Divisorio 200, Apodaca', 'Monterrey, N.L.', 25.7785, -100.1874, 250, true, 'active', 'BioTime 8.5 Dactilar Plus', 'ProCapture-T', 'online')
ON CONFLICT (id) DO NOTHING;

-- 2. Configuración inicial
INSERT INTO public.system_settings (id, company_name, tax_id, time_zone, late_tolerance_minutes, geofence_strict_mode, biometric_sync_interval_seconds, allow_mobile_clocking, require_selfie_evidence)
VALUES ('primary', 'Urcheck BioCloud Enterprise México S.A. de C.V.', 'UBM210915HA8', 'America/Mexico_City (UTC-6)', 10, true, 60, true, true)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Habilitar suscripción en tiempo real (Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;

COMMIT;
`;

// Helper to test connectivity
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
  tablesFound?: string[];
}> {
  const start = performance.now();
  try {
    // Attempt a light select from system_settings or branches
    const { data, error } = await supabase.from('system_settings').select('id, company_name').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // If table doesn't exist yet (PGRST116 / 42P01), connection to Supabase API works, but tables need to be created!
      if (error.code === '42P01' || error.message.includes('relation "public.system_settings" does not exist')) {
        return {
          success: true,
          latencyMs,
          message: 'Conexión con Supabase establecida exitosamente. Falta ejecutar el script SQL para crear las tablas.',
        };
      }
      return {
        success: false,
        latencyMs,
        message: `Error de respuesta Supabase: ${error.message}`,
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Conexión en vivo con Supabase activa y autenticada (${latencyMs}ms de latencia).`,
      tablesFound: ['system_settings'],
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      latencyMs,
      message: `Error de red al conectar con Supabase: ${errMsg}`,
    };
  }
}
