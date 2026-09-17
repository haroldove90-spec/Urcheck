import React, { useState } from 'react';
import { Shift, Employee, OfficialHoliday } from '../../types';
import { 
  Clock, 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Coffee,
  X
} from 'lucide-react';

interface ShiftsViewProps {
  shifts: Shift[];
  employees: Employee[];
  holidays: OfficialHoliday[];
  onAddShift: (newShift: Shift) => void;
  onAssignEmployeeShift: (employeeId: string, shiftName: string) => void;
}

export const ShiftsView: React.FC<ShiftsViewProps> = ({
  shifts,
  employees,
  holidays,
  onAddShift,
  onAssignEmployeeShift,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState<Shift | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Shift Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<Shift['type']>('matutino');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [lunchBreakMinutes, setLunchBreakMinutes] = useState(30);
  const [toleranceMinutes, setToleranceMinutes] = useState(10);
  const [workingDays, setWorkingDays] = useState<string[]>(['Lun', 'Mar', 'Mie', 'Jue', 'Vie']);
  const [description, setDescription] = useState('');

  const allDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newShift: Shift = {
      id: `sh-${Date.now()}`,
      name,
      code: code || `TUR-${Math.floor(100 + Math.random() * 900)}`,
      type,
      startTime,
      endTime,
      lunchBreakMinutes: Number(lunchBreakMinutes),
      toleranceMinutes: Number(toleranceMinutes),
      workingDays,
      assignedEmployeesCount: 0,
      description,
      color: type === 'nocturno' ? '#8B5CF6' : type === 'vespertino' ? '#F59E0B' : '#069AD8',
    };

    onAddShift(newShift);
    setIsAddOpen(false);
    // Reset
    setName('');
    setCode('');
    setDescription('');
    setToastMsg(`Turno "${newShift.name}" creado exitosamente.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAssign = (empId: string, shiftName: string) => {
    onAssignEmployeeShift(empId, shiftName);
    setToastMsg('¡Horario de colaborador actualizado!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div id="admin-shifts-view" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0871A0]/10 text-[#0871A0]">
              <Clock className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
                Gestión de Turnos y Horarios
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Catálogo de horarios laborales, tolerancias de entrada, rotaciones y días feriados oficiales.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0A3142] hover:bg-[#082735] active:scale-95 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Turno</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2-Column Mobile KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block leading-tight">
            Turnos Registrados
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0A3142]">{shifts.length}</span>
            <span className="text-[11px] text-neutral-400 font-semibold">activos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#138128] block leading-tight">
            Personal en Matutino
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#138128]">
              {employees.filter(e => e.shift?.toLowerCase().includes('matutino') || e.shift?.toLowerCase().includes('turno 1')).length}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">colaboradores</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Personal en Vespertino
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {employees.filter(e => e.shift?.toLowerCase().includes('vespertino') || e.shift?.toLowerCase().includes('turno 2')).length}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">colaboradores</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0871A0] block leading-tight">
            Feriados Oficiales (LFT)
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0871A0]">{holidays.length}</span>
            <span className="text-[11px] text-neutral-400 font-semibold">días de ley</span>
          </div>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shifts.map((shift) => (
          <div 
            key={shift.id} 
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#0871A0]/40 transition-all"
          >
            <div>
              {/* Top Tag & Code */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  {shift.code}
                </span>
                <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: `${shift.color}15`, color: shift.color }}>
                  {shift.type}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-black text-[#0A3142] mt-3">
                {shift.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                {shift.description}
              </p>

              {/* Schedule badges */}
              <div className="mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0871A0]" /> Horario:
                  </span>
                  <span className="font-black text-neutral-800 font-mono">
                    {shift.startTime} a {shift.endTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" /> Comida:
                  </span>
                  <span className="font-bold text-neutral-700">
                    {shift.lunchBreakMinutes} min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#138128]" /> Tolerancia entrada:
                  </span>
                  <span className="font-bold text-[#138128]">
                    {shift.toleranceMinutes} min
                  </span>
                </div>
              </div>

              {/* Working Days Pills */}
              <div className="mt-3 flex items-center gap-1 flex-wrap">
                {allDays.map((d) => {
                  const isActive = shift.workingDays.includes(d);
                  return (
                    <span 
                      key={d} 
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive 
                          ? 'bg-[#0A3142] text-white' 
                          : 'bg-neutral-100 text-neutral-300'
                      }`}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Assigned count & quick assign button */}
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>{employees.filter(e => e.shift?.toLowerCase().includes(shift.name.toLowerCase()) || e.shift?.toLowerCase().includes(shift.code.toLowerCase())).length} asignados</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedShiftForAssign(shift)}
                className="text-xs font-bold text-[#0871A0] hover:text-[#0A3142] cursor-pointer"
              >
                Asignar Colaboradores →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statutory Mexican Holidays (LFT) Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A3142] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0871A0]" />
              Días Feriados Oficiales (Ley Federal del Trabajo 2026)
            </h3>
            <p className="text-xs text-neutral-500">
              Días de descanso obligatorio. No generan faltas y las horas laboradas se liquidan al 300% (pago triple).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {holidays.map((h) => (
            <div key={h.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#0871A0] block">
                  {h.date}
                </span>
                <span className="text-xs font-bold text-neutral-800">
                  {h.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Pago {h.multiplierRate}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Shift */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#0A3142]">
                Crear Nuevo Turno de Trabajo
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nombre del Turno *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Turno Nocturno Refinería"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Código Identificador</label>
                  <input
                    type="text"
                    placeholder="ej. NOC-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Modalidad</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="matutino">Matutino</option>
                    <option value="vespertino">Vespertino</option>
                    <option value="nocturno">Nocturno</option>
                    <option value="mixto">Mixto</option>
                    <option value="operativo_12x24">Operativo 12x24</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hora de Entrada</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Hora de Salida</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tiempo de Comida (min)</label>
                  <input
                    type="number"
                    value={lunchBreakMinutes}
                    onChange={(e) => setLunchBreakMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tolerancia Retardo (min)</label>
                  <input
                    type="number"
                    value={toleranceMinutes}
                    onChange={(e) => setToleranceMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1.5">Días Laborales del Turno</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allDays.map((d) => {
                    const isSelected = workingDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0A3142] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Descripción / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre descansos, áreas de aplicación o requerimientos especiales..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A3142] text-white rounded-xl font-bold hover:bg-[#082735]"
                >
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Employees to Shift */}
      {selectedShiftForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0A3142]">
                  Asignar Colaboradores al {selectedShiftForAssign.name}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Horario: {selectedShiftForAssign.startTime} - {selectedShiftForAssign.endTime}
                </p>
              </div>
              <button onClick={() => setSelectedShiftForAssign(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {employees.map((emp) => {
                const isCurrentShift = emp.shift?.toLowerCase().includes(selectedShiftForAssign.name.toLowerCase());
                return (
                  <div key={emp.id} className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#0A3142] block">
                        {emp.name}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {emp.position} • {emp.department} • <span className="font-semibold text-neutral-600">Actual: {emp.shift}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrentShift}
                      onClick={() => handleAssign(emp.id, `${selectedShiftForAssign.name} (${selectedShiftForAssign.startTime} - ${selectedShiftForAssign.endTime})`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                        isCurrentShift
                          ? 'bg-emerald-50 text-emerald-700 cursor-default'
                          : 'bg-[#0A3142] text-white hover:bg-[#082735]'
                      }`}
                    >
                      {isCurrentShift ? 'Asignado ✓' : 'Asignar a este Turno'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedShiftForAssign(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
