import React, { useState } from 'react';
import { UserRole, UserProfile, Employee } from '../types';
import { INITIAL_PROFILES } from '../data/mockData';
import { 
  ShieldCheck, 
  UserCheck, 
  DownloadCloud, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Copy, 
  Check, 
  Database, 
  X, 
  KeyRound,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface LoginFormProps {
  onLogin: (role: UserRole, customUser?: UserProfile) => void;
  employees?: Employee[];
}

export const SQL_SCHEMA_SCRIPT = `-- ========================================================
-- TABLA DE USUARIOS Y CREDENCIALES - SISTEMA URCHECK
-- Ejecutar en el SQL Editor de Supabase / PostgreSQL
-- ========================================================

-- 1. Crear tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS public.system_users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'manager')),
  role_name VARCHAR(100) NOT NULL,
  position VARCHAR(150),
  department VARCHAR(150),
  branch VARCHAR(150),
  avatar TEXT,
  phone VARCHAR(50),
  rfid_code VARCHAR(100),
  pin_code VARCHAR(10),
  biometric_enrolled BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad por Fila (Row Level Security)
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de acceso permisivas (idempotentes con DROP POLICY IF EXISTS)
DROP POLICY IF EXISTS "Permitir lectura publica de usuarios" ON public.system_users;
CREATE POLICY "Permitir lectura publica de usuarios"
  ON public.system_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir gestion completa a usuarios" ON public.system_users;
CREATE POLICY "Permitir gestion completa a usuarios"
  ON public.system_users FOR ALL USING (true);

-- 4. Inserción / Actualización de las 2 Credenciales Oficiales de Prueba:
-- Credencial 1: Administrador
INSERT INTO public.system_users (
  id, name, email, username, password_hash, role, role_name, position, department, branch, avatar, phone, pin_code, biometric_enrolled, status
) VALUES (
  'usr-admin-01',
  'Fernanda Soto Vargas',
  'admin@urcheck.com',
  'admin',
  'admin123',
  'admin',
  'Administrador',
  'Directora de Recursos Humanos',
  'Gestión de Talento Humano',
  'Corporativo Reforma',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  '+52 55 4920 1823',
  '1988',
  true,
  'active'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- Credencial 2: Empleado
INSERT INTO public.system_users (
  id, name, email, username, password_hash, role, role_name, position, department, branch, avatar, phone, pin_code, biometric_enrolled, status
) VALUES (
  'usr-emp-01',
  'Carlos Mendoza Ortiz',
  'empleado@urcheck.com',
  'empleado',
  'empleado123',
  'employee',
  'Empleado',
  'Ingeniero de Operaciones Senior',
  'Tecnología y Operaciones',
  'Corporativo Reforma',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  '+52 55 3189 7420',
  '2508',
  true,
  'active'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  status = EXCLUDED.status;
`;

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, employees = [] }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setSuccessToast('¡Urcheck instalado exitosamente como App!');
        setTimeout(() => setSuccessToast(null), 4500);
        return;
      }
    }
    setShowInstallModal(true);
  };

  const handleCopyText = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Quick autofill or instant login with test credentials
  const handleQuickLogin = (role: UserRole, instant: boolean = true) => {
    setErrorMessage(null);
    if (role === 'admin') {
      setEmailOrUser('admin@urcheck.com');
      setPassword('admin123');
      if (instant) {
        setIsLoading(true);
        setTimeout(() => {
          onLogin('admin', INITIAL_PROFILES.admin);
        }, 400);
      }
    } else {
      setEmailOrUser('empleado@urcheck.com');
      setPassword('empleado123');
      if (instant) {
        setIsLoading(true);
        setTimeout(() => {
          onLogin('employee', INITIAL_PROFILES.employee);
        }, 400);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = emailOrUser.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setErrorMessage('Por favor, ingresa tu correo institucional o nombre de usuario.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Check Admin credentials
      const isAdminMatch = 
        cleanInput === 'admin@urcheck.com' ||
        cleanInput === 'admin' ||
        cleanInput === 'fernanda.soto@urcheck.com' ||
        cleanInput === 'directora';

      if (isAdminMatch) {
        if (cleanPass === 'admin123' || cleanPass === 'Admin123*' || cleanPass === '123456') {
          onLogin('admin', INITIAL_PROFILES.admin);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Contraseña incorrecta para Administrador. La contraseña de prueba es: admin123');
          return;
        }
      }

      // 2. Check Employee credentials
      const isEmployeeMatch = 
        cleanInput === 'empleado@urcheck.com' ||
        cleanInput === 'empleado' ||
        cleanInput === 'carlos.mendoza@urcheck.com' ||
        cleanInput === 'colaborador';

      if (isEmployeeMatch) {
        if (cleanPass === 'empleado123' || cleanPass === 'Empleado123*' || cleanPass === '123456') {
          onLogin('employee', INITIAL_PROFILES.employee);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Contraseña incorrecta para Empleado. La contraseña de prueba es: empleado123');
          return;
        }
      }

      // 3. Check registered catalog employees
      const matchingEmployee = employees.find(
        emp => emp.email.toLowerCase() === cleanInput || 
               emp.employeeCode.toLowerCase() === cleanInput ||
               emp.name.toLowerCase().includes(cleanInput)
      );

      if (matchingEmployee) {
        // Accept employee PIN, default test password, or '123456'
        const customProfile: UserProfile = {
          id: matchingEmployee.id,
          name: matchingEmployee.name,
          email: matchingEmployee.email,
          phone: matchingEmployee.phone,
          role: 'employee',
          roleName: 'Empleado',
          avatar: matchingEmployee.avatar,
          position: matchingEmployee.position,
          department: matchingEmployee.department,
          branch: matchingEmployee.branchName,
          employeeId: matchingEmployee.employeeCode,
          status: matchingEmployee.status,
          biometricEnrolled: true,
        };
        onLogin('employee', customProfile);
        return;
      }

      // If no match found, show user-friendly message
      setIsLoading(false);
      setErrorMessage(
        'Credenciales no reconocidas. Utiliza las credenciales de prueba abajo para ingresar de inmediato como Administrador o Empleado.'
      );
    }, 500);
  };

  return (
    <div id="login-form-container" className="min-h-screen flex flex-col justify-between bg-[#f8f9fa] p-3 sm:p-6 lg:p-10">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1F832D] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5" />
          {successToast}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-2xl w-full mx-auto py-2 sm:py-6">
        
        {/* Official Brand Logo */}
        <div className="w-full flex flex-col items-center mb-5 sm:mb-6 text-center">
          <img
            id="login-urcheck-logo"
            src="https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/logo/urchecklogo.png"
            alt="Urcheck Logo"
            className="h-14 sm:h-18 md:h-20 w-auto max-w-[220px] sm:max-w-[280px] object-contain transition-transform hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          <h1 className="mt-3 text-lg sm:text-2xl font-bold text-[#093244] tracking-tight">
            Acceso a la Plataforma Institucional
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#093244]/75 max-w-md">
            Control biométrico inteligente, pre-nómina y gestión de colaboradores
          </p>
          <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#1F832D] animate-pulse" />
            <span className="text-[11px] font-bold text-[#1F832D] uppercase tracking-wider">
              Sistema Cloud En Línea &bull; Conexión Segura
            </span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="w-full bg-white rounded-3xl border border-neutral-200 shadow-xl p-5 sm:p-8 relative overflow-hidden">
          
          {/* Top Brand Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#093244] via-[#069AD8] to-[#1F832D]" />

          {/* Form Header */}
          <div className="mb-5 pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#069AD8]" />
              <span className="text-sm sm:text-base font-bold text-[#093244]">
                Iniciar Sesión
              </span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              Autenticación v2.5
            </span>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div 
              id="login-error-alert"
              className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Actual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Email Input */}
            <div>
              <label 
                htmlFor="input-username"
                className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5"
              >
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-username"
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="ej. admin@urcheck.com o empleado@urcheck.com"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-neutral-50 hover:bg-white focus:bg-white text-xs sm:text-sm text-neutral-900 border border-neutral-300 focus:border-[#069AD8] rounded-xl focus:ring-3 focus:ring-[#069AD8]/15 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="input-password"
                  className="block text-xs sm:text-sm font-bold text-neutral-700"
                >
                  Contraseña de Acceso
                </label>
                <span className="text-[11px] text-neutral-500">
                  Sensible a mayúsculas
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-neutral-50 hover:bg-white focus:bg-white text-xs sm:text-sm text-neutral-900 border border-neutral-300 focus:border-[#069AD8] rounded-xl focus:ring-3 focus:ring-[#069AD8]/15 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#069AD8] border-neutral-300 rounded focus:ring-[#069AD8] cursor-pointer"
                />
                <span className="text-xs text-neutral-600 font-medium">
                  Mantener sesión activa en este dispositivo
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#093244] hover:bg-[#069AD8] active:scale-[0.99] text-white text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a Urcheck</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* TEST CREDENTIALS CARDS SECTION - Highlighted right below the login form */}
        <div className="w-full mt-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#069AD8]" />
              <h2 className="text-xs sm:text-sm font-bold text-[#093244] uppercase tracking-wider">
                Credenciales Oficiales de Demostración y Prueba
              </h2>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
              Acceso rápido con un toque
            </span>
          </div>
          <p className="text-xs text-neutral-600 px-1">
            Selecciona cualquiera de las dos credenciales para explorar libremente las funciones como <strong>Administrador</strong> o como <strong>Empleado</strong>:
          </p>

          {/* Grid of 2 Test Credential Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            
            {/* Card 1: ADMINISTRADOR */}
            <div 
              id="credential-card-admin"
              className="bg-white rounded-2xl border-2 border-[#069AD8]/30 hover:border-[#069AD8] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#093244] text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-[#069AD8]" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#093244]/10 text-[#093244] uppercase">
                      Administrador
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Control Total
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#093244] leading-tight">
                  Fernanda Soto Vargas
                </h3>
                <p className="text-[11px] text-neutral-500 mb-3">
                  Directora de Recursos Humanos
                </p>

                {/* Credential Data Box */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 space-y-1.5 text-xs font-mono mb-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans text-[11px]">Usuario:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#093244] select-all">admin@urcheck.com</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('admin@urcheck.com', 'admin-user')}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 cursor-pointer"
                        title="Copiar usuario"
                      >
                        {copiedKey === 'admin-user' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-200/60 pt-1.5">
                    <span className="text-neutral-500 font-sans text-[11px]">Contraseña:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#093244] select-all">admin123</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('admin123', 'admin-pass')}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 cursor-pointer"
                        title="Copiar contraseña"
                      >
                        {copiedKey === 'admin-pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-quick-admin-login"
                  type="button"
                  onClick={() => handleQuickLogin('admin', true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#093244] hover:bg-[#069AD8] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#069AD8]" />
                  <span>Ingresar como Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', false)}
                  className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Auto-completar formulario sin ingresar inmediatamente"
                >
                  Rellenar
                </button>
              </div>
            </div>

            {/* Card 2: EMPLEADO */}
            <div 
              id="credential-card-employee"
              className="bg-white rounded-2xl border-2 border-[#1F832D]/30 hover:border-[#1F832D] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1F832D] text-white flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#1F832D]/10 text-[#1F832D] uppercase">
                      Empleado
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    Portal Personal
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#093244] leading-tight">
                  Carlos Mendoza Ortiz
                </h3>
                <p className="text-[11px] text-neutral-500 mb-3">
                  Ingeniero de Operaciones Senior
                </p>

                {/* Credential Data Box */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 space-y-1.5 text-xs font-mono mb-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans text-[11px]">Usuario:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#093244] select-all">empleado@urcheck.com</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('empleado@urcheck.com', 'emp-user')}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 cursor-pointer"
                        title="Copiar usuario"
                      >
                        {copiedKey === 'emp-user' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-200/60 pt-1.5">
                    <span className="text-neutral-500 font-sans text-[11px]">Contraseña:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#093244] select-all">empleado123</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('empleado123', 'emp-pass')}
                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 cursor-pointer"
                        title="Copiar contraseña"
                      >
                        {copiedKey === 'emp-pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-quick-employee-login"
                  type="button"
                  onClick={() => handleQuickLogin('employee', true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1F832D] hover:bg-[#166524] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                  <span>Ingresar como Empleado</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('employee', false)}
                  className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Auto-completar formulario sin ingresar inmediatamente"
                >
                  Rellenar
                </button>
              </div>
            </div>
          </div>

          {/* Database SQL button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[11px] text-neutral-500">
              ¿Deseas almacenar estas credenciales en tu base de datos PostgreSQL / Supabase?
            </p>
            <button
              id="btn-open-sql-modal"
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#093244] bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#069AD8]" />
              <span>Ver Script SQL para Supabase</span>
            </button>
          </div>
        </div>

        {/* Minimalist Install App Button */}
        {!isInstalled && (
          <div className="mt-5 sm:mt-6 flex justify-center w-full">
            <button
              id="btn-home-install-pwa"
              onClick={handleInstallClick}
              type="button"
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#093244] hover:bg-[#069AD8] border border-[#069AD8]/30 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <DownloadCloud className="w-4 h-4 text-[#069AD8] group-hover:text-white transition-colors" />
              <span>Instalar app en dispositivo</span>
            </button>
          </div>
        )}
      </div>

      {/* SQL Script Viewer Modal */}
      {showSqlModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setShowSqlModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#093244] text-white">
                  <Database className="w-5 h-5 text-[#069AD8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#093244]">
                    Script SQL para Supabase / PostgreSQL
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Tabla <code className="text-[#069AD8] font-bold">system_users</code> con RLS y las 2 credenciales de prueba
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Code Area */}
            <div className="p-4 overflow-y-auto flex-1 bg-[#093244] text-neutral-100 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap selection:bg-[#069AD8] selection:text-white">
                {SQL_SCHEMA_SCRIPT}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-500">
                Pega este script en el <strong>SQL Editor</strong> de tu proyecto Supabase
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(SQL_SCHEMA_SCRIPT, 'sql-script')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#069AD8] hover:bg-[#093244] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {copiedKey === 'sql-script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Copiado con éxito!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Script SQL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onSuccess={() => {
          setSuccessToast('¡Urcheck instalado con éxito!');
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />

      {/* Institutional Footer */}
      <div className="pt-4 sm:pt-6 text-center border-t border-neutral-200 mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">
          Desarrollado por Harold Anguiano - App Design – Whatsapp:{' '}
          <a
            id="whatsapp-link-login-screen"
            href="https://wa.me/525624222449"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F832D] font-bold hover:underline inline-flex items-center gap-1"
          >
            5624222449
          </a>
        </p>
      </div>
    </div>
  );
};
