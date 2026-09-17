import React, { useState } from 'react';
import { AttendanceRecord, Branch, Employee } from '../../types';
import { 
  FileBarChart, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Building2, 
  CheckCircle2, 
  FileSpreadsheet,
  ShieldCheck,
  Search
} from 'lucide-react';

interface ReportsViewProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  branches: Branch[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  attendanceRecords,
  employees,
  branches,
}) => {
  const [reportType, setReportType] = useState<'asistencia' | 'incidencias' | 'expedientes' | 'nomina'>('asistencia');
  const [dateRange, setDateRange] = useState('mes_actual');
  const [branchFilter, setBranchFilter] = useState('all');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Generate downloadable CSV
  const handleExportCSV = () => {
    let headers = ['ID', 'Codigo', 'Colaborador', 'Sucursal', 'Hora_Servidor', 'Tipo', 'Metodo', 'Estatus', 'Folio_Audit'];
    let rows = attendanceRecords.map(r => [
      r.id,
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.branchName}"`,
      r.timestamp,
      r.type,
      r.method,
      r.status,
      r.hashAudit,
    ]);

    if (reportType === 'expedientes') {
      headers = ['Codigo', 'Colaborador', 'Departamento', 'Sucursal', 'Estatus_Expediente', 'Docs_Completos'];
      rows = employees.map(e => [
        e.employeeCode,
        `"${e.name}"`,
        `"${e.department}"`,
        `"${e.branchName}"`,
        e.dossierStatus,
        e.documents.filter(d => d.status === 'complete').length.toString(),
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Urcheck_Reporte_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage(`Reporte de ${reportType.toUpperCase()} descargado exitosamente.`);
    setTimeout(() => setExportMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="admin-reports-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-[#0871A0]" />
            Reportes Automáticos y Cumplimiento Legal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Generación y descarga de métricas e historiales automáticos para auditoría y nómina
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Informe</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#138128]" />
          {exportMessage}
        </div>
      )}

      {/* Report Configuration & Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Tipo de Reporte Oficial
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white font-medium text-neutral-900 focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="asistencia">Reporte de Asistencia y Puntualidad Diaria</option>
            <option value="incidencias">Historial Trazable de Incidencias y Retardos</option>
            <option value="expedientes">Cumplimiento de Expedientes y Contratos</option>
            <option value="nomina">Resumen de Horas Extras para Dispersión de Nómina</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Periodo de Auditoría
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white font-medium text-neutral-900 focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="hoy">Jornada de Hoy en Tiempo Real</option>
            <option value="semana">Semana Laboral Actual</option>
            <option value="quincena">Quincena en Curso (Nómina)</option>
            <option value="mes_actual">Mes Calendario Vigente</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Filtrar por Sucursal
          </label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white font-medium text-neutral-900 focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="all">Todas las Sedes y Áreas</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Audit Report Preview Sheet */}
      <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-neutral-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#0A3142] text-white font-black text-xs tracking-wider">
                URCHECK OFICIAL
              </span>
              <h3 className="text-lg font-black text-[#0A3142] uppercase">
                Dictamen Oficial de Asistencia y Cumplimiento
              </h3>
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Folio de Auditoría: AUD-2026-0912-URC4 • Urcheck BioCloud Sincronización SHA-256
            </p>
          </div>

          <div className="text-right text-xs text-neutral-600">
            <span className="block font-bold text-neutral-900">Grupo Industrial Mexicano</span>
            <span className="block font-mono">RFC: GIT980415-K44</span>
            <span className="block text-[11px] text-neutral-500">Fecha de Emisión: 12/09/2026</span>
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-neutral-200 text-xs">
          <div>
            <span className="text-neutral-500 font-semibold block">Total Registros Auditados</span>
            <span className="text-xl font-bold text-neutral-900">{attendanceRecords.length} marcajes</span>
          </div>
          <div>
            <span className="text-neutral-500 font-semibold block">Índice de Puntualidad</span>
            <span className="text-xl font-bold text-[#138128]">92.8%</span>
          </div>
          <div>
            <span className="text-neutral-500 font-semibold block">Tolerancia Aplicada</span>
            <span className="text-xl font-bold text-neutral-900">10 Minutos</span>
          </div>
          <div>
            <span className="text-neutral-500 font-semibold block">Validador Oficial</span>
            <span className="text-xl font-bold text-[#0871A0]">Fernanda Soto</span>
          </div>
        </div>

        {/* Report Sample Data */}
        <div className="mt-5 overflow-x-auto w-full">
          <table className="min-w-full w-full text-left text-xs whitespace-nowrap sm:whitespace-normal">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px] border-b border-neutral-300">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3">Sede</th>
                <th className="py-2.5 px-3">Hora Registrada</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Biometría</th>
                <th className="py-2.5 px-3">Dictamen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium">
              {attendanceRecords.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td className="py-2 px-3 font-mono text-neutral-600">{r.employeeCode}</td>
                  <td className="py-2 px-3 font-bold text-neutral-900">{r.employeeName}</td>
                  <td className="py-2 px-3 text-neutral-700">{r.branchName}</td>
                  <td className="py-2 px-3 font-mono font-bold">{r.timestamp}</td>
                  <td className="py-2 px-3 capitalize">{r.type}</td>
                  <td className="py-2 px-3 capitalize text-neutral-600">{r.method}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'on_time' ? 'bg-[#138128]/10 text-[#138128]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status === 'on_time' ? 'Válido en Tiempo' : 'Retardo Registrado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Stamp & Sign Block */}
        <div className="mt-8 pt-6 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#138128]" />
            <span>Documento certificado para inspecciones de la Secretaría del Trabajo (STPS) y Nómina.</span>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l sm:pl-4 border-neutral-300 pt-2 sm:pt-0">
            <div className="w-44 border-b border-neutral-400 mb-1 mx-auto sm:ml-auto" />
            <span className="font-bold text-neutral-800 block">Lic. Fernanda Soto Vargas</span>
            <span className="text-[10px]">Directora de Recursos Humanos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
