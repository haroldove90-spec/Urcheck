// ====================================================================
// URCHECK BIOCLOUD - SCRIPT SQL DE LIMPIEZA DE DATOS DE MUESTRA
// Para ejecutar directamente en el SQL Editor de Supabase
// ====================================================================

export const SUPABASE_PURGE_SQL = `-- ====================================================================
-- URCHECK BIOCLOUD ENTERPRISE - SCRIPT DE LIMPIEZA DE DATOS DE MUESTRA
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Eliminar marcajes y asistencias ficticias de prueba
DELETE FROM public.attendance_records 
WHERE id LIKE 'att-%' 
   OR employee_id IN ('emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008');

-- 2. Eliminar solicitudes de permisos y vacaciones de prueba
DELETE FROM public.leave_requests 
WHERE id LIKE 'leave-%' 
   OR employee_id IN ('emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008');

-- 3. Eliminar horas extraordinarias de prueba
DELETE FROM public.overtime_records 
WHERE id LIKE 'ot-%' 
   OR employee_id IN ('emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008');

-- 4. Eliminar documentos y contratos de prueba generados
DELETE FROM public.company_documents 
WHERE id LIKE 'doc-%' 
   OR uploaded_by = 'Sistema Urcheck Demo';

-- 5. Eliminar empleados de demostración (manteniendo los perfiles principales activos)
DELETE FROM public.employees 
WHERE id IN ('emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008');

-- ====================================================================
-- OPCIONAL: Si deseas vaciar COMPLETAMENTE las tablas de registros
-- conservando intactos los empleados y sucursales, descomenta las líneas siguientes:
-- ====================================================================
-- TRUNCATE TABLE public.attendance_records CASCADE;
-- TRUNCATE TABLE public.leave_requests CASCADE;
-- TRUNCATE TABLE public.overtime_records CASCADE;
-- TRUNCATE TABLE public.company_documents CASCADE;

-- Confirmación de estado final
SELECT 'Limpieza de registros de muestra completada con éxito en Urcheck.' AS status;
`;
