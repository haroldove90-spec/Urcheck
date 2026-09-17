import React, { useState } from 'react';
import { OvertimeRecord } from '../../types';
import { 
  Clock, 
  Check, 
  X, 
  DollarSign, 
  Building2, 
  Calendar, 
  FileCheck, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

interface OvertimeViewProps {
  overtimeRecords: OvertimeRecord[];
  onApproveOvertime: (recordId: string) => void;
  onRejectOvertime: (recordId: string) => void;
}

export const OvertimeView: React.FC<OvertimeViewProps> = ({
  overtimeRecords,
  onApproveOvertime,
  onRejectOvertime,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pending = overtimeRecords.filter(r => r.status === 'pending');
  const approved = overtimeRecords.filter(r => r.status === 'approved');

  const totalHoursPending = pending.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalHoursApproved = approved.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalPayrollCost = approved.reduce((acc, curr) => acc + curr.estimatedPay, 0);

  const filteredRecords = overtimeRecords.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div id="admin-overtime-view" className="space-y-6">
      
      {/* Header with Payroll Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#0871A0]" />
            Supervisión y Control de Horas Extraordinarias
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Supervisión, validación y control de las jornadas extraordinarias registradas para cálculo de nómina
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#0A3142] text-white text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#138128]" />
            Costo Nómina: ${totalPayrollCost.toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      {/* KPI Cards - 2 Columns on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Horas Pendientes
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{totalHoursPending} hrs</span>
            <span className="text-[11px] sm:text-xs text-neutral-500">({pending.length})</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Horas Aprobadas
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#138128]">{totalHoursApproved} hrs</span>
            <span className="text-[11px] sm:text-xs text-neutral-500">({approved.length})</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Total a Dispersar (MXN)
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0A3142]">${totalPayrollCost.toLocaleString('es-MX')}</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#138128]">Tarifa Ley x2.0</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              filter === status
                ? 'bg-[#0A3142] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {status === 'all' && 'Todos los Registros'}
            {status === 'pending' && `Pendientes de Validar (${pending.length})`}
            {status === 'approved' && 'Aprobadas para Nómina'}
            {status === 'rejected' && 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Overtime List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((item) => {
            const isPending = item.status === 'pending';
            const isApproved = item.status === 'approved';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#0871A0]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.employeeAvatar}
                    alt={item.employeeName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#0A3142] text-sm sm:text-base">
                        {item.employeeName}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-semibold">
                        <Building2 className="w-3.5 h-3.5" />
                        {item.branchName}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isApproved ? 'bg-[#138128]/10 text-[#138128]' :
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isApproved && '✓ Validado para Nómina'}
                        {isPending && '⏳ Pendiente de Autorización'}
                        {item.status === 'rejected' && '✕ Rechazado'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 font-medium mt-1">
                      {item.reason}
                    </p>

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-neutral-600 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-neutral-900">
                        <Calendar className="w-3.5 h-3.5 text-[#0871A0]" />
                        Fecha: {item.date} ({item.startTime} - {item.endTime} hrs)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-800">
                        {item.totalHours} Horas Extraordinarias
                      </span>
                      <span className="font-bold text-[#138128]">
                        Importe estimado: ${item.estimatedPay.toLocaleString('es-MX')} MXN (Factor {item.rateMultiplier}x)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => onApproveOvertime(item.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#138128] hover:bg-[#0e661f] text-white transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Autorizar para Nómina</span>
                      </button>

                      <button
                        onClick={() => onRejectOvertime(item.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-neutral-400">
                      Autorizado por {item.approvedBy || 'Fernanda Soto Vargas'} ({item.approvedDate || 'Hoy'})
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-500 text-sm">
            No se encontraron registros de horas extras en esta vista.
          </div>
        )}
      </div>
    </div>
  );
};
