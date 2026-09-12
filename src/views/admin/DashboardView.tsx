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
  Search
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  branches: Branch[];
  attendanceRecords: AttendanceRecord[];
  onAddSimulatedPunch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  branches,
  attendanceRecords,
  onAddSimulatedPunch,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Hace unos segundos');

  const totalEmployees = employees.length;
  // Calculate attendance metrics
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
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 border border-neutral-800">
            <Activity className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                Monitoreo Biométrico en Tiempo Real
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                4 TERMINALES CONECTADAS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Sincronización instantánea con nube ZKTeco BioCloud Protocol • Último ping: {lastSyncTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-simulate-punch"
            onClick={onAddSimulatedPunch}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-red-600 ${isSyncing ? 'animate-spin' : ''}`} />
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
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-neutral-900">
              {attendanceRate}%
            </span>
            <span className="text-xs font-medium text-emerald-600 inline-flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% vs ayer
            </span>
          </div>
          <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-500" 
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-neutral-900">
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
            <span className="text-3xl sm:text-4xl font-black text-neutral-900">
              {absentCount}
            </span>
            <span className="text-xs text-neutral-600 block mt-1">
              Colaboradores sin registro
            </span>
          </div>
        </div>
      </div>

      {/* Biometric Devices Status Overview */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
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
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-red-300 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">{branch.name}</h4>
                  <p className="text-[11px] text-neutral-500">{branch.city}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
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
                  <span className="font-bold text-red-600 text-[11px]">{branch.employeeCount} colaboradores</span>
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
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-red-600" />
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
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-neutral-700 cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="entry">Entradas</option>
              <option value="lunch_out">Salida a Almorzar</option>
              <option value="lunch_in">Regreso de Almuerzo</option>
              <option value="exit">Salida de Turno</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
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
                  const isEntry = record.type === 'entry';
                  const isLate = record.status === 'late';

                  return (
                    <tr key={record.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={record.employeeAvatar}
                            alt={record.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-300"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block leading-tight">
                              {record.employeeName}
                            </span>
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
                          record.type === 'entry' ? 'bg-emerald-100 text-emerald-800' :
                          record.type === 'lunch_out' ? 'bg-amber-100 text-amber-800' :
                          record.type === 'lunch_in' ? 'bg-blue-100 text-blue-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {record.type === 'entry' && '🟢 Entrada'}
                          {record.type === 'lunch_out' && '🟡 Salida Almuerzo'}
                          {record.type === 'lunch_in' && '🔵 Regreso Almuerzo'}
                          {record.type === 'exit' && '🔴 Salida Turno'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          {record.method === 'facial' && <ScanFace className="w-4 h-4 text-red-600" />}
                          {record.method === 'fingerprint' && <Fingerprint className="w-4 h-4 text-red-600" />}
                          {record.method === 'rfid' && <CreditCard className="w-4 h-4 text-red-600" />}
                          <span className="capitalize text-xs">{record.method}</span>
                          {record.verificationScore && (
                            <span className="text-[10px] text-neutral-600 bg-neutral-100 px-1 rounded font-mono">
                              {record.verificationScore}%
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isLate
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLate ? 'Retardo (+18 min)' : 'A Tiempo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[11px] text-neutral-500">
                        {record.hashAudit}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 text-xs">
                    No se encontraron registros de marcaje con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
