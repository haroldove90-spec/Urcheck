import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Table2, 
  ArrowUpRight, 
  Zap, 
  Send, 
  Users, 
  Clock
} from 'lucide-react';
import { 
  testSupabaseConnection, 
  SupabaseTestResult, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_PROJECT_NAME, 
  SUPABASE_URL, 
  SUPABASE_SQL_SCHEMA,
  supabase
} from '../lib/supabase';
import { syncAllInitialCatalogToSupabase } from '../services/dbSync';
import { Employee, Branch } from '../types';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  branches: Branch[];
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  employees,
  branches,
}) => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Ping test state
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [pingFeedback, setPingFeedback] = useState<string | null>(null);

  // Sync catalog state
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);

  const runTest = async () => {
    setIsRunningTest(true);
    setPingFeedback(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch {
      setTestResult({
        success: false,
        message: 'Error inesperado al probar conexión.',
        latencyMs: 0,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        tables: [],
        allTablesReady: false,
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    if (isOpen && !testResult) {
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSendTestPing = async () => {
    setIsSendingPing(true);
    setPingFeedback(null);

    try {
      // First ensure an employee exists in Supabase so foreign key passes
      const targetEmp = employees[0] || {
        id: 'emp-001',
        name: 'Carlos Mendoza Ortiz',
        employeeCode: 'EMP-7742',
      };

      // Upsert target employee first to guarantee FK
      await supabase.from('employees').upsert({
        id: targetEmp.id,
        employee_code: targetEmp.employeeCode,
        name: targetEmp.name,
        branch_name: 'Corporativo Reforma',
        status: 'active',
      });

      const testId = `att-ping-${Date.now()}`;
      const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Insert real test punch
      const { error: insertErr } = await supabase.from('attendance_records').insert({
        id: testId,
        employee_id: targetEmp.id,
        employee_name: targetEmp.name,
        employee_code: targetEmp.employeeCode,
        timestamp: nowTime,
        type: 'entry',
        method: 'facial',
        status: 'on_time',
        biometric_device_id: 'Test Diagnostic Console V5',
        verification_score: 99.9,
        hash_audit: `SHA256:test-${Math.random().toString(36).substring(2, 9)}`,
      });

      if (insertErr) {
        setPingFeedback(`Error de inserción: ${insertErr.message}`);
        return;
      }

      // Read it back to verify read access
      const { data: readBack, error: readErr } = await supabase
        .from('attendance_records')
        .select('id, timestamp, employee_name')
        .eq('id', testId)
        .single();

      if (readErr || !readBack) {
        setPingFeedback(`Inserción OK, pero error al consultar: ${readErr?.message}`);
        return;
      }

      setPingFeedback(`✓ Marcaje de prueba verificado con éxito en Supabase (ID: ${testId.substring(0, 16)}... | Hora: ${readBack.timestamp}). Escritura y lectura 100% operativas.`);
      // Refresh test count
      runTest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPingFeedback(`Error durante el ping: ${msg}`);
    } finally {
      setIsSendingPing(false);
    }
  };

  const handleSyncAllCatalog = async () => {
    setIsSyncingCatalog(true);
    setCatalogFeedback(null);
    try {
      const res = await syncAllInitialCatalogToSupabase(employees, branches);
      if (res.success) {
        setCatalogFeedback(`✓ Sincronización exitosa: ${res.employeesSynced} colaboradores y ${res.branchesSynced} sedes guardadas en Supabase.`);
        runTest();
      } else {
        setCatalogFeedback(`Error al sincronizar catálogo: ${res.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCatalogFeedback(`Error de red: ${msg}`);
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  return (
    <div 
      id="supabase-connection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#093244] to-[#069AD8] p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Cerrar diagnóstico"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Diagnóstico de Conexión Supabase</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  EN VIVO
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Verificación de latencia, lectura/escritura y estado de las 7 tablas de la base de datos
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Main Status Banner & Latency */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {isRunningTest ? (
                <RefreshCw className="w-6 h-6 text-[#069AD8] animate-spin shrink-0 mt-0.5" />
              ) : testResult?.success && testResult?.allTablesReady ? (
                <CheckCircle2 className="w-6 h-6 text-[#1F832D] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Estado Global del Servicio
                </span>
                <p className="text-sm font-bold text-[#093244]">
                  {isRunningTest 
                    ? 'Consultando endpoints de Supabase...' 
                    : testResult?.message || 'Listo para comprobar'}
                </p>
                {testResult && (
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#069AD8]" /> Latencia: <strong className="text-neutral-800">{testResult.latencyMs} ms</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-600 truncate max-w-[240px]">
                      Ref ID: <strong>{SUPABASE_PROJECT_ID}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={runTest}
              disabled={isRunningTest}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#069AD8] hover:bg-[#0580b3] active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
              <span>{isRunningTest ? 'Verificando...' : 'Re-probar Ahora'}</span>
            </button>
          </div>

          {/* Tables Diagnostics List (7 tables) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#093244] flex items-center gap-1.5">
                <Table2 className="w-4 h-4 text-[#069AD8]" />
                Esquema de Tablas Supabase (7 Tablas Verificadas)
              </h3>
              {testResult && (
                <span className="text-xs font-bold text-[#1F832D] bg-[#1F832D]/10 px-2 py-0.5 rounded-md">
                  {testResult.tables.filter(t => t.status === 'ok').length} / 7 Activas
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {testResult?.tables.map((tbl) => (
                <div 
                  key={tbl.name}
                  className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-[#069AD8]/40 transition flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[#093244] block truncate">
                      {tbl.label}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 block truncate">
                      public.{tbl.name}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {tbl.status === 'ok' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{tbl.count} {tbl.count === 1 ? 'fila' : 'filas'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[11px]">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>No creada</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Test Actions: Live Punch Ping & Catalog Seed Sync */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-[#069AD8]/5 border border-[#069AD8]/20 space-y-3">
            <h4 className="text-xs font-bold text-[#093244] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Pruebas Interactivas de Validación en Supabase
            </h4>

            <div className="flex flex-wrap gap-2.5">
              {/* Test Marcaje Ping */}
              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={isSendingPing || isRunningTest}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-300 shadow-2xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 text-[#069AD8] ${isSendingPing ? 'animate-bounce' : ''}`} />
                <span>{isSendingPing ? 'Enviando Marcaje...' : 'Simular Marcaje de Prueba'}</span>
              </button>

              {/* Sync Catalog button */}
              <button
                type="button"
                onClick={handleSyncAllCatalog}
                disabled={isSyncingCatalog || isRunningTest}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-300 shadow-2xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Users className={`w-3.5 h-3.5 text-[#1F832D] ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                <span>{isSyncingCatalog ? 'Sincronizando...' : 'Sincronizar Empleados y Sedes'}</span>
              </button>
            </div>

            {pingFeedback && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                pingFeedback.startsWith('✓') 
                  ? 'bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {pingFeedback}
              </div>
            )}

            {catalogFeedback && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                catalogFeedback.startsWith('✓') 
                  ? 'bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {catalogFeedback}
              </div>
            )}
          </div>

          {/* SQL Schema Inspector & Copy */}
          <div className="border-t border-neutral-200 pt-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="text-xs font-bold text-[#069AD8] hover:underline cursor-pointer flex items-center gap-1"
              >
                {showSqlViewer ? 'Ocultar Script SQL' : 'Ver Script SQL Corregido para Supabase'}
              </button>

              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition cursor-pointer active:scale-95"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            {showSqlViewer && (
              <div className="mt-2 relative">
                <pre className="p-3 bg-neutral-900 text-neutral-200 text-[11px] font-mono rounded-xl max-h-48 overflow-y-auto border border-neutral-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-[#069AD8] font-semibold inline-flex items-center gap-1"
          >
            <span>Abrir Dashboard en Supabase</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold transition cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
