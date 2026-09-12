import React, { useState } from 'react';
import { OvertimeRecord, UserProfile } from '../../types';
import { 
  Clock, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Send, 
  Building2 
} from 'lucide-react';

interface MyOvertimeViewProps {
  currentUser: UserProfile;
  overtimeRecords: OvertimeRecord[];
  onSubmitOvertime: (record: OvertimeRecord) => void;
}

export const MyOvertimeView: React.FC<MyOvertimeViewProps> = ({
  currentUser,
  overtimeRecords,
  onSubmitOvertime,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [totalHours, setTotalHours] = useState(3);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const myRecords = overtimeRecords.filter(r => r.employeeId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !reason) return;

    const hourlyBase = 160;
    const rateMultiplier = 2.0;
    const estimatedPay = Math.round(totalHours * hourlyBase * rateMultiplier);

    const newRecord: OvertimeRecord = {
      id: `ot-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      branchId: 'suc-01',
      branchName: currentUser.branch || 'Corporativo Reforma',
      date,
      startTime,
      endTime,
      totalHours: Number(totalHours),
      reason,
      status: 'pending',
      hourlyRate: hourlyBase,
      rateMultiplier,
      estimatedPay,
    };

    onSubmitOvertime(newRecord);
    setIsFormOpen(false);
    setReason('');
    setFeedback('Jornada extraordinaria registrada y enviada a validación patronal.');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div id="employee-my-overtime-view" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0871A0]">
            Tiempo Extraordinario Operativo
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
            Mis Horas Extraordinarias
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Registro y seguimiento del tiempo laborado fuera de turno sujeto a cálculo de nómina
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cerrar Registro' : 'Registrar Tiempo Extra'}</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#138128]" />
          {feedback}
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border-2 border-[#0871A0] p-6 shadow-md animate-in fade-in">
          <h3 className="text-base font-bold text-[#0A3142] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0871A0]" />
            Reportar Jornada Extraordinaria
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Fecha de la Jornada *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Hora Inicio *</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Hora Fin *</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Total de Horas Efectivas</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold block">Cálculo Estimado a Cobrar</span>
                  <span className="text-lg font-black text-[#138128]">
                    ${(totalHours * 160 * 2.0).toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#138128]/10 text-[#138128]">
                  Tarifa Doble x2.0
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Proyecto / Actividad Justificatoria *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Especifica la tarea extraordinaria realizada por solicitud del supervisor..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white font-bold shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar a Validación Patronal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overtime Records History */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-[#0A3142] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0871A0]" />
          Historial de Horas Extras Registradas
        </h3>

        <div className="space-y-3">
          {myRecords.length > 0 ? (
            myRecords.map((r) => {
              const isApproved = r.status === 'approved';
              const isPending = r.status === 'pending';

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#0A3142] text-sm">
                        {r.date} ({r.startTime} - {r.endTime} hrs)
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-neutral-200 text-neutral-800">
                        {r.totalHours} Horas Extra
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isApproved ? 'bg-[#138128]/10 text-[#138128]' :
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isApproved && '✓ Aprobado para Nómina'}
                        {isPending && '⏳ En Validación por RRHH'}
                        {r.status === 'rejected' && '✕ Rechazado'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-1 font-medium">{r.reason}</p>
                    <span className="text-xs font-semibold text-[#138128] block mt-1">
                      Monto a pagar: ${r.estimatedPay.toLocaleString('es-MX')} MXN
                    </span>
                  </div>

                  <div className="text-right text-xs text-neutral-500">
                    {r.approvedBy ? (
                      <span className="text-neutral-700 font-semibold block">
                        Validado por: {r.approvedBy}
                      </span>
                    ) : (
                      <span>Pendiente de visto bueno</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-neutral-500 text-xs py-4 text-center">
              No tienes registros de horas extras este mes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
