import React, { useState } from 'react';
import { LeaveRequest } from '../../types';
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface LeavesViewProps {
  leaveRequests: LeaveRequest[];
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string, reason: string) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filtered = leaveRequests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;

  const handleConfirmRejection = () => {
    if (!rejectionModalId) return;
    onRejectLeave(rejectionModalId, rejectionReason || 'No cumple con las políticas operativas del periodo.');
    setRejectionModalId(null);
    setRejectionReason('');
  };

  return (
    <div id="admin-leaves-view" className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#0871A0]" />
            Gestión de Permisos, Vacaciones e Incidencias
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Recepción, revisión y aprobación o rechazo de solicitudes de días de descanso, faltas e incidencias
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pendientes de firma</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#138128]" />
            <span>{approvedCount} Aprobadas este mes</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === status
                ? 'bg-[#0A3142] text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {status === 'all' && 'Todas las Solicitudes'}
            {status === 'pending' && `Pendientes (${pendingCount})`}
            {status === 'approved' && 'Aprobadas'}
            {status === 'rejected' && 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Leaves List Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((leave) => {
            const isPending = leave.status === 'pending';
            const isApproved = leave.status === 'approved';
            const isRejected = leave.status === 'rejected';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-[#0871A0]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={leave.employeeAvatar}
                    alt={leave.employeeName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#0A3142] text-sm sm:text-base">
                        {leave.employeeName}
                      </h4>
                      <span className="capitalize text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                        {leave.type}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isApproved ? 'bg-[#138128]/10 text-[#138128]' :
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isApproved && '✓ Aprobado'}
                        {isPending && '⏳ En Revisión'}
                        {isRejected && '✕ Rechazado'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-1 font-medium">
                      {leave.reason}
                    </p>

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-neutral-500 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-neutral-800">
                        <Calendar className="w-3.5 h-3.5 text-[#0871A0]" />
                        Del {leave.startDate} al {leave.endDate} ({leave.daysCount} días hábiles)
                      </span>
                      <span>Solicitado: {leave.requestDate}</span>
                      {leave.attachmentName && (
                        <span className="flex items-center gap-1 text-[#0871A0] font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          {leave.attachmentName}
                        </span>
                      )}
                    </div>

                    {leave.rejectionReason && (
                      <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <strong>Motivo de rechazo:</strong> {leave.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => onApproveLeave(leave.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#138128] hover:bg-[#0e661f] text-white transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprobar Solicitud</span>
                      </button>

                      <button
                        onClick={() => setRejectionModalId(leave.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-neutral-400">
                      Dictaminado por {leave.reviewedBy || 'Fernanda Soto Vargas'} ({leave.reviewedDate || 'Hoy'})
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-500 text-sm">
            No hay solicitudes de permiso registradas en esta categoría.
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-[#0A3142] mb-2">
              Motivo del Rechazo de la Solicitud
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Por favor indica la justificación patronal para notificar al colaborador:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej. Fechas críticas de cierre de inventario / Saldo de vacaciones insuficiente..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0871A0]"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionModalId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
