import React, { useState } from 'react';
import { Branch } from '../../types';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Activity, 
  Users, 
  Wifi, 
  CheckCircle2, 
  X, 
  Cpu, 
  Crosshair,
  ExternalLink
} from 'lucide-react';

interface BranchesViewProps {
  branches: Branch[];
  onAddBranch: (branch: Branch) => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branches,
  onAddBranch,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [testingBranchId, setTestingBranchId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // New Branch Form
  const [name, setName] = useState('');
  const [code, setCode] = useState(`SUC-${Math.floor(10 + Math.random() * 90)}`);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [manager, setManager] = useState('');
  const [deviceName, setDeviceName] = useState('ZKTeco BioTime 8.5 Facial/Dactilar');
  const [deviceIp, setDeviceIp] = useState('192.168.10.250');
  const [radius, setRadius] = useState(100);

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
  };

  const testPing = (branch: Branch) => {
    setTestingBranchId(branch.id);
    setTestResult(null);
    setTimeout(() => {
      setTestingBranchId(null);
      setTestResult(`Conexión exitosa con ${branch.biometricDeviceName} (${branch.biometricIp}:4370) - Latencia: 28ms`);
      setTimeout(() => setTestResult(null), 4000);
    }, 1000);
  };

  return (
    <div id="admin-branches-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Sedes Físicas y Áreas de Trabajo
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Administración de ubicaciones, geocercas y hardware de control biométrico enlazado
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Sucursal</span>
        </button>
      </div>

      {testResult && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {testResult}
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">{branch.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                      {branch.code}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {branch.address}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {branch.biometricStatus.toUpperCase()}
                </span>
              </div>

              {/* Specs & Hardware */}
              <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[11px] text-neutral-400 font-semibold block">Personal Asignado</span>
                  <span className="font-bold text-neutral-900 text-sm flex items-center gap-1 mt-0.5">
                    <Users className="w-4 h-4 text-red-600" />
                    {branch.employeeCount} colaboradores
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[11px] text-neutral-400 font-semibold block">Radio de Geocerca</span>
                  <span className="font-bold text-neutral-900 text-sm flex items-center gap-1 mt-0.5">
                    <Crosshair className="w-4 h-4 text-blue-600" />
                    {branch.geofenceRadiusMeters} metros
                  </span>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-neutral-900 text-white text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-red-500" />
                    Hardware Biométrico Enlazado
                  </span>
                  <span className="text-emerald-400 font-mono">{branch.lastPing}</span>
                </div>
                <div className="font-bold text-neutral-100 text-xs truncate">
                  {branch.biometricDeviceName}
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  IP: {branch.biometricIp} • Puerto: 4370 TCP
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Responsable: <strong>{branch.managerName}</strong>
              </span>

              <button
                onClick={() => testPing(branch)}
                disabled={testingBranchId === branch.id}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 hover:bg-neutral-50 text-neutral-800 transition cursor-pointer"
              >
                <Wifi className={`w-3.5 h-3.5 text-red-600 ${testingBranchId === branch.id ? 'animate-pulse' : ''}`} />
                <span>{testingBranchId === branch.id ? 'Probando...' : 'Test de Ping'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                Registrar Nueva Sucursal / Sede
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Planta Bajío León"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 bg-neutral-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. León, Gto."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                  className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hardware Checador</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">IP Local / Host</label>
                  <input
                    type="text"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
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
