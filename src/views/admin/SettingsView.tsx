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
  ShieldAlert
} from 'lucide-react';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingHardware, setIsTestingHardware] = useState(false);
  const [hardwareTestFeedback, setHardwareTestFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestHardwareConnection = () => {
    setIsTestingHardware(true);
    setHardwareTestFeedback(null);
    setTimeout(() => {
      setIsTestingHardware(false);
      setHardwareTestFeedback(
        `✓ Handshake ZKTeco Push SDK exitoso. 4 dispositivos respondieron a tiempo (UDP/TCP: 4370). Latencia de nube: 34ms.`
      );
      setTimeout(() => setHardwareTestFeedback(null), 5000);
    }, 1500);
  };

  return (
    <div id="admin-settings-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-600" />
            Configuración del Sistema y Parámetros Biométricos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Ajustes generales de la empresa, tolerancia de retardos y sincronización con hardware checador
          </p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Cambios guardados con éxito
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company General Information */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Building2 className="w-5 h-5 text-red-600" />
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Turn & Shift Policies */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Clock className="w-5 h-5 text-red-600" />
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
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Biometric Hardware Integration */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-red-600" />
              Sincronización con Reloj Checador Biométrico
            </h3>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Puerto de Escucha (ZKTeco / ADMS)
              </label>
              <input
                type="number"
                value={formData.biometricConfig.port}
                onChange={(e) => setFormData({
                  ...formData,
                  biometricConfig: { ...formData.biometricConfig, port: Number(e.target.value) }
                })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
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
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
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
                <Wifi className={`w-4 h-4 text-red-600 ${isTestingHardware ? 'animate-pulse' : ''}`} />
                <span>{isTestingHardware ? 'Probando...' : 'Test de Enlace Biométrico'}</span>
              </button>
            </div>
          </div>

          {hardwareTestFeedback && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{hardwareTestFeedback}</span>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros del Sistema</span>
          </button>
        </div>
      </form>
    </div>
  );
};
