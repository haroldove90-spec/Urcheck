import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { INITIAL_PROFILES } from '../../data/mockData';
import { 
  UserCog, 
  Plus, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Building2,
  Mail,
  User,
  Share2,
  Phone,
  Key,
  RefreshCw
} from 'lucide-react';
import { PasswordField } from '../../components/PasswordField';
import { ShareCredentialsModal } from '../../components/ShareCredentialsModal';
import { CenteredFeedbackModal, FeedbackData } from '../../components/CenteredFeedbackModal';
import { syncUserProfileToSupabase } from '../../services/dbSync';
import { Employee } from '../../types';
import { 
  generateSecurePassword, 
  generateUsername, 
  ShareCredentialsData, 
  ACCESS_PORTAL_URL 
} from '../../utils/credentialUtils';

interface UsersViewProps {
  onSwitchRole?: (role: UserRole) => void;
  onAddEmployee?: (emp: Employee) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onSwitchRole, onAddEmployee }) => {
  const [userList, setUserList] = useState<UserProfile[]>(Object.values(INITIAL_PROFILES));
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(() => generateSecurePassword(11));
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [position, setPosition] = useState('');
  const [branch, setBranch] = useState('Corporativo Reforma');

  // WhatsApp Credentials Sharing Modal State
  const [shareCredentialsData, setShareCredentialsData] = useState<ShareCredentialsData | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setUsername(generateUsername(val));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const roleNameMap: Record<UserRole, string> = {
      admin: 'Administrador',
      employee: 'Empleado',
    };

    const finalUsername = username.trim() || generateUsername(name);
    const finalPassword = password.trim() || generateSecurePassword(11);

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      roleName: roleNameMap[role],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      position: position || (role === 'admin' ? 'Coordinador RRHH' : 'Colaborador'),
      department: role === 'admin' ? 'Recursos Humanos' : 'Operaciones',
      branch,
      status: 'active',
    };

    setUserList(prev => [...prev, newUser]);
    setIsAddUserOpen(false);

    // Synchronize to Supabase in real-time
    syncUserProfileToSupabase(newUser, { phone }).then(res => {
      if (!res.success) {
        console.warn('[Supabase Sync User Error]:', res.error);
      }
    });

    // Notify employee collection if provided
    if (onAddEmployee) {
      onAddEmployee({
        id: newUser.id,
        employeeCode: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newUser.name,
        email: newUser.email,
        phone: phone || '55 1234 5678',
        department: newUser.department || 'Operaciones',
        position: newUser.position || 'Colaborador',
        branchId: branch.toLowerCase().includes('norte') ? 'suc-02' : 'suc-01',
        branchName: branch,
        shift: 'Matutino (08:00 - 17:00)',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        avatar: newUser.avatar,
        dossierStatus: 'complete',
        vacationDaysLeft: 12,
        hourlyRate: role === 'admin' ? 250 : 160,
        documents: [],
      });
    }

    // Set centered feedback
    setFeedback({
      title: '¡Usuario Guardado con Éxito!',
      message: `El usuario "${name}" con rol ${roleNameMap[role]} ha sido registrado y sincronizado en Supabase. ¿Deseas compartir las credenciales vía WhatsApp?`,
      type: 'success',
      actionText: 'Compartir WhatsApp',
      onAction: () => {
        setShareCredentialsData({
          name,
          username: finalUsername,
          password: finalPassword,
          roleName: roleNameMap[role],
          branchName: branch,
          phone: phone || '55 1234 5678',
          portalUrl: ACCESS_PORTAL_URL,
        });
      },
      autoCloseMs: 5000,
    });

    // Reset Form
    setName('');
    setUsername('');
    setPassword(generateSecurePassword(11));
    setEmail('');
    setPhone('');
    setPosition('');
  };

  const handleResetPassword = (userName: string, userRole: UserRole, userBranch: string) => {
    const tempPassword = generateSecurePassword(11);
    setFeedback({
      title: '¡Contraseña Restablecida con Éxito!',
      message: `Se ha generado una nueva contraseña temporal para "${userName}". ¿Deseas compartirla por WhatsApp?`,
      type: 'info',
      actionText: 'Compartir Clave',
      onAction: () => {
        setShareCredentialsData({
          name: userName,
          username: generateUsername(userName),
          password: tempPassword,
          roleName: userRole === 'admin' ? 'Administrador' : 'Empleado',
          branchName: userBranch,
          phone: '55 1234 5678',
          portalUrl: ACCESS_PORTAL_URL,
        });
      },
      autoCloseMs: 4500,
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <div id="admin-users-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#093244] flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#069AD8]" />
            Administración de Usuarios y Credenciales
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Configuración de perfiles, roles institucionales, contraseñas seguras y envío de accesos por WhatsApp
          </p>
        </div>

        <button
          onClick={() => {
            setPassword(generateSecurePassword(11));
            setIsAddUserOpen(true);
          }}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#093244] hover:bg-[#082735] rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Usuario / Colaborador</th>
                <th className="py-3.5 px-4">Rol en Urcheck</th>
                <th className="py-3.5 px-4">Sede Asignada</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4 text-right">Acciones y Credenciales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block leading-tight">
                          {user.name}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? 'bg-[#093244]/10 text-[#093244] border border-[#093244]/20'
                        : 'bg-[#069AD8]/10 text-[#069AD8] border border-[#069AD8]/20'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {user.roleName}
                    </span>
                    <span className="block text-[11px] text-neutral-400 mt-1">
                      {user.position}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs text-neutral-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      {user.branch}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                      title="Click para cambiar estatus"
                    >
                      {user.status === 'active' ? 'Activo' : 'Suspendido'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* Share Credentials via WhatsApp */}
                    <button
                      onClick={() => handleResetPassword(user.name, user.role, user.branch)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                      title="Compartir Credenciales y link por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    {onSwitchRole && (
                      <button
                        onClick={() => onSwitchRole(user.role)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition cursor-pointer"
                        title="Probar vista con este rol"
                      >
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="hidden sm:inline">Simular</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#093244]">
                Registrar Acceso de Usuario
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Flores Gómez"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                />
              </div>

              {/* Credenciales de Acceso */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#093244] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#069AD8]" />
                    Credenciales Generadas para el Usuario
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Usuario de Acceso *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="usuario.login"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2.5 pr-8 rounded-xl border border-neutral-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setUsername(generateUsername(name))}
                      title="Regenerar usuario sugerido"
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-[#069AD8]"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <PasswordField
                    id="input-user-password"
                    label="Contraseña de Acceso"
                    value={password}
                    onChange={setPassword}
                    placeholder="Contraseña segura"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rol en Urcheck</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-[#069AD8]"
                  >
                    <option value="admin">Administrador / RRHH</option>
                    <option value="employee">Empleado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Sede / Sucursal</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-[#069AD8]"
                  >
                    <option value="Corporativo Reforma">Corporativo Reforma</option>
                    <option value="Planta Industrial Norte">Planta Industrial Norte</option>
                    <option value="Centro Logístico Guadalajara">Centro Logístico GDL</option>
                    <option value="Sucursal Monterrey Centro">Sucursal Monterrey</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Puesto Organizacional</label>
                <input
                  type="text"
                  placeholder="Ej. Supervisor de Operaciones"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8]"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#093244] text-white font-bold hover:bg-[#082735] transition cursor-pointer"
                >
                  Crear y Compartir Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Credentials via WhatsApp Modal */}
      <ShareCredentialsModal
        isOpen={Boolean(shareCredentialsData)}
        data={shareCredentialsData}
        onClose={() => setShareCredentialsData(null)}
      />

      {/* Centered Feedback Notification Modal */}
      <CenteredFeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
};
