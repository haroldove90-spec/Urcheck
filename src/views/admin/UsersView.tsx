import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { INITIAL_PROFILES } from '../../data/mockData';
import { 
  UserCog, 
  Plus, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  X, 
  Building2,
  Mail,
  User
} from 'lucide-react';

interface UsersViewProps {
  onSwitchRole?: (role: UserRole) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onSwitchRole }) => {
  const [userList, setUserList] = useState<UserProfile[]>(Object.values(INITIAL_PROFILES));
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [position, setPosition] = useState('');
  const [branch, setBranch] = useState('Corporativo Reforma');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const roleNameMap: Record<UserRole, string> = {
      admin: 'Administrador / Recursos Humanos',
      employee: 'Empleado',
    };

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
    setName('');
    setEmail('');
    setStatusMessage(`Usuario ${name} registrado con credenciales de acceso activas.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetPassword = (userName: string) => {
    setStatusMessage(`Enlace temporal de restablecimiento enviado a ${userName}.`);
    setTimeout(() => setStatusMessage(null), 3500);
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
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#0871A0]" />
            Administración de Usuarios y Credenciales
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Configuración de perfiles, roles institucionales y privilegios de acceso a Urcheck
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {statusMessage && (
        <div className="bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#138128]" />
          {statusMessage}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol en Sistema</th>
                <th className="py-3 px-4">Puesto y Sede</th>
                <th className="py-3 px-4">Estatus Acceso</th>
                <th className="py-3 px-4 text-right">Acciones de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#0A3142] block leading-snug">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-[#0A3142]/10 text-[#0A3142] border border-[#0A3142]/20' 
                        : 'bg-[#0871A0]/10 text-[#0871A0] border border-[#0871A0]/20'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {user.role === 'admin' ? 'Administrador / Recursos Humanos' : 'Empleado'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-800 block">
                      {user.position}
                    </span>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {user.branch}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition ${
                        user.status === 'active'
                          ? 'bg-[#138128]/10 text-[#138128] hover:bg-[#138128]/20'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-[#138128]' : 'bg-neutral-500'}`} />
                      {user.status === 'active' ? 'Activo' : 'Suspendido'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(user.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition"
                      title="Enviar restablecimiento de contraseña"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Reset Clave</span>
                    </button>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#0A3142]">
                Nuevo Acceso a Urcheck
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
                  placeholder="Ej. Roberto Flores"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Rol y Nivel de Acceso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-[#0871A0]"
                >
                  <option value="admin">Administrador / Recursos Humanos (Acceso Total)</option>
                  <option value="employee">Empleado (Marcaje y Autoservicio)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Puesto Organizacional</label>
                <input
                  type="text"
                  placeholder="Ej. Supervisor de Planta"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
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
                  className="px-4 py-2 rounded-xl bg-[#0A3142] text-white font-bold hover:bg-[#082735] transition cursor-pointer"
                >
                  Generar Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
