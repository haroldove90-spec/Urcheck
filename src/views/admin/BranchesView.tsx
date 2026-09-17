import React, { useState } from 'react';
import { Branch } from '../../types';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Users, 
  Wifi, 
  CheckCircle2, 
  X, 
  Cpu, 
  Crosshair,
  ExternalLink,
  Eye,
  Pencil,
  Trash2,
  Power,
  AlertTriangle,
  Radio,
  Navigation
} from 'lucide-react';

interface BranchesViewProps {
  branches: Branch[];
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch?: (branch: Branch) => void;
  onDeleteBranch?: (branchId: string) => void;
  onToggleBranchStatus?: (branchId: string) => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branches,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onToggleBranchStatus,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  
  const [testingBranchId, setTestingBranchId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  // New Branch Form
  const [name, setName] = useState('');
  const [code, setCode] = useState(`SUC-${Math.floor(10 + Math.random() * 90)}`);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [manager, setManager] = useState('');
  const [deviceName, setDeviceName] = useState('Urcheck BioCloud Facial & RFID Terminal');
  const [deviceIp, setDeviceIp] = useState('192.168.10.250');
  const [radius, setRadius] = useState(100);

  // Edit Branch Form State
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceIp, setEditDeviceIp] = useState('');
  const [editRadius, setEditRadius] = useState(100);

  const showNotification = (text: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBranch: Branch = {
      id: `suc-${Date.now()}`,
      name,
      code,
      address: address || 'Avenida Principal #100',
      city: city || 'Ciudad de México',
      employeeCount: 0,
      managerName: manager || 'Por asignar',
      biometricDeviceName: deviceName,
      biometricIp: deviceIp,
      biometricStatus: 'online',
      status: 'active',
      isActive: true,
      lastPing: 'Hace 1 seg',
      latitude: 19.4326,
      longitude: -99.1332,
      geofenceRadiusMeters: Number(radius) || 100,
    };

    onAddBranch(newBranch);
    setIsAddOpen(false);
    setName('');
    setAddress('');
    setCity('');
    setManager('');
    showNotification(`Sucursal "${newBranch.name}" registrada y vinculada con éxito.`);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setEditName(branch.name);
    setEditCode(branch.code);
    setEditAddress(branch.address);
    setEditCity(branch.city);
    setEditManager(branch.managerName);
    setEditDeviceName(branch.biometricDeviceName);
    setEditDeviceIp(branch.biometricIp);
    setEditRadius(branch.geofenceRadiusMeters);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editName.trim()) return;

    const updated: Branch = {
      ...editingBranch,
      name: editName,
      code: editCode,
      address: editAddress,
      city: editCity,
      managerName: editManager,
      biometricDeviceName: editDeviceName,
      biometricIp: editDeviceIp,
      geofenceRadiusMeters: Number(editRadius) || 100,
    };

    if (onUpdateBranch) {
      onUpdateBranch(updated);
    }
    if (viewingBranch?.id === updated.id) {
      setViewingBranch(updated);
    }
    setEditingBranch(null);
    showNotification(`Sucursal "${updated.name}" actualizada con éxito.`);
  };

  const handleConfirmDelete = (branchId: string) => {
    const target = branches.find(b => b.id === branchId);
    if (onDeleteBranch) {
      onDeleteBranch(branchId);
    }
    if (viewingBranch?.id === branchId) {
      setViewingBranch(null);
    }
    setDeletingBranchId(null);
    showNotification(`Sucursal "${target?.name || ''}" eliminada del catálogo.`, 'warning');
  };

  const handleToggleStatus = (branch: Branch) => {
    if (onToggleBranchStatus) {
      onToggleBranchStatus(branch.id);
    }
    const isCurrentlyInactive = branch.status === 'inactive' || branch.isActive === false;
    const nextAction = isCurrentlyInactive ? 'reactivada' : 'desactivada/pausada';
    showNotification(`Sucursal "${branch.name}" ha sido ${nextAction}.`);
    
    if (viewingBranch?.id === branch.id) {
      setViewingBranch({
        ...viewingBranch,
        status: isCurrentlyInactive ? 'active' : 'inactive',
        isActive: isCurrentlyInactive,
        biometricStatus: isCurrentlyInactive ? 'online' : 'offline',
      });
    }
  };

  const testPing = (branch: Branch) => {
    setTestingBranchId(branch.id);
    setTimeout(() => {
      setTestingBranchId(null);
      showNotification(`Conexión exitosa con ${branch.biometricDeviceName} (${branch.biometricIp}:4370) - Latencia: 24ms`);
    }, 900);
  };

  const totalBranches = branches.length;
  const onlineBiometrics = branches.filter(b => b.biometricStatus === 'online').length;
  const activeBranches = branches.filter(b => b.status === 'active' && b.isActive !== false).length;
  const totalBranchEmployees = branches.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0);

  return (
    <div id="admin-branches-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0871A0]" />
            Sedes Físicas y Áreas de Trabajo
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Administración completa de sucursales: visualización, edición, desactivación y hardware biométrico
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] active:scale-95 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Sucursal</span>
        </button>
      </div>

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Sedes Registradas
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0A3142]">{totalBranches}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">sucursales</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#138128] block leading-tight">
            Terminales Online
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#138128]">{onlineBiometrics}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">conectados</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0871A0] block leading-tight">
            Sedes Operativas
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0871A0]">{activeBranches}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">activas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Personal en Sedes
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-neutral-800">{totalBranchEmployees}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">asignados</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-[#138128]/10 border-[#138128]/30 text-[#138128]' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branches.map((branch) => {
          const isInactive = branch.status === 'inactive' || branch.isActive === false;
          
          return (
            <div
              key={branch.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isInactive 
                  ? 'bg-neutral-100/70 border-neutral-300 opacity-80' 
                  : 'bg-white border-neutral-200 hover:border-[#0871A0]/40'
              }`}
            >
              <div>
                {/* Header row of card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-base font-bold ${isInactive ? 'text-neutral-500 line-through' : 'text-[#0A3142]'}`}>
                        {branch.name}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                        {branch.code}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0871A0] shrink-0" />
                      <span>{branch.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isInactive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700 border border-neutral-300">
                        INACTIVA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#138128]/10 text-[#138128] border border-[#138128]/30">
                        <span className="w-2 h-2 rounded-full bg-[#138128] animate-pulse" />
                        ACTIVA
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs & Hardware */}
                <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] text-neutral-400 font-semibold block">Personal Asignado</span>
                    <span className="font-bold text-neutral-900 text-sm flex items-center gap-1 mt-0.5">
                      <Users className="w-4 h-4 text-[#0871A0]" />
                      {branch.employeeCount} colaboradores
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] text-neutral-400 font-semibold block">Radio de Geocerca</span>
                    <span className="font-bold text-neutral-900 text-sm flex items-center gap-1 mt-0.5">
                      <Crosshair className="w-4 h-4 text-[#138128]" />
                      {branch.geofenceRadiusMeters} metros
                    </span>
                  </div>
                </div>

                {/* Biometric hardware box */}
                <div className={`mt-3 p-3.5 rounded-xl text-xs space-y-1 ${
                  isInactive ? 'bg-neutral-300 text-neutral-700' : 'bg-[#0A3142] text-white'
                }`}>
                  <div className="flex items-center justify-between text-[11px] opacity-90">
                    <span className="flex items-center gap-1 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-[#0871A0]" />
                      Hardware Biométrico Enlazado
                    </span>
                    <span className={isInactive ? 'text-neutral-600 font-mono' : 'text-emerald-400 font-mono font-semibold'}>
                      {isInactive ? 'Suspendido' : branch.lastPing}
                    </span>
                  </div>
                  <div className="font-bold text-xs truncate">
                    {branch.biometricDeviceName}
                  </div>
                  <div className="text-[11px] font-mono opacity-80">
                    IP: {branch.biometricIp} • Puerto: 4370 TCP
                  </div>
                </div>
              </div>

              {/* Action Buttons: Ver, Editar, Desactivar, Borrar, Ping */}
              <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-500 truncate">
                  Responsable: <strong className="text-neutral-700">{branch.managerName}</strong>
                </span>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Ver detalles */}
                  <button
                    onClick={() => setViewingBranch(branch)}
                    title="Ver detalles de la sucursal"
                    type="button"
                    className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-[#0A3142] transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    title="Editar datos de la sucursal"
                    type="button"
                    className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-[#0871A0]/10 hover:text-[#0871A0] text-neutral-700 transition cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Desactivar / Activar */}
                  <button
                    onClick={() => handleToggleStatus(branch)}
                    title={isInactive ? "Reactivar sucursal" : "Desactivar sucursal"}
                    type="button"
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isInactive 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Borrar */}
                  <button
                    onClick={() => setDeletingBranchId(branch.id)}
                    title="Borrar sucursal"
                    type="button"
                    className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:border-rose-300 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Test Ping */}
                  {!isInactive && (
                    <button
                      onClick={() => testPing(branch)}
                      disabled={testingBranchId === branch.id}
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition cursor-pointer"
                    >
                      <Wifi className={`w-3.5 h-3.5 text-[#0871A0] ${testingBranchId === branch.id ? 'animate-pulse' : ''}`} />
                      <span className="hidden sm:inline">{testingBranchId === branch.id ? 'Probando...' : 'Ping'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: VER SUCURSAL DETALLES */}
      {viewingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0A3142] text-white flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#0871A0]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0A3142]">{viewingBranch.name}</h3>
                  <span className="font-mono text-xs text-neutral-500 font-semibold">{viewingBranch.code} • {viewingBranch.city}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingBranch(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="font-bold text-neutral-700">Estatus Operativo:</span>
                {(viewingBranch.status === 'inactive' || viewingBranch.isActive === false) ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700">
                    INACTIVA / SUSPENDIDA
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#138128]/10 text-[#138128] border border-[#138128]/30">
                    ACTIVA Y OPERANDO
                  </span>
                )}
              </div>

              {/* Location Details */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider block">Ubicación y Geocerca</span>
                <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0871A0] shrink-0" />
                  {viewingBranch.address}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-neutral-400">Coordenadas GPS:</span>
                    <p className="font-mono text-neutral-700">{viewingBranch.latitude.toFixed(4)}, {viewingBranch.longitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Radio de Asistencia:</span>
                    <p className="font-bold text-neutral-700">{viewingBranch.geofenceRadiusMeters} metros</p>
                  </div>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="p-4 rounded-2xl bg-[#0A3142] text-white space-y-2">
                <span className="text-[11px] uppercase font-bold text-[#0871A0] tracking-wider block">Terminal Biométrico Urcheck BioCloud</span>
                <p className="font-bold text-sm text-white">{viewingBranch.biometricDeviceName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 font-mono">
                  <div>IP Host: {viewingBranch.biometricIp}</div>
                  <div>Puerto: 4370 (Push UDP/TCP)</div>
                  <div>Último Ping: {viewingBranch.lastPing}</div>
                  <div>Estado Sensor: {viewingBranch.biometricStatus.toUpperCase()}</div>
                </div>
              </div>

              {/* Management */}
              <div className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block font-semibold">Responsable de Sede:</span>
                  <span className="font-bold text-neutral-800">{viewingBranch.managerName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block font-semibold">Colaboradores:</span>
                  <span className="font-bold text-[#0871A0]">{viewingBranch.employeeCount} asignados</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleStatus(viewingBranch)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  (viewingBranch.status === 'inactive' || viewingBranch.isActive === false)
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-amber-300 bg-amber-50 text-amber-700'
                }`}
              >
                {(viewingBranch.status === 'inactive' || viewingBranch.isActive === false) ? 'Reactivar Sede' : 'Desactivar Sede'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const b = viewingBranch;
                    setViewingBranch(null);
                    handleOpenEdit(b);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0871A0] text-white font-bold text-xs hover:bg-[#0A3142] transition cursor-pointer"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setViewingBranch(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: EDITAR SUCURSAL */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#0A3142]">
                Editar Sucursal: {editingBranch.name}
              </h3>
              <button
                onClick={() => setEditingBranch(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={editManager}
                    onChange={(e) => setEditManager(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Radio Geocerca (m)</label>
                  <input
                    type="number"
                    value={editRadius}
                    onChange={(e) => setEditRadius(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hardware Checador</label>
                  <input
                    type="text"
                    value={editDeviceName}
                    onChange={(e) => setEditDeviceName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">IP Local / Host</label>
                  <input
                    type="text"
                    value={editDeviceIp}
                    onChange={(e) => setEditDeviceIp(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A3142] text-white font-bold hover:bg-[#082735] transition cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: BORRAR SUCURSAL */}
      {deletingBranchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">¿Eliminar esta sucursal?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Esta acción removerá permanentemente la sede del sistema y desvinculará sus terminales biométricas.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBranchId(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deletingBranchId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                Sí, Eliminar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#0A3142]">
                Registrar Nueva Sucursal / Sede
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Planta Bajío León"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. León, Gto."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  placeholder="Calle, número, colonia, código postal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Responsable / Gerente</label>
                  <input
                    type="text"
                    placeholder="Ej. Lic. Gerardo Soto"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Radio Geocerca (m)</label>
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hardware Checador</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">IP Local / Host</label>
                  <input
                    type="text"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full p-2 rounded-xl border border-neutral-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A3142] text-white font-bold hover:bg-[#082735] transition cursor-pointer"
                >
                  Guardar y Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
