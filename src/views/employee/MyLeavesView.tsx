import React, { useState, useRef } from 'react';
import { LeaveRequest, UserProfile } from '../../types';
import { 
  CalendarCheck, 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  UploadCloud,
  Send,
  Sparkles
} from 'lucide-react';

interface MyLeavesViewProps {
  currentUser: UserProfile;
  leaveRequests: LeaveRequest[];
  onSubmitRequest: (req: LeaveRequest) => void;
}

export const MyLeavesView: React.FC<MyLeavesViewProps> = ({
  currentUser,
  leaveRequests,
  onSubmitRequest,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState<'vacation' | 'medical' | 'personal' | 'paternity'>('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const handleToggleForm = () => {
    if (!isFormOpen) {
      setIsFormOpen(true);
      // Auto-scroll to make the form visible immediately on mobile and all devices
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } else {
      setIsFormOpen(false);
    }
  };

  const myRequests = leaveRequests.filter(r => r.employeeId === currentUser.id);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.round(diff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    const daysCount = calculateDays(startDate, endDate);
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      type,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      attachmentName: attachmentName || undefined,
    };

    onSubmitRequest(newReq);
    setIsFormOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    setAttachmentName(null);
    setSubmittedFeedback('Solicitud enviada a Recursos Humanos para dictamen.');
    setTimeout(() => setSubmittedFeedback(null), 4000);
  };

  return (
    <div id="employee-my-leaves-view" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Balance Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0A3142] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#0871A0]" />
            Permisos y Solicitud de Vacaciones
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Autoservicio para tramitar periodos de descanso e incidencias justificadas
          </p>
        </div>

        <button
          onClick={handleToggleForm}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] active:scale-95 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cerrar Formulario' : 'Nueva Solicitud'}</span>
        </button>
      </div>

      {submittedFeedback && (
        <div className="bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#138128]" />
          {submittedFeedback}
        </div>
      )}

      {/* Balance Cards - Exactly 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Vacaciones Disponibles
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-black text-[#138128]">12</span>
            <span className="text-[11px] sm:text-xs text-neutral-500 font-semibold">días ley</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Días Disfrutados
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-black text-[#0A3142]">4</span>
            <span className="text-[11px] sm:text-xs text-neutral-500 font-semibold">aprobados</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Solicitudes en Revisión
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-black text-amber-600">
              {myRequests.filter(r => r.status === 'pending').length}
            </span>
            <span className="text-[11px] sm:text-xs text-neutral-500 font-semibold">en dictamen</span>
          </div>
        </div>
      </div>

      {/* Form Card with auto-scroll target */}
      {isFormOpen && (
        <div 
          ref={formRef} 
          className="scroll-mt-24 bg-white rounded-2xl border-2 border-[#0871A0] p-5 sm:p-6 shadow-md animate-in fade-in transition-all ring-4 ring-[#0871A0]/10"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 className="text-sm sm:text-base font-bold text-[#0A3142] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0871A0]" />
              Tramitar Nueva Solicitud de Permiso o Vacaciones
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0871A0]/10 text-[#0871A0]">
              Formulario Activo
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Tipo de Incidencia / Permiso *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white font-medium focus:ring-2 focus:ring-[#0871A0]"
              >
                <option value="vacation">Periodo Vacacional Oficial (Ley)</option>
                <option value="medical">Incapacidad Médica / Consulta Salud</option>
                <option value="personal">Asunto Personal con Goce</option>
                <option value="paternity">Paternidad / Cuidados Familiares</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Motivo / Justificación *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Indica brevemente el motivo para revisión de Recursos Humanos..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#0871A0]"
              />
            </div>

            {/* Document attachment simulation */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Comprobante o Justificante (Opcional)
              </label>
              <div className="border border-dashed border-neutral-300 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {attachmentName ? `Archivo adjunto: ${attachmentName}` : 'Formatos permitidos: PDF, JPG, PNG'}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachmentName('comprobante_medico_imss.pdf')}
                  className="px-3 py-1 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl cursor-pointer"
                >
                  {attachmentName ? 'Cambiar' : 'Subir Archivo'}
                </button>
              </div>
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
                <span>Enviar Solicitud a RRHH</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History of my requests */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-[#0A3142] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0871A0]" />
          Historial de Mis Solicitudes
        </h3>

        <div className="space-y-3">
          {myRequests.length > 0 ? (
            myRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0A3142] text-sm capitalize">
                      {req.type === 'vacation' ? 'Vacaciones' : req.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      req.status === 'approved' ? 'bg-[#138128]/10 text-[#138128]' :
                      req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status === 'approved' && '✓ Aprobado'}
                      {req.status === 'pending' && '⏳ En Revisión'}
                      {req.status === 'rejected' && '✕ Rechazado'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-1">{req.reason}</p>
                  <span className="text-[11px] text-neutral-500 block mt-1">
                    Periodo: {req.startDate} al {req.endDate} ({req.daysCount} días)
                  </span>
                </div>

                <div className="text-right text-xs text-neutral-500">
                  <span>Solicitado: {req.requestDate}</span>
                  {req.reviewedBy && (
                    <span className="block text-[11px] font-medium text-neutral-700">
                      Dictamen: {req.reviewedBy}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-xs py-4 text-center">
              No tienes solicitudes registradas en este periodo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
