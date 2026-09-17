import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, OvertimeRecord, PayrollRecord } from '../../types';
import { 
  DollarSign, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Users,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface PayrollViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  overtimeRecords: OvertimeRecord[];
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  attendanceRecords,
  overtimeRecords,
}) => {
  const [period, setPeriod] = useState<'1q_sep' | '2q_sep' | 'month_aug'>('1q_sep');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDispersed, setIsDispersed] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Departments list for filter
  const departments = useMemo(() => {
    const deps = new Set(employees.map(e => e.department));
    return Array.from(deps);
  }, [employees]);

  // Generate real calculated payroll records
  const payrollRecords: PayrollRecord[] = useMemo(() => {
    const expectedDaysInPeriod = period === 'month_aug' ? 30 : 15;

    return employees.map((emp) => {
      // Calculate daily and hourly rate (based on 30 days standard)
      const hourlyRate = emp.hourlyRate || 180;
      const dailyRate = Math.round(hourlyRate * 8);

      // Overtime for this employee
      const empOvt = overtimeRecords.filter(o => o.employeeId === emp.id && o.status === 'approved');
      const totalOvtHours = empOvt.reduce((acc, curr) => acc + curr.totalHours, 0);
      const totalOvtPay = empOvt.reduce((acc, curr) => acc + (curr.estimatedPay || (curr.totalHours * hourlyRate * (curr.rateMultiplier || 2))), 0);

      // Attendance records for this employee
      const empAtt = attendanceRecords.filter(a => a.employeeId === emp.id && a.type === 'entry');
      const lateAtt = empAtt.filter(a => a.status === 'late' && !a.isCorroborated);
      const lateMinutes = lateAtt.length * 15; // Estimado promedio
      const lateDeduction = Math.round((hourlyRate / 60) * lateMinutes);

      // Worked days estimate based on records or standard active status
      const workedDays = Math.min(expectedDaysInPeriod, emp.status === 'active' ? (expectedDaysInPeriod - (emp.id === 'emp-004' ? 1 : 0)) : 10);
      const unexcusedAbsences = Math.max(0, expectedDaysInPeriod - workedDays - (emp.id === 'emp-004' ? 1 : 0));
      const excusedAbsences = emp.id === 'emp-004' ? 1 : 0;
      const absenceDeduction = unexcusedAbsences * dailyRate;

      // Calculations
      const baseSalary = dailyRate * workedDays;
      const grossPay = baseSalary + totalOvtPay;
      const netPay = Math.max(0, grossPay - lateDeduction - absenceDeduction);

      const status: 'audit_ok' | 'has_incidents' | 'paid' = isDispersed
        ? 'paid'
        : (lateAtt.length > 0 || unexcusedAbsences > 0 ? 'has_incidents' : 'audit_ok');

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        position: emp.position,
        department: emp.department,
        dailyRate,
        hourlyRate,
        workedDays,
        expectedDays: expectedDaysInPeriod,
        overtimeHours: totalOvtHours,
        overtimePay: totalOvtPay,
        lateOccurrences: lateAtt.length,
        lateMinutes,
        lateDeduction,
        unexcusedAbsences,
        excusedAbsences,
        absenceDeduction,
        grossPay,
        netPay,
        status,
      };
    });
  }, [employees, attendanceRecords, overtimeRecords, period, isDispersed]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(rec => {
      const matchDep = filterDepartment === 'all' || rec.department === filterDepartment;
      const matchSearch = rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDep && matchSearch;
    });
  }, [payrollRecords, filterDepartment, searchQuery]);

  // Totals for KPI cards
  const totalNet = useMemo(() => filteredRecords.reduce((acc, r) => acc + r.netPay, 0), [filteredRecords]);
  const totalOvertime = useMemo(() => filteredRecords.reduce((acc, r) => acc + r.overtimePay, 0), [filteredRecords]);
  const totalDeductions = useMemo(() => filteredRecords.reduce((acc, r) => acc + r.lateDeduction + r.absenceDeduction, 0), [filteredRecords]);
  const incidentCount = useMemo(() => filteredRecords.filter(r => r.lateOccurrences > 0 || r.unexcusedAbsences > 0).length, [filteredRecords]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Código Empleado',
      'Colaborador',
      'Departamento',
      'Puesto',
      'Salario Diario (MXN)',
      'Días Laborados',
      'Horas Extra',
      'Importe Horas Extra',
      'Retardos',
      'Descuento Retardos',
      'Faltas Injustificadas',
      'Descuento Faltas',
      'Sueldo Bruto',
      'Neto a Pagar',
      'Estatus'
    ];

    const rows = filteredRecords.map(r => [
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.position}"`,
      r.dailyRate,
      r.workedDays,
      r.overtimeHours,
      r.overtimePay,
      r.lateOccurrences,
      r.lateDeduction,
      r.unexcusedAbsences,
      r.absenceDeduction,
      r.grossPay,
      r.netPay,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prenomina_urcheck_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('¡Archivo de pre-nómina CSV exportado con éxito!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDisperse = () => {
    setIsDispersed(true);
    setToastMsg('¡Nómina autorizada y lista para dispersión bancaria!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div id="admin-payroll-view" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#138128]/10 text-[#138128]">
              <DollarSign className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
                Pre-Nómina y Matriz de Incidencias
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Cálculo automático de asistencias, retardos, horas extras autorizadas y liquidación neta.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0871A0] shrink-0" />
            <span className="hidden sm:inline">Imprimir Resumen</span>
          </button>

          <button
            onClick={handleDisperse}
            disabled={isDispersed}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer ${
              isDispersed 
                ? 'bg-[#138128] opacity-80 cursor-default' 
                : 'bg-[#0A3142] hover:bg-[#082735]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isDispersed ? 'Nómina Autorizada' : 'Autorizar Dispersión'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block leading-tight">
            Total Neto a Pagar
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-[#0A3142]">
              ${totalNet.toLocaleString('es-MX')}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">MXN</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-medium">
            {filteredRecords.length} colaboradores
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#138128] block leading-tight">
            Horas Extra Autorizadas
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-[#138128]">
              +${totalOvertime.toLocaleString('es-MX')}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">MXN</span>
          </div>
          <span className="text-[11px] text-[#138128] mt-1 block font-medium">
            Tarifa doble y triple LFT
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Deducciones Incidencias
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-amber-600">
              -${totalDeductions.toLocaleString('es-MX')}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">MXN</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block font-medium">
            Retardos y ausencias
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0871A0] block leading-tight">
            Incidencias Auditadas
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-[#0871A0]">
              {incidentCount}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">casos</span>
          </div>
          <span className="text-[11px] text-[#0871A0] mt-1 block font-medium">
            Verificadas con biometría
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Period selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="1q_sep">1ª Quincena Septiembre 2026 (01 al 15 Sep)</option>
            <option value="2q_sep">2ª Quincena Septiembre 2026 (16 al 30 Sep)</option>
            <option value="month_aug">Mes Completo Agosto 2026</option>
          </select>
        </div>

        {/* Search & Department */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="all">Todos los Departamentos</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:w-60 px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0871A0]"
          />
        </div>
      </div>

      {/* Payroll Table Matrix */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#0A3142] text-white uppercase text-[10px] sm:text-xs font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Colaborador</th>
                <th className="py-3.5 px-3">Salario Diario</th>
                <th className="py-3.5 px-3 text-center">Días Lab.</th>
                <th className="py-3.5 px-3 text-center">H. Extra</th>
                <th className="py-3.5 px-3 text-center">Retardos</th>
                <th className="py-3.5 px-3 text-center">Faltas</th>
                <th className="py-3.5 px-3 text-right">Percepciones</th>
                <th className="py-3.5 px-3 text-right">Deducciones</th>
                <th className="py-3.5 px-4 text-right">Neto a Dispersar</th>
                <th className="py-3.5 px-3 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium">
              {filteredRecords.map((rec) => (
                <tr key={rec.employeeId} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0A3142]">{rec.employeeName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <span className="font-mono">{rec.employeeCode}</span>
                        <span>•</span>
                        <span>{rec.position}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-neutral-700">
                    ${rec.dailyRate.toLocaleString('es-MX')}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-neutral-800 text-xs">
                      {rec.workedDays}/{rec.expectedDays}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {rec.overtimeHours > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[#138128] font-bold text-xs">
                        +{rec.overtimeHours}h (${rec.overtimePay})
                      </span>
                    ) : (
                      <span className="text-neutral-300">-</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {rec.lateOccurrences > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs">
                        {rec.lateOccurrences} ({rec.lateMinutes}m)
                      </span>
                    ) : (
                      <span className="text-neutral-300">0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {rec.unexcusedAbsences > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-xs">
                        {rec.unexcusedAbsences} injust.
                      </span>
                    ) : rec.excusedAbsences > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                        {rec.excusedAbsences} justif.
                      </span>
                    ) : (
                      <span className="text-neutral-300">0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[#138128] font-semibold">
                    ${rec.grossPay.toLocaleString('es-MX')}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-amber-700 font-semibold">
                    {(rec.lateDeduction + rec.absenceDeduction) > 0 ? (
                      `-$${(rec.lateDeduction + rec.absenceDeduction).toLocaleString('es-MX')}`
                    ) : (
                      '$0'
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-black text-base text-[#0A3142]">
                    ${rec.netPay.toLocaleString('es-MX')}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {rec.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#138128]/15 text-[#138128]">
                        <CheckCircle2 className="w-3 h-3" /> Dispersada
                      </span>
                    ) : rec.status === 'has_incidents' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Con Incidencias
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0871A0] border border-sky-200">
                        <CheckCircle2 className="w-3 h-3" /> Listo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
