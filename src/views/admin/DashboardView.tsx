import React, { useState } from 'react';
import { AttendanceRecord, Branch, Employee } from '../../types';
import { 
  Users, 
  CheckCircle2, 
  ClockAlert, 
  UserX, 
  Activity, 
  Fingerprint, 
  ScanFace, 
  CreditCard,
  Building2,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Camera,
  Eye,
  X
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  branches: Branch[];
  attendanceRecords: AttendanceRecord[];
  onAddSimulatedPunch: () => void;
  onNavigateToAttendance?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  branches,
  attendanceRecords,
  onAddSimulatedPunch,
  onNavigateToAttendance,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Hace unos segundos');
  const [selectedRecordForSelfie, setSelectedRecordForSelfie] = useState<AttendanceRecord | null>(null);

  const totalEmployees = employees.length;
  const uniqueAttendees = new Set(attendanceRecords.map(r => r.employeeId)).size;
  const attendanceRate = totalEmployees > 0 ? Math.round((uniqueAttendees / totalEmployees) * 100) : 0;
  
  const lateRecords = attendanceRecords.filter(r => r.status === 'late');
  const onTimeRecords = attendanceRecords.filter(r => r.status === 'on_time');
  const absentCount = Math.max(0, totalEmployees - uniqueAttendees);

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesFilter = filterType === 'all' || record.type === filterType;
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Recién actualizado');
    }, 1200);
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6">
      
      {/* Top Banner with Biometric Hardware Connection & Quick Sync */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0A3142] text-white flex items-center justify-center shrink-0 border border-[#082735]">
            <Activity className="w-6 h-6 text-[#0871A0]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-[#0A3142]">
                Monitoreo Global en Tiempo Real
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#138128]/10 text-[#138128] border border-[#138128]/30">
                <span className="w-2 h-2 rounded-full bg-[#138128] animate-pulse" />
                4 TERMINALES CONECTADAS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Urcheck Biometric Cloud Protocol • Último ping de hardware: {lastSyncTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-simulate-punch"
            onClick={onAddSimulatedPunch}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white shadow-xs transition cursor-pointer"
            title="Simular marcaje en vivo para probar reactividad"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Simular Marcaje en Vivo</span>
          </button>

          <button
            id="btn-force-sync"
            onClick={handleManualSync}
            disabled={isSyncing}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#0871A0] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Asistencia del Día */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              % Asistencia Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0871A0]/10 text-[#0871A0] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0A3142]">
              {attendanceRate}%
            </span>
            <span className="text-xs font-medium text-[#138128] inline-flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% hoy
            </span>
          </div>
          <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#0871A0] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${attendanceRate}%` }} 
            />
          </div>
          <span className="text-[11px] text-neutral-600 mt-2 block">
            {uniqueAttendees} de {totalEmployees} colaboradores activos
          </span>
        </div>

        {/* Marcajes a Tiempo */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              A Tiempo
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#138128]/10 text-[#138128] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#138128]">
              {onTimeRecords.length}
            </span>
            <span className="text-xs text-neutral-600 block mt-1">
              Puntualidad en marco legal
            </span>
          </div>
        </div>

        {/* Retardos Detectados */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Retardos
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-600">
              {lateRecords.length}
            </span>
            <span className="text-xs text-neutral-600 block mt-1">
              Fuera de tolerancia (10 min)
            </span>
          </div>
        </div>

        {/* Ausencias Sin Marcaje */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Sin Registro / Ausente
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-neutral-800">
              {absentCount}
            </span>
            <span className="text-xs text-neutral-600 block mt-1">
              Colaboradores pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Biometric Devices Status Overview */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0A3142] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0871A0]" />
            Estatus de Sucursales y Checadores Biométricos
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            4 Sedes operando
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {branches.map(branch => (
            <div 
              key={branch.id} 
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-[#0871A0]/40 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[#0A3142] text-sm">{branch.name}</h4>
                  <p className="text-[11px] text-neutral-500">{branch.city}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#138128] ring-4 ring-[#138128]/20 animate-pulse" />
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-200/80 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span className="text-[11px]">Dispositivo:</span>
                  <span className="font-semibold text-neutral-800 text-[11px] truncate max-w-[120px]">{branch.biometricDeviceName}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-[11px]">IP / Puerto:</span>
                  <span className="font-mono text-[11px] font-semibold text-neutral-700">{branch.biometricIp}:4370</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-[11px]">Personal:</span>
                  <span className="font-bold text-[#0871A0] text-[11px]">{branch.employeeCount} colaboradores</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Live Audit Feed of Punches */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0A3142] flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#0871A0]" />
              Evidencia en Tiempo Real e Historial Trazable
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Registro cronológico inmutable auditable para cumplimiento normativo laboral
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar empleado o sede..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0871A0] focus:border-[#0871A0] w-44 sm:w-56"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0871A0] text-neutral-700 cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="entry">Entradas</option>
              <option value="lunch_out">Salida a Almorzar</option>
              <option value="lunch_in">Regreso de Almuerzo</option>
              <option value="exit">Salida de Turno</option>
            </select>

            {onNavigateToAttendance && (
              <button
                type="button"
                onClick={onNavigateToAttendance}
                className="py-1.5 px-3 rounded-xl bg-[#0871A0] hover:bg-[#065a80] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Auditar y Corroborar Todo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#0A3142]/5 text-[#0A3142] font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Hora Servidor</th>
                <th className="py-3 px-4">Tipo Marcaje</th>
                <th className="py-3 px-4">Hardware Biométrico</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-4 text-right">Folio Trazable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  return (
                    <tr key={record.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={record.employeeAvatar}
                              alt={record.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-300"
                            />
                            {record.photoSnapshot && (
                              <button
                                type="button"
                                onClick={() => setSelectedRecordForSelfie(record)}
                                title="Ver foto selfie tomada en el marcaje"
                                className="absolute -bottom-1 -right-1 p-0.5 bg-[#0871A0] hover:bg-[#065a80] text-white rounded-full shadow-xs cursor-pointer"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 block leading-tight">
                                {record.employeeName}
                              </span>
                              {record.photoSnapshot && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedRecordForSelfie(record)}
                                  className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0871A0]/10 text-[#0871A0] hover:bg-[#0871A0]/20 cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <Camera className="w-2.5 h-2.5" /> Selfie
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {record.employeeCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-700">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          {record.branchName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                        {record.timestamp}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          record.type === 'entry' ? 'bg-[#138128]/10 text-[#138128]' :
                          record.type === 'lunch_out' ? 'bg-amber-100 text-amber-800' :
                          record.type === 'lunch_in' ? 'bg-[#0871A0]/10 text-[#0871A0]' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {record.type === 'entry' && 'Entrada'}
                          {record.type === 'lunch_out' && 'Salida Almuerzo'}
                          {record.type === 'lunch_in' && 'Regreso Almuerzo'}
                          {record.type === 'exit' && 'Salida Fin Turno'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          {record.method === 'facial' && <ScanFace className="w-3.5 h-3.5 text-[#0871A0]" />}
                          {record.method === 'fingerprint' && <Fingerprint className="w-3.5 h-3.5 text-[#0871A0]" />}
                          {record.method === 'rfid' && <CreditCard className="w-3.5 h-3.5 text-[#0871A0]" />}
                          <span className="text-xs truncate max-w-[130px]">{record.biometricDeviceId}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {record.status === 'on_time' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#138128]/10 text-[#138128]">
                            <CheckCircle2 className="w-3 h-3" />
                            A tiempo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <ClockAlert className="w-3 h-3" />
                            Retardo
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono text-[10px] text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                          {record.hashAudit}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No se encontraron marcajes con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Auditoría de Selfie para Administradores / RRHH */}
      {selectedRecordForSelfie && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-[#0871A0]" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Evidencia Fotográfica de Marcaje
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForSelfie(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-lg relative bg-neutral-900">
                <img
                  src={selectedRecordForSelfie.photoSnapshot || selectedRecordForSelfie.employeeAvatar}
                  alt={selectedRecordForSelfie.employeeName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                  IA MATCH: {selectedRecordForSelfie.verificationScore || 99.8}%
                </div>
                <div className="absolute bottom-2 inset-x-2 bg-black/75 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-white text-center">
                  {selectedRecordForSelfie.timestamp} • {selectedRecordForSelfie.branchName}
                </div>
              </div>

              <div className="mt-4 w-full bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Colaborador:</span>
                  <span className="font-bold text-neutral-900">{selectedRecordForSelfie.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Código de Empleado:</span>
                  <span className="font-mono text-neutral-800">{selectedRecordForSelfie.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Terminal Checadora:</span>
                  <span className="text-neutral-800 font-medium">{selectedRecordForSelfie.biometricDeviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dictamen Biométrico:</span>
                  <span className="text-[#138128] font-bold">Rostro Reconocido (Liveness OK)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hash Criptográfico:</span>
                  <span className="font-mono text-neutral-800 text-[10px]">{selectedRecordForSelfie.hashAudit}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecordForSelfie(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#0A3142] text-white font-bold text-xs hover:bg-[#082735] transition cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
