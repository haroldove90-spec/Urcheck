import React, { useState } from 'react';
import { Employee, DocumentStatus, EmployeeDocument, Branch } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  X, 
  UploadCloud, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Share2,
  Key,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PasswordField } from '../../components/PasswordField';
import { ShareCredentialsModal } from '../../components/ShareCredentialsModal';
import { CenteredFeedbackModal, FeedbackData } from '../../components/CenteredFeedbackModal';
import { 
  generateSecurePassword, 
  generateUsername, 
  ShareCredentialsData, 
  ACCESS_PORTAL_URL 
} from '../../utils/credentialUtils';

interface EmployeesViewProps {
  employees: Employee[];
  branches: Branch[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees = [],
  branches = [],
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDocStatus, setSelectedDocStatus] = useState<'all' | DocumentStatus>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectingDossierEmp, setInspectingDossierEmp] = useState<Employee | null>(null);
  
  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpCode, setNewEmpCode] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState(() => generateSecurePassword(10));
  const [newEmpDept, setNewEmpDept] = useState('Operaciones');
  const [newEmpPos, setNewEmpPos] = useState('');
  const [newEmpBranch, setNewEmpBranch] = useState(branches[0]?.id || 'suc-01');
  const [newEmpShift, setNewEmpShift] = useState('Matutino (08:00 - 17:00)');
  const [newEmpRate, setNewEmpRate] = useState(160);

  // Credentials sharing modal
  const [shareCredentialsData, setShareCredentialsData] = useState<ShareCredentialsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const handleNameChange = (nameVal: string) => {
    setNewEmpName(nameVal);
    // Suggest username automatically if user hasn't typed a custom one
    setNewEmpUsername(generateUsername(nameVal, newEmpCode));
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || emp.branchId === selectedBranch;
    const matchesDoc = selectedDocStatus === 'all' || emp.dossierStatus === selectedDocStatus;
    return matchesSearch && matchesBranch && matchesDoc;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const targetBranch = branches.find(b => b.id === newEmpBranch);
    const finalUsername = newEmpUsername.trim() || generateUsername(newEmpName, newEmpCode);
    const finalPassword = newEmpPassword.trim() || generateSecurePassword(10);

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeCode: newEmpCode,
      name: newEmpName,
      email: newEmpEmail || `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@asistenciapro.com`,
      phone: newEmpPhone || '55 1234 5678',
      department: newEmpDept,
      position: newEmpPos || 'Especialista Operativo',
      branchId: newEmpBranch,
      branchName: targetBranch ? targetBranch.name : 'Corporativo Reforma',
      shift: newEmpShift,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      dossierStatus: 'pending',
      vacationDaysLeft: 12,
      hourlyRate: Number(newEmpRate) || 160,
      documents: [
        { id: `doc-1-${Date.now()}`, name: 'Contrato Individual de Trabajo Firmado', status: 'pending', required: true, notes: 'Esperando firma digital' },
        { id: `doc-2-${Date.now()}`, name: 'Identificación Oficial Vigente (INE)', status: 'complete', lastUpdated: new Date().toISOString().split('T')[0], required: true },
        { id: `doc-3-${Date.now()}`, name: 'Comprobante de Domicilio (< 3 meses)', status: 'missing', required: true, notes: 'Pendiente de entrega' },
        { id: `doc-4-${Date.now()}`, name: 'Constancia de Situación Fiscal (SAT)', status: 'pending', required: true },
        { id: `doc-5-${Date.now()}`, name: 'Alta IMSS / NSS', status: 'complete', lastUpdated: new Date().toISOString().split('T')[0], required: true },
      ],
    };

    onAddEmployee(newEmp);
    setIsAddModalOpen(false);

    // Set centered feedback
    setFeedback({
      title: '¡Colaborador Registrado con Éxito!',
      message: `El colaborador "${newEmp.name}" (${newEmp.employeeCode}) ha sido registrado y sincronizado en Supabase. ¿Deseas compartir sus credenciales por WhatsApp?`,
      type: 'success',
      actionText: 'Compartir WhatsApp',
      onAction: () => {
        setShareCredentialsData({
          name: newEmp.name,
          username: finalUsername,
          password: finalPassword,
          roleName: 'Empleado',
          branchName: targetBranch?.name || 'Sede Principal',
          phone: newEmp.phone,
          portalUrl: ACCESS_PORTAL_URL,
        });
      },
      autoCloseMs: 5000,
    });

    // Reset form
    setNewEmpName('');
    setNewEmpPos('');
    setNewEmpPhone('');
    setNewEmpEmail('');
    const nextCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewEmpCode(nextCode);
    setNewEmpUsername('');
    setNewEmpPassword(generateSecurePassword(10));
  };

  const handleUpdateDocumentStatus = (docId: string, newStatus: DocumentStatus) => {
    if (!inspectingDossierEmp) return;

    const docs = inspectingDossierEmp.documents || [];
    const updatedDocs = docs.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return d;
    });

    // recalculate overall dossier status
    const hasMissing = updatedDocs.some(d => d.required && d.status === 'missing');
    const hasPending = updatedDocs.some(d => d.required && d.status === 'pending');
    let overallStatus: DocumentStatus = 'complete';
    if (hasMissing) overallStatus = 'missing';
    else if (hasPending) overallStatus = 'pending';

    const updatedEmp: Employee = {
      ...inspectingDossierEmp,
      documents: updatedDocs,
      dossierStatus: overallStatus,
    };

    setInspectingDossierEmp(updatedEmp);
    onUpdateEmployee(updatedEmp);
  };

  const totalEmployees = employees.length;
  const completeDossiers = employees.filter(e => e.dossierStatus === 'complete').length;
  const pendingDossiers = employees.filter(e => e.dossierStatus === 'pending').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  return (
    <div id="admin-employees-view" className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            Catálogo de Personal y Expedientes Digitales
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Gestión integral de altas, bajas, expedientes laborales y contratos digitales
          </p>
        </div>

        <button
          id="btn-open-add-employee"
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#093244] hover:bg-[#082735] rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Alta de Colaborador</span>
        </button>
      </div>

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Total Colaboradores
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#093244]">{totalEmployees}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">plantilla</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1F832D] block leading-tight">
            Expedientes 100%
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#1F832D]">{completeDossiers}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">completos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Expedientes Incompletos
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{pendingDossiers}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">en revisión</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#069AD8] block leading-tight">
            Personal Activo
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#069AD8]">{activeEmployees}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">en nómina</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o área..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8] focus:border-[#069AD8]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold">Sucursal:</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="py-1.5 px-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#069AD8] text-neutral-800"
          >
            <option value="all">Todas las sedes</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 ml-1">
            <span className="font-semibold">Expediente:</span>
          </div>
          <select
            value={selectedDocStatus}
            onChange={(e) => setSelectedDocStatus(e.target.value as 'all' | DocumentStatus)}
            className="py-1.5 px-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#069AD8] text-neutral-800"
          >
            <option value="all">Todos los estatus</option>
            <option value="complete">🟢 Completos</option>
            <option value="pending">🟡 Pendientes</option>
            <option value="missing">🔴 Faltantes</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap sm:whitespace-normal">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Puesto y Área</th>
                <th className="py-3 px-4">Sede Asignada</th>
                <th className="py-3 px-4">Turno Laboral</th>
                <th className="py-3 px-4">Expediente Digital</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block leading-snug">
                              {emp.name}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {emp.employeeCode} • {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-800 block">
                          {emp.position}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {emp.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          {emp.branchName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 text-xs">
                        {emp.shift}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setInspectingDossierEmp(emp)}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer hover:shadow-2xs active:scale-95"
                          style={{
                            backgroundColor: 
                              emp.dossierStatus === 'complete' ? '#ecfdf5' :
                              emp.dossierStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                            color:
                              emp.dossierStatus === 'complete' ? '#065f46' :
                              emp.dossierStatus === 'pending' ? '#92400e' : '#991b1b',
                            borderColor:
                              emp.dossierStatus === 'complete' ? '#a7f3d0' :
                              emp.dossierStatus === 'pending' ? '#fde68a' : '#fecaca',
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="capitalize">
                            {emp.dossierStatus === 'complete' && 'Completo (5/5)'}
                            {emp.dossierStatus === 'pending' && 'Pendiente'}
                            {emp.dossierStatus === 'missing' && 'Faltante'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Activo
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setShareCredentialsData({
                              name: emp.name,
                              username: generateUsername(emp.name, emp.employeeCode),
                              password: generateSecurePassword(10),
                              roleName: 'Empleado',
                              branchName: emp.branchName,
                              phone: emp.phone,
                              portalUrl: ACCESS_PORTAL_URL,
                            });
                          }}
                          title="Compartir Credenciales por WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden xl:inline text-[11px]">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setInspectingDossierEmp(emp)}
                          title="Ver Expediente"
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-[#069AD8] hover:bg-[#069AD8]/10 transition-colors inline-flex items-center cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Dar de baja a ${emp.name}?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          title="Baja de Colaborador"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-500 text-sm">
                    No se encontraron empleados con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier / Expediente Digital Drawer / Modal */}
      {inspectingDossierEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingDossierEmp.avatar}
                  alt={inspectingDossierEmp.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#069AD8]"
                />
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    Expediente Laboral Digital: {inspectingDossierEmp.name}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    ID: {inspectingDossierEmp.employeeCode} • {inspectingDossierEmp.department} • {inspectingDossierEmp.branchName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingDossierEmp(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-xs font-semibold text-neutral-700">Cumplimiento Normativo del Expediente:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  inspectingDossierEmp.dossierStatus === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                  inspectingDossierEmp.dossierStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {inspectingDossierEmp.dossierStatus === 'complete' && 'Expediente Completo'}
                  {inspectingDossierEmp.dossierStatus === 'pending' && 'Documentación en Revisión'}
                  {inspectingDossierEmp.dossierStatus === 'missing' && 'Documentos Faltantes'}
                </span>
              </div>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {(inspectingDossierEmp.documents || []).map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900 block">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          {doc.lastUpdated && <span>Actualizado: {doc.lastUpdated}</span>}
                          {doc.notes && <span className="text-amber-600 font-medium">({doc.notes})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select
                        value={doc.status}
                        onChange={(e) => handleUpdateDocumentStatus(doc.id, e.target.value as DocumentStatus)}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer ${
                          doc.status === 'complete' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          doc.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="complete">🟢 Completo / Aprobado</option>
                        <option value="pending">🟡 Pendiente de Revisión</option>
                        <option value="missing">🔴 Faltante</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setInspectingDossierEmp(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                Alta de Nuevo Colaborador
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez Garza"
                    value={newEmpName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Código Empleado</label>
                  <input
                    type="text"
                    required
                    value={newEmpCode}
                    onChange={(e) => setNewEmpCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-neutral-50 font-mono"
                  />
                </div>
              </div>

              {/* Credenciales de Acceso al Portal / Móvil */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#093244] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#069AD8]" />
                    Credenciales para Acceso Móvil y Portal Web
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">
                    (Se compartirán por WhatsApp)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Usuario de Ingreso *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="usuario.login"
                        value={newEmpUsername}
                        onChange={(e) => setNewEmpUsername(e.target.value)}
                        className="w-full p-2 pr-8 rounded-lg border border-neutral-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setNewEmpUsername(generateUsername(newEmpName, newEmpCode))}
                        title="Regenerar usuario"
                        className="absolute right-2 top-2 text-neutral-400 hover:text-[#069AD8]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <PasswordField
                      id="input-emp-password"
                      label="Contraseña Generada"
                      value={newEmpPassword}
                      onChange={setNewEmpPassword}
                      placeholder="Contraseña segura"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Teléfono (WhatsApp) *</label>
                  <input
                    type="tel"
                    placeholder="55 0000 0000"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Puesto</label>
                  <input
                    type="text"
                    placeholder="Ej. Analista de Procesos"
                    value={newEmpPos}
                    onChange={(e) => setNewEmpPos(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Departamento</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="Operaciones">Operaciones</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Logística">Logística</option>
                    <option value="Calidad">Calidad</option>
                    <option value="Ventas">Ventas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Sucursal / Sede</label>
                  <select
                    value={newEmpBranch}
                    onChange={(e) => setNewEmpBranch(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Turno</label>
                  <select
                    value={newEmpShift}
                    onChange={(e) => setNewEmpShift(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="Matutino (08:00 - 17:00)">Matutino (08:00 - 17:00)</option>
                    <option value="Turno 1 (07:00 - 15:30)">Turno 1 (07:00 - 15:30)</option>
                    <option value="Mixto (09:00 - 18:00)">Mixto (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#093244] text-white font-bold hover:bg-[#082735] transition cursor-pointer"
                >
                  Guardar y Generar Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Credentials Modal */}
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
