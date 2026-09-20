import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../../types';
import { INITIAL_AUDIT_LOGS } from '../../data/mockData';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  Download
} from 'lucide-react';

interface AuditLogViewProps {
  logs?: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs = INITIAL_AUDIT_LOGS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const safeLogs = logs || [];

  const modules = useMemo(() => {
    const set = new Set(safeLogs.map(l => l.module));
    return Array.from(set);
  }, [safeLogs]);

  const filteredLogs = useMemo(() => {
    return safeLogs.filter(l => {
      const matchSearch = (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.actorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.details || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchModule = filterModule === 'all' || l.module === filterModule;
      const matchSeverity = filterSeverity === 'all' || l.severity === filterSeverity;
      return matchSearch && matchModule && matchSeverity;
    });
  }, [safeLogs, searchQuery, filterModule, filterSeverity]);

  const getSeverityBadge = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Crítico</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Advertencia</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Exitoso</span>;
      case 'info':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1"><Info className="w-3 h-3" /> Info</span>;
    }
  };

  return (
    <div id="admin-audit-log-view" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#093244]/10 text-[#093244]">
              <ShieldCheck className="w-6 h-6 text-[#0871A0]" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
                Historial de Auditoría (Audit Trail)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Registro cronológico inmutable de operaciones críticas, firmas electrónicas y autorizaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Integridad Criptográfica Activa
          </span>
        </div>
      </div>

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 block leading-tight">
            Eventos Auditados
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0A3142]">{logs.length}</span>
            <span className="text-[11px] text-neutral-400 font-semibold">registros</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#138128] block leading-tight">
            Autorizaciones RRHH
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#138128]">
              {logs.filter(l => l.severity === 'success').length}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">aprobadas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Cambios de Parámetros
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {logs.filter(l => l.severity === 'warning').length}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">ajustes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0871A0] block leading-tight">
            Operadores Activos
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0871A0]">1</span>
            <span className="text-[11px] text-neutral-400 font-semibold">admin</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-neutral-50"
          >
            <option value="all">Todos los Módulos</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold bg-neutral-50"
          >
            <option value="all">Todas las Severidades</option>
            <option value="success">Exitoso</option>
            <option value="info">Informativo</option>
            <option value="warning">Advertencias</option>
            <option value="critical">Crítico</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Buscar evento, usuario o detalle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-neutral-50"
        />
      </div>

      {/* Audit List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-neutral-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#0871A0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-[#0A3142]">
                      {log.action}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                      {log.module}
                    </span>
                    {getSeverityBadge(log.severity)}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    {log.details}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Ejecutado por: <span className="font-bold text-neutral-700">{log.actorName}</span> ({log.actorRole})
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-xs text-neutral-500 font-semibold block">
                  {log.timestamp}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Audit ID: {log.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
