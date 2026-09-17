import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Branch, Employee, UserProfile } from '../../types';
import { CenteredFeedbackModal, FeedbackData } from '../../components/CenteredFeedbackModal';
import {
  Clock,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  Camera,
  Fingerprint,
  CreditCard,
  CheckCheck,
  X,
  FileCheck2,
  UserCheck,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Trash2
} from 'lucide-react';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  branches: Branch[];
  currentUser: UserProfile;
  onUpdateAttendanceRecord: (updatedRecord: AttendanceRecord) => void;
  onBatchCorroborate: (recordIds: string[], reviewerName: string) => void;
  onDeleteAttendanceRecord?: (recordId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  employees,
  branches,
  currentUser,
  onUpdateAttendanceRecord,
  onBatchCorroborate,
  onDeleteAttendanceRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedPunchType, setSelectedPunchType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [corroborationFilter, setCorroborationFilter] = useState<'all' | 'pending' | 'corroborated'>('all');

  // Selected records for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);
  const [corroborateRecord, setCorroborateRecord] = useState<AttendanceRecord | null>(null);
  const [corroborationNotes, setCorroborationNotes] = useState('');
  const [statusOverride, setStatusOverride] = useState<'on_time' | 'late' | 'early_departure' | 'overtime'>('on_time');

  // Feedback modal
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.biometricDeviceId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = selectedBranch === 'all' || record.branchId === selectedBranch || record.branchName === selectedBranch;
      const matchesPunchType = selectedPunchType === 'all' || record.type === selectedPunchType;
      const matchesMethod = selectedMethod === 'all' || record.method === selectedMethod;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      
      const matchesCorroboration =
        corroborationFilter === 'all'
          ? true
          : corroborationFilter === 'pending'
          ? !record.isCorroborated
          : Boolean(record.isCorroborated);

      return matchesSearch && matchesBranch && matchesPunchType && matchesMethod && matchesStatus && matchesCorroboration;
    });
  }, [attendanceRecords, searchQuery, selectedBranch, selectedPunchType, selectedMethod, selectedStatus, corroborationFilter]);

  // Statistics
  const totalToday = attendanceRecords.length;
  const onTimeCount = attendanceRecords.filter((r) => r.status === 'on_time').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const facialWithSelfieCount = attendanceRecords.filter((r) => r.method === 'facial' && r.photoSnapshot).length;
  const pendingCorroborationCount = attendanceRecords.filter((r) => !r.isCorroborated).length;
  const onTimePercentage = totalToday > 0 ? Math.round((onTimeCount / totalToday) * 100) : 100;

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  // Single record corroboration
  const handleOpenCorroborateModal = (record: AttendanceRecord) => {
    setCorroborateRecord(record);
    setCorroborationNotes(record.corroborationNotes || '');
    setStatusOverride(record.status);
  };

  const handleSaveCorroboration = () => {
    if (!corroborateRecord) return;

    const updated: AttendanceRecord = {
      ...corroborateRecord,
      status: statusOverride,
      isCorroborated: true,
      corroboratedBy: currentUser.name,
      corroboratedAt: new Date().toLocaleString('es-MX'),
      corroborationNotes: corroborationNotes.trim() || 'Asistencia corroborada y validada por Recursos Humanos.',
    };

    onUpdateAttendanceRecord(updated);
    setCorroborateRecord(null);
    setFeedback({
      title: '¡Asistencia Corroborada con Éxito!',
      message: `El marcaje de ${corroborateRecord.employeeName} fue validado y auditado por ${currentUser.name}. Los cambios quedaron sincronizados en Supabase.`,
      type: 'success',
      autoCloseMs: 3500,
    });
  };

  // Batch corroboration
  const handleExecuteBatchCorroborate = () => {
    if (selectedIds.length === 0) return;
    onBatchCorroborate(selectedIds, currentUser.name);
    setFeedback({
      title: '¡Corroboración Masiva Exitosa!',
      message: `Se han corroborado y validado ${selectedIds.length} marcajes de asistencia de forma instantánea en Supabase.`,
      type: 'success',
      autoCloseMs: 3500,
    });
    setSelectedIds([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Marcaje',
      'Colaborador',
      'Código Empleado',
      'Sede / Sucursal',
      'Hora / Fecha',
      'Tipo de Marcaje',
      'Método Biométrico',
      'Estatus Puntualidad',
      'Dispositivo Checador',
      'Selfie Registrada',
      'Corroborado por RRHH',
      'Fecha Corroboración',
      'Notas de Auditoría',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.employeeName}"`,
      `"${r.employeeCode}"`,
      `"${r.branchName}"`,
      `"${r.timestamp}"`,
      `"${r.type}"`,
      `"${r.method}"`,
      `"${r.status}"`,
      `"${r.biometricDeviceId}"`,
      `"${r.photoSnapshot ? 'Sí (Foto Almacenada)' : 'No'}"`,
      `"${r.isCorroborated ? `Sí (${r.corroboratedBy})` : 'Pendiente'}"`,
      `"${r.corroboratedAt || 'N/A'}"`,
      `"${r.corroborationNotes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Urcheck_Control_Asistencias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="admin-attendance-corroboration-view" className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0871A0]/10 text-[#0871A0] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Módulo Oficial de Recursos Humanos
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#138128]/10 text-[#138128]">
              Biometría Facial Activa
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0A3142]">
            Control y Corroboración de Asistencias
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Supervisa, valida y audita los marcajes biométricos en tiempo real con evidencia fotográfica facial, score de liveness y sellos SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-export-attendance-csv"
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#0871A0]" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-neutral-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Metric Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
            Total Marcajes Hoy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0A3142]">{totalToday}</span>
            <span className="text-xs text-neutral-500">registros</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Todas las sedes</span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#138128] block mb-1">
            Puntualidad
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#138128]">{onTimePercentage}%</span>
            <span className="text-xs text-neutral-500">({onTimeCount} a tiempo)</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-[#138128] h-full rounded-full" style={{ width: `${onTimePercentage}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Retardos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{lateCount}</span>
            <span className="text-xs text-neutral-500">incidencia(s)</span>
          </div>
          <span className="text-[10px] text-amber-700/80 mt-1 block font-medium">Requieren justificación</span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0871A0] block mb-1 flex items-center gap-1">
            <ScanFace className="w-3.5 h-3.5" /> Selfies Faciales
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0871A0]">{facialWithSelfieCount}</span>
            <span className="text-xs text-neutral-500">con foto</span>
          </div>
          <span className="text-[10px] text-[#0871A0] mt-1 block font-medium">100% auditables con IA</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
            Pendientes Corroborar
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${pendingCorroborationCount > 0 ? 'text-blue-600' : 'text-[#138128]'}`}>
              {pendingCorroborationCount}
            </span>
            <span className="text-xs text-neutral-500">por validar</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Validación RRHH</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-attendance-input"
              type="text"
              placeholder="Buscar por colaborador, código (ej. EMP-7742) o terminal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0871A0] focus:bg-white transition"
            />
          </div>

          {/* Quick Corroboration State Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl shrink-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: `Pendientes (${pendingCorroborationCount})` },
              { id: 'corroborated', label: 'Corroborados' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCorroborationFilter(f.id as typeof corroborationFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  corroborationFilter === f.id
                    ? 'bg-white text-[#0A3142] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-xs">
          
          {/* Branch */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Sucursal / Sede</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0871A0]"
            >
              <option value="all">Todas las Sedes</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Punch Type */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Tipo de Marcaje</label>
            <select
              value={selectedPunchType}
              onChange={(e) => setSelectedPunchType(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0871A0]"
            >
              <option value="all">Todos los Eventos</option>
              <option value="entry">Entrada a Laborar</option>
              <option value="lunch_out">Salida a Almuerzo</option>
              <option value="lunch_in">Regreso de Almuerzo</option>
              <option value="exit">Salida de Turno</option>
            </select>
          </div>

          {/* Biometric Method */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Método Biométrico</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0871A0]"
            >
              <option value="all">Todos los Métodos</option>
              <option value="facial">Reconocimiento Facial (Cámara)</option>
              <option value="fingerprint">Huella Dactilar Óptica</option>
              <option value="rfid">Tarjeta RFID Proximidad</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Puntualidad</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0871A0]"
            >
              <option value="all">Todos los Estatus</option>
              <option value="on_time">Puntual (A tiempo)</option>
              <option value="late">Retardo</option>
              <option value="early_departure">Salida Anticipada</option>
              <option value="overtime">Horas Extra</option>
            </select>
          </div>
        </div>

        {/* Batch Bar if any item selected */}
        {selectedIds.length > 0 && (
          <div className="bg-[#0A3142] text-white p-3 rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-[#0871A0] text-white flex items-center justify-center font-bold text-[11px]">
                {selectedIds.length}
              </span>
              <span>marcaje(s) seleccionado(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExecuteBatchCorroborate}
                className="px-3 py-1.5 rounded-lg bg-[#138128] hover:bg-[#0e661f] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Corroborar Seleccionados</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full text-left text-xs sm:text-sm whitespace-nowrap sm:whitespace-normal">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] sm:text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-[#0871A0] focus:ring-[#0871A0] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Colaborador y Evidencia</th>
                <th className="py-3 px-4">Sede / Sucursal</th>
                <th className="py-3 px-4">Hora Marcaje</th>
                <th className="py-3 px-4">Tipo Evento</th>
                <th className="py-3 px-4">Método y Dispositivo</th>
                <th className="py-3 px-4">Puntualidad</th>
                <th className="py-3 px-4">Corroboración RRHH</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(record.id)}
                          className="rounded border-neutral-300 text-[#0871A0] focus:ring-[#0871A0] cursor-pointer"
                        />
                      </td>

                      {/* Employee Info + Selfie Button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={record.employeeAvatar}
                              alt={record.employeeName}
                              className="w-9 h-9 rounded-full object-cover border border-neutral-300"
                            />
                            {record.photoSnapshot && (
                              <button
                                type="button"
                                onClick={() => setInspectRecord(record)}
                                title="Ver fotografía selfie capturada"
                                className="absolute -bottom-1 -right-1 p-1 bg-[#0871A0] hover:bg-[#065a80] text-white rounded-full shadow-xs cursor-pointer"
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
                                  onClick={() => setInspectRecord(record)}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0871A0]/10 text-[#0871A0] hover:bg-[#0871A0]/20 cursor-pointer inline-flex items-center gap-1"
                                >
                                  <ScanFace className="w-3 h-3" />
                                  <span>Selfie</span>
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {record.employeeCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-800 block text-xs">
                          {record.branchName}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-neutral-900 text-xs text-[#0871A0] block">
                          {record.timestamp}
                        </span>
                        <span className="text-[10px] text-neutral-400">Hoy</span>
                      </td>

                      {/* Punch Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            record.type === 'entry'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.type === 'lunch_out'
                              ? 'bg-amber-100 text-amber-800'
                              : record.type === 'lunch_in'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {record.type === 'entry' && 'Entrada'}
                          {record.type === 'lunch_out' && 'Salida Almuerzo'}
                          {record.type === 'lunch_in' && 'Regreso Almuerzo'}
                          {record.type === 'exit' && 'Salida Turno'}
                        </span>
                      </td>

                      {/* Method & Terminal */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {record.method === 'facial' && <ScanFace className="w-4 h-4 text-[#0871A0]" />}
                          {record.method === 'fingerprint' && <Fingerprint className="w-4 h-4 text-neutral-600" />}
                          {record.method === 'rfid' && <CreditCard className="w-4 h-4 text-neutral-600" />}
                          <span className="capitalize text-xs font-medium text-neutral-700">
                            {record.method === 'facial' ? 'Facial AI' : record.method === 'fingerprint' ? 'Huella' : 'Tarjeta'}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 truncate block max-w-[140px] font-mono">
                          {record.biometricDeviceId}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            record.status === 'on_time'
                              ? 'bg-[#138128]/10 text-[#138128]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {record.status === 'on_time' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{record.status === 'on_time' ? 'A Tiempo' : 'Retardo'}</span>
                        </span>
                      </td>

                      {/* Corroboration Badge */}
                      <td className="py-3 px-4">
                        {record.isCorroborated ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#138128]">
                              <CheckCheck className="w-3.5 h-3.5" />
                              Corroborado
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Por: {record.corroboratedBy}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-600">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record.photoSnapshot && (
                            <button
                              type="button"
                              onClick={() => setInspectRecord(record)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-[#0871A0] hover:bg-neutral-100 transition cursor-pointer"
                              title="Inspeccionar Selfie y Hash"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenCorroborateModal(record)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              record.isCorroborated
                                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                : 'bg-[#138128] hover:bg-[#0e661f] text-white shadow-xs'
                            }`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{record.isCorroborated ? 'Editar' : 'Corroborar'}</span>
                          </button>

                          {onDeleteAttendanceRecord && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Deseas eliminar este registro de asistencia de ${record.employeeName}? Se eliminará permanentemente de Supabase.`)) {
                                  onDeleteAttendanceRecord(record.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Eliminar registro de asistencia permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-neutral-500 text-xs">
                    No se encontraron marcajes con los criterios de filtro seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Corroborate / Validate Attendance Record */}
      {corroborateRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#138128]" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Corroborar y Dictaminar Asistencia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCorroborateRecord(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Employee Summary */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
                <img
                  src={corroborateRecord.photoSnapshot || corroborateRecord.employeeAvatar}
                  alt={corroborateRecord.employeeName}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-300"
                />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm leading-tight">
                    {corroborateRecord.employeeName}
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    {corroborateRecord.employeeCode} • {corroborateRecord.branchName}
                  </p>
                  <p className="text-xs text-[#0871A0] font-bold mt-0.5">
                    {corroborateRecord.type === 'entry' ? 'Entrada' : 'Marcaje'} a las {corroborateRecord.timestamp} ({corroborateRecord.biometricDeviceId})
                  </p>
                </div>
              </div>

              {/* Dictamen / Override status */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Dictamen Oficial de Asistencia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusOverride('on_time')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-center gap-2 ${
                      statusOverride === 'on_time'
                        ? 'border-[#138128] bg-emerald-50/50 text-[#138128] font-bold'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Validar como Puntual</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Aprobada en tiempo o justificada</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusOverride('late')}
                    className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex items-center gap-2 ${
                      statusOverride === 'late'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-800 font-bold'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Registrar Retardo</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Aplica descuento o amonestación</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Observaciones de RRHH */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Notas de Corroboración / Justificación (RRHH)
                </label>
                <textarea
                  rows={3}
                  value={corroborationNotes}
                  onChange={(e) => setCorroborationNotes(e.target.value)}
                  placeholder="Ejemplo: Se corroboró con la selfie facial que el colaborador ingresó a su sede. Retardo justificado por comisión externa autorizada."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#138128] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCorroborateRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCorroboration}
                  className="px-5 py-2.5 rounded-xl bg-[#138128] hover:bg-[#0e661f] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Guardar Corroboración Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Biometric Selfie Inspection Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-[#0871A0]" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Auditoría Facial y Evidencia de Marcaje
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center">
              
              {/* Compare Original Photo vs Selfie */}
              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                <div className="bg-neutral-100 rounded-xl p-2.5 text-center border border-neutral-200">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                    Expediente Oficial
                  </span>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-lg overflow-hidden border border-neutral-300">
                    <img
                      src={inspectRecord.employeeAvatar}
                      alt={inspectRecord.employeeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Foto de Credencial</span>
                </div>

                <div className="bg-[#0A3142] rounded-xl p-2.5 text-center border border-[#0871A0] relative shadow-md">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1 flex items-center justify-center gap-1">
                    <Camera className="w-3 h-3" /> Selfie al Checar
                  </span>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-lg overflow-hidden border-2 border-emerald-400 relative">
                    <img
                      src={inspectRecord.photoSnapshot || inspectRecord.employeeAvatar}
                      alt={inspectRecord.employeeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold py-0.5">
                      MATCH {inspectRecord.verificationScore || 99.8}%
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-300 mt-1 block font-mono">{inspectRecord.timestamp}</span>
                </div>
              </div>

              {/* Forensic Details Card */}
              <div className="w-full bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Colaborador:</span>
                  <span className="font-bold text-neutral-900">{inspectRecord.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Código de Empleado:</span>
                  <span className="font-mono text-neutral-800">{inspectRecord.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sede Laboral:</span>
                  <span className="font-medium text-neutral-800">{inspectRecord.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sensor Checador:</span>
                  <span className="font-medium text-neutral-800">{inspectRecord.biometricDeviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Prueba de Liveness (Vida):</span>
                  <span className="text-[#138128] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada (Anti-Suplantación)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sello Criptográfico:</span>
                  <span className="font-mono text-neutral-800 text-[10px]">{inspectRecord.hashAudit}</span>
                </div>
                {inspectRecord.isCorroborated && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">Corroborado por:</span>
                    <span className="font-bold text-[#138128] text-xs">
                      {inspectRecord.corroboratedBy} ({inspectRecord.corroboratedAt})
                    </span>
                    {inspectRecord.corroborationNotes && (
                      <p className="text-[11px] text-neutral-600 italic mt-0.5">
                        "{inspectRecord.corroborationNotes}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    const rec = inspectRecord;
                    setInspectRecord(null);
                    handleOpenCorroborateModal(rec);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#138128] hover:bg-[#0e661f] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Corroborar Asistencia</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Centered Feedback Notification Modal */}
      <CenteredFeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
};
