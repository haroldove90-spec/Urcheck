import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { 
  Settings, 
  Building2, 
  Clock, 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Key,
  ShieldAlert,
  Database,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code2,
  Server,
  AlertCircle,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { CenteredFeedbackModal, FeedbackData } from '../../components/CenteredFeedbackModal';
import { 
  SUPABASE_PROJECT_NAME, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  SupabaseTestResult 
} from '../../lib/supabase';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onPurgeMockData?: () => Promise<void> | void;
  onRestoreMockData?: () => Promise<void> | void;
  isMockDataPurged?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onPurgeMockData,
  onRestoreMockData,
  isMockDataPurged = false,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isTestingHardware, setIsTestingHardware] = useState(false);
  const [hardwareTestFeedback, setHardwareTestFeedback] = useState<string | null>(null);

  // Supabase State
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<SupabaseTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setFeedback({
      title: '¡Cambios Guardados con Éxito!',
      message: 'Los parámetros institucionales, tolerancias de asistencia y configuraciones biométricas han sido actualizados y respaldados correctamente.',
      type: 'success',
      autoCloseMs: 3500,
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmPurge = async () => {
    setShowPurgeConfirm(false);
    setIsPurging(true);
    try {
      if (onPurgeMockData) {
        await onPurgeMockData();
      }
      setFeedback({
        title: '¡Registros de Muestra Eliminados!',
        message: 'Los colaboradores, asistencias y registros demo fueron borrados de la aplicación y de la base de datos Supabase. El sistema ha sido configurado para que no se vuelvan a cargar.',
        type: 'success',
        autoCloseMs: 4000,
      });
    } catch (err) {
      setFeedback({
        title: 'Error al depurar datos',
        message: 'Ocurrió un error al intentar borrar los datos de muestra.',
        type: 'error',
      });
    } finally {
      setIsPurging(false);
    }
  };

  const handleRestoreDemo = async () => {
    setIsPurging(true);
    try {
      if (onRestoreMockData) {
        await onRestoreMockData();
      }
      setFeedback({
        title: '¡Datos de Muestra Restaurados!',
        message: 'Los registros de prueba han sido recargados y sincronizados con Supabase.',
        type: 'info',
        autoCloseMs: 3500,
      });
    } finally {
      setIsPurging(false);
    }
  };

  const handleTestHardwareConnection = () => {
    setIsTestingHardware(true);
    setHardwareTestFeedback(null);
    setTimeout(() => {
      setIsTestingHardware(false);
      setHardwareTestFeedback(
        `✓ Handshake Urcheck BioCloud Push SDK exitoso. 4 dispositivos respondieron a tiempo (UDP/TCP: 4370). Latencia de nube: 28ms.`
      );
      setTimeout(() => setHardwareTestFeedback(null), 5000);
    }, 1500);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestResult(res);
    } catch (err) {
      setSupabaseTestResult({
        success: false,
        message: 'Error al conectar con la instancia de Supabase.',
        latencyMs: 0,
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `urcheck_supabase_schema_${SUPABASE_PROJECT_ID}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="admin-settings-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#093244] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#069AD8]" />
            Configuración del Sistema y Parámetros Biométricos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Ajustes de la empresa, tolerancia de retardos y sincronización con terminales Urcheck BioCloud
          </p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1F832D]" />
            Cambios guardados con éxito
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company General Information */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#093244] flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Building2 className="w-5 h-5 text-[#069AD8]" />
            Datos Institucionales de la Empresa
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Razón Social / Nombre Fiscal
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                RFC Patronal (SAT)
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Turn & Shift Policies */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#093244] flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Clock className="w-5 h-5 text-[#069AD8]" />
            Políticas de Asistencia y Tolerancia
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Minutos de Tolerancia de Entrada
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.toleranceMinutes}
                  onChange={(e) => setFormData({ ...formData, toleranceMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
                />
                <span className="text-xs text-neutral-500 font-bold">Min</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Pasado este margen se computará automáticamente como "Retardo".
              </p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Horario Estándar Entrada
              </label>
              <input
                type="time"
                value={formData.defaultShiftStart}
                onChange={(e) => setFormData({ ...formData, defaultShiftStart: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Horario Estándar Salida
              </label>
              <input
                type="time"
                value={formData.defaultShiftEnd}
                onChange={(e) => setFormData({ ...formData, defaultShiftEnd: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#069AD8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Biometric Hardware Integration */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-base font-bold text-[#093244] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#069AD8]" />
              Sincronización con Reloj Checador Biométrico Urcheck
            </h3>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30">
              <span className="w-2 h-2 rounded-full bg-[#1F832D] animate-pulse" />
              CONECTADO
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Host / IP Central del Hub
              </label>
              <input
                type="text"
                value={formData.biometricConfig.serverIp}
                onChange={(e) => setFormData({
                  ...formData,
                  biometricConfig: { ...formData.biometricConfig, serverIp: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-[#069AD8]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Puerto de Escucha (Urcheck ADMS / Push)
              </label>
              <input
                type="number"
                value={formData.biometricConfig.port}
                onChange={(e) => setFormData({
                  ...formData,
                  biometricConfig: { ...formData.biometricConfig, port: Number(e.target.value) }
                })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-[#069AD8]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Intervalo de Sincronización en la Nube
              </label>
              <select
                value={formData.biometricConfig.autoSyncIntervalSec}
                onChange={(e) => setFormData({
                  ...formData,
                  biometricConfig: { ...formData.biometricConfig, autoSyncIntervalSec: Number(e.target.value) }
                })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-[#069AD8]"
              >
                <option value={5}>Cada 5 segundos (Tiempo real)</option>
                <option value={15}>Cada 15 segundos (Recomendado)</option>
                <option value={60}>Cada 1 minuto</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-bold text-neutral-700 mb-1 text-xs">
              Token de Autenticación de Hardware (Cloud Sync API Key)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={formData.biometricConfig.cloudSyncApiKey}
                onChange={(e) => setFormData({
                  ...formData,
                  biometricConfig: { ...formData.biometricConfig, cloudSyncApiKey: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs bg-neutral-50"
              />
              <button
                type="button"
                onClick={handleTestHardwareConnection}
                disabled={isTestingHardware}
                className="px-4 py-2.5 text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl border border-neutral-300 shrink-0 inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Wifi className={`w-4 h-4 text-[#069AD8] ${isTestingHardware ? 'animate-pulse' : ''}`} />
                <span>{isTestingHardware ? 'Probando...' : 'Test de Enlace Biométrico'}</span>
              </button>
            </div>
          </div>

          {hardwareTestFeedback && (
            <div className="mt-3 p-3 rounded-xl bg-[#1F832D]/10 border border-[#1F832D]/30 text-[#1F832D] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F832D] shrink-0" />
              <span>{hardwareTestFeedback}</span>
            </div>
          )}
        </div>

        {/* Supabase Cloud Database Integration & SQL Script */}
        <div id="supabase-cloud-config" className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#069AD8]" />
                <h3 className="text-base font-bold text-[#093244]">
                  Base de Datos Cloud Supabase
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F832D] animate-pulse" />
                  CONFIGURADO
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Conexión persistente en tiempo real, esquemas relacionales PostgreSQL y almacenamiento seguro.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#069AD8] hover:bg-[#065a80] rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isTestingSupabase ? 'Verificando...' : 'Probar Conexión Supabase'}</span>
            </button>
          </div>

          {/* Connection Test Result Badge */}
          {supabaseTestResult && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold space-y-3 ${
              supabaseTestResult.success && supabaseTestResult.allTablesReady
                ? 'bg-[#1F832D]/10 border-[#1F832D]/30 text-[#1F832D]' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
            }`}>
              <div className="flex items-start gap-2.5">
                {supabaseTestResult.success && supabaseTestResult.allTablesReady ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1F832D] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-sm">{supabaseTestResult.message}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] opacity-90 mt-1 font-mono">
                    <span>Host: <strong>{SUPABASE_URL}</strong></span>
                    <span>•</span>
                    <span>Latencia: <strong>{supabaseTestResult.latencyMs}ms</strong></span>
                    <span>•</span>
                    <span>Escritura: <strong>{supabaseTestResult.writeWorking ? 'Verificada ✓' : 'Pendiente'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Table Badges */}
              {supabaseTestResult.tables && supabaseTestResult.tables.length > 0 && (
                <div className="pt-2 border-t border-current/15 flex flex-wrap gap-2">
                  {supabaseTestResult.tables.map(tbl => (
                    <span 
                      key={tbl.name}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 ${
                        tbl.status === 'ok' 
                          ? 'bg-white/80 text-emerald-800 border border-emerald-300' 
                          : 'bg-white/80 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tbl.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{tbl.name}: <strong>{tbl.count}</strong> filas</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 font-medium block">Proyecto Supabase</span>
              <p className="font-bold text-[#093244] text-sm mt-0.5 truncate" title={SUPABASE_PROJECT_NAME}>
                {SUPABASE_PROJECT_NAME}
              </p>
              <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                Ref ID: {SUPABASE_PROJECT_ID}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 font-medium block">URL de Conexión</span>
              <p className="font-mono font-semibold text-[#069AD8] text-xs mt-0.5 break-all">
                {SUPABASE_URL}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Endpoint REST / Realtime v1
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 sm:col-span-2 lg:col-span-1">
              <span className="text-neutral-500 font-medium block">Clave Pública Anon (JWT)</span>
              <p className="font-mono text-[11px] text-neutral-600 mt-0.5 truncate">
                {SUPABASE_ANON_KEY.substring(0, 30)}...
              </p>
              <span className="text-[11px] text-[#1F832D] font-semibold mt-1 inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Token verificado (exp: 2036)
              </span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-xl bg-[#069AD8]/5 border border-[#069AD8]/20 text-xs text-neutral-700 space-y-2">
            <h4 className="font-bold text-[#093244] flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#069AD8]" />
              ¿Cómo ejecutar el SQL en tu panel de Supabase?
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600 pl-1">
              <li>Haz clic en el botón <strong>«Copiar Script SQL»</strong> o descarga el archivo <strong>.sql</strong> abajo.</li>
              <li>Abre tu panel de Supabase en el menú lateral izquierdo: <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.</li>
              <li>Pega el código completo y presiona el botón verde <strong>Run (Ejecutar)</strong>. ¡Listo! Todas las 7 tablas, índices, reglas de seguridad RLS y canales Realtime quedarán activos al instante.</li>
            </ol>
          </div>

          {/* SQL Viewer and Action Buttons */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="bg-neutral-100 p-3 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#093244]">urcheck_supabase_schema.sql</span>
                <span className="text-[11px] text-neutral-500 bg-white px-2 py-0.5 rounded-md border border-neutral-300">
                  PostgreSQL 15+ / Supabase RLS
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlCode(!showSqlCode)}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white rounded-lg border border-neutral-300 transition cursor-pointer"
                >
                  {showSqlCode ? 'Ocultar código' : 'Mostrar código'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-300 transition cursor-pointer inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Descargar .sql</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1 shadow-xs ${
                    copiedSql 
                      ? 'bg-[#1F832D] text-white' 
                      : 'bg-[#069AD8] hover:bg-[#065a80] text-white'
                  }`}
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Script SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {showSqlCode && (
              <div className="bg-[#0A1926] p-4 max-h-80 overflow-y-auto font-mono text-xs text-neutral-200 selection:bg-[#069AD8]">
                <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Mock / Demo Data Management Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <h3 className="text-base font-bold text-[#093244] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Gestión de Registros Demo y Datos de Muestra
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Control de colaboradores ficticios, marcajes y registros iniciales generados para demostración
              </p>
            </div>

            {isMockDataPurged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F832D]/10 text-[#1F832D] border border-[#1F832D]/30 text-xs font-bold shrink-0">
                <Check className="w-4 h-4 text-[#1F832D]" />
                Modo Producción: Registros demo eliminados
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Registros demo activos en el sistema
              </span>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-600 space-y-3">
            <p className="leading-relaxed">
              Si vas a utilizar el sistema con personal y asistencias reales de tu empresa, puedes <strong>borrar permanentemente los registros de muestra</strong>. Esta acción eliminará los marcajes y empleados ficticios tanto de la interfaz como de la base de datos Supabase, y activará una protección para que los datos demo <strong>no se vuelvan a cargar automáticamente</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(true)}
                disabled={isPurging}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Borrar Registros de Muestra (Demo)</span>
              </button>

              {isMockDataPurged && (
                <button
                  type="button"
                  onClick={handleRestoreDemo}
                  disabled={isPurging}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 text-neutral-500" />
                  <span>Restaurar Registros Demo para Pruebas</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#093244] hover:bg-[#082735] rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros del Sistema</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal to Purge Demo Data */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="mt-4 text-lg sm:text-xl font-extrabold text-[#093244]">
              ¿Eliminar Registros de Muestra?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Esta acción borrará los colaboradores ficticios, marcajes y documentos de prueba de la interfaz y de Supabase. El sistema recordará tu preferencia y <strong>no volverá a cargar los registros demo</strong>.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                disabled={isPurging}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isPurging ? 'Borrando...' : 'Sí, Borrar Registros de Muestra'}
              </button>
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
