import React, { useState, useRef, useEffect } from 'react';
import { AttendanceRecord, BiometricMethod, PunchType, UserProfile } from '../../types';
import { 
  Fingerprint, 
  ScanFace, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Camera, 
  RefreshCw,
  Zap,
  Sparkles,
  QrCode
} from 'lucide-react';

interface BiometricPunchViewProps {
  currentUser: UserProfile;
  attendanceRecords: AttendanceRecord[];
  onRecordPunch: (newRecord: AttendanceRecord) => void;
}

export const BiometricPunchView: React.FC<BiometricPunchViewProps> = ({
  currentUser,
  attendanceRecords,
  onRecordPunch,
}) => {
  const [selectedPunchType, setSelectedPunchType] = useState<PunchType>('entry');
  const [selectedMethod, setSelectedMethod] = useState<BiometricMethod>('facial');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [recentVoucher, setRecentVoucher] = useState<AttendanceRecord | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-MX'));

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-MX'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera handling for facial recognition
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (selectedMethod === 'facial' && cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.log('Camera not accessed or denied, falling back to simulated biometric view');
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedMethod, cameraActive]);

  const handleStartBiometricScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completePunch();
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const completePunch = () => {
    setIsScanning(false);
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Check if late based on shift
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const isLate = selectedPunchType === 'entry' && (currentHour > 8 || (currentHour === 8 && currentMin > 10));

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeCode: currentUser.employeeId || 'EMP-7742',
      employeeAvatar: currentUser.avatar,
      branchId: 'suc-01',
      branchName: currentUser.branch || 'Corporativo Reforma',
      timestamp: timeString,
      type: selectedPunchType,
      method: selectedMethod,
      status: isLate ? 'late' : 'on_time',
      biometricDeviceId: 'Urcheck BioCloud Facial & RFID Terminal',
      verificationScore: 99.6,
      hashAudit: `SHA256: ${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
    };

    onRecordPunch(newRecord);
    setRecentVoucher(newRecord);
  };

  const myRecordsToday = attendanceRecords.filter(r => r.employeeId === currentUser.id);

  return (
    <div id="employee-biometric-punch-view" className="max-w-4xl mx-auto space-y-6">
      
      {/* Live Biometric Clock & Server Time Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0871A0] flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#138128] animate-ping" />
            Terminal Checadora Urcheck BioCloud Activa
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
            Registro Oficial de Asistencia
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            {currentUser.branch} • Folios auditables sincronizados en tiempo real
          </p>
        </div>

        <div className="bg-[#0A3142] text-white px-5 py-3 rounded-2xl border border-[#0A3142] shadow-md text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300 block">
            Hora Oficial Servidor
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-emerald-400">
            {currentTime}
          </span>
        </div>
      </div>

      {/* Step 1: Select Event Punch Type */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">
          1. Selecciona el Tipo de Marcaje
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'entry', label: 'Entrada a Laborar', icon: '🟢', color: 'border-emerald-500 bg-emerald-50/50' },
            { id: 'lunch_out', label: 'Salida Almuerzo', icon: '🟡', color: 'border-amber-500 bg-amber-50/50' },
            { id: 'lunch_in', label: 'Regreso Almuerzo', icon: '🔵', color: 'border-[#0871A0] bg-blue-50/50' },
            { id: 'exit', label: 'Salida de Turno', icon: '⚪', color: 'border-neutral-800 bg-neutral-100' },
          ].map(evt => (
            <button
              key={evt.id}
              onClick={() => setSelectedPunchType(evt.id as PunchType)}
              type="button"
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 ${
                selectedPunchType === evt.id
                  ? `${evt.color} text-neutral-900 shadow-xs scale-102 ring-2 ring-[#0871A0] ring-offset-1`
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <span className="text-xl">{evt.icon}</span>
              <span>{evt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Biometric Method */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">
          2. Método de Verificación Biométrico
        </label>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'facial', label: 'Reconocimiento Facial', icon: ScanFace },
            { id: 'fingerprint', label: 'Huella Dactilar', icon: Fingerprint },
            { id: 'rfid', label: 'Tarjeta RFID / PIN', icon: CreditCard },
          ].map(meth => {
            const Icon = meth.icon;
            const isSelected = selectedMethod === meth.id;
            return (
              <button
                key={meth.id}
                onClick={() => setSelectedMethod(meth.id as BiometricMethod)}
                type="button"
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? 'border-[#0871A0] bg-[#0871A0]/10 text-[#0871A0] font-bold shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-7 h-7 ${isSelected ? 'text-[#0871A0]' : 'text-neutral-500'}`} />
                <span className="text-xs sm:text-sm">{meth.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Interactive Biometric Scanner Device */}
      <div className="bg-[#0A3142] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-[#082735] relative overflow-hidden">
        
        {/* Decorative Hardware Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#138128] animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase text-neutral-300">
              Terminal: Urcheck BioCloud Multi-Sensor V5
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
            SENSOR ONLINE
          </span>
        </div>

        {/* Biometric Interactive Center Stage */}
        <div className="my-8 flex flex-col items-center justify-center">
          
          {/* Method: Facial Scan */}
          {selectedMethod === 'facial' && (
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-dashed border-[#0871A0] p-2 flex items-center justify-center bg-black/30 overflow-hidden shadow-inner">
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="relative flex flex-col items-center justify-center">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-neutral-700"
                  />
                  {/* Facial landmark points simulation */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-28 h-36 border-2 border-emerald-400 rounded-3xl animate-pulse flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex justify-between">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Laser Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0871A0] to-transparent shadow-[0_0_15px_#0871A0] animate-bounce top-1/2" />
              )}
            </div>
          )}

          {/* Method: Fingerprint Scan */}
          {selectedMethod === 'fingerprint' && (
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border-2 border-white/20 bg-black/40 flex items-center justify-center shadow-inner overflow-hidden">
              <Fingerprint className={`w-28 h-28 ${isScanning ? 'text-emerald-400 scale-105' : 'text-neutral-400'} transition-all duration-300`} />
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-[#138128] shadow-[0_0_15px_#138128] animate-bounce" />
              )}
            </div>
          )}

          {/* Method: RFID Tap */}
          {selectedMethod === 'rfid' && (
            <div className="relative w-56 h-36 rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-black/50 to-neutral-800/60 flex flex-col items-center justify-center p-4 shadow-xl">
              <CreditCard className={`w-14 h-14 ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
              <span className="font-mono text-xs text-neutral-300 mt-2 font-bold tracking-widest">
                TARJETA PROXIMIDAD RFID
              </span>
              <span className="text-[10px] text-neutral-400">ID: {currentUser.employeeId || 'EMP-7742'}</span>
            </div>
          )}

          {/* Status & Feedback */}
          <div className="mt-5 text-center">
            <span className="text-sm font-bold text-neutral-200 block">
              {isScanning ? 'Verificando datos biométricos en la nube Urcheck...' : `Colaborador: ${currentUser.name}`}
            </span>
            <span className="text-xs text-neutral-400">
              {selectedMethod === 'facial' && 'Mantén el rostro centrado en el marco óptico'}
              {selectedMethod === 'fingerprint' && 'Coloca tu dedo firmemente sobre el lector óptico'}
              {selectedMethod === 'rfid' && 'Acerca tu gafete institucional al sensor'}
            </span>
          </div>

          {/* Progress bar during scan */}
          {isScanning && (
            <div className="w-64 bg-neutral-800 rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="bg-[#138128] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
          {selectedMethod === 'facial' && (
            <button
              onClick={() => setCameraActive(!cameraActive)}
              type="button"
              className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-[#0871A0]" />
              <span>{cameraActive ? 'Desactivar Cámara' : 'Activar Cámara Web'}</span>
            </button>
          )}

          <button
            id="btn-trigger-punch"
            onClick={handleStartBiometricScan}
            disabled={isScanning}
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#138128] hover:bg-[#0e661f] active:scale-95 text-white font-black text-sm tracking-wide shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>{isScanning ? 'ESCANEANDO BIOMETRÍA...' : 'CONFIRMAR MARCAJE DIGITAL'}</span>
          </button>
        </div>
      </div>

      {/* Digital Receipt / Comprobante Inmediato */}
      {recentVoucher && (
        <div className="bg-white rounded-2xl border-2 border-[#138128] p-6 shadow-md animate-in fade-in">
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#138128]/10 text-[#138128] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#138128]">
                  ¡Marcaje Registrado y Sincronizado Exitosamente!
                </span>
                <h3 className="text-lg font-bold text-[#0A3142]">
                  Comprobante Laboral Digital Urcheck
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#0A3142] text-white font-mono">
              FOLIO: {recentVoucher.hashAudit}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block">Colaborador:</span>
              <span className="font-bold text-neutral-900 text-sm">{recentVoucher.employeeName}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Tipo Marcaje:</span>
              <span className="font-bold text-neutral-900 text-sm capitalize">{recentVoucher.type}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Hora Servidor:</span>
              <span className="font-bold font-mono text-neutral-900 text-sm">{recentVoucher.timestamp}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Estatus de Puntualidad:</span>
              <span className={`font-bold text-sm ${recentVoucher.status === 'on_time' ? 'text-[#138128]' : 'text-amber-600'}`}>
                {recentVoucher.status === 'on_time' ? 'A Tiempo' : 'Retardo Registrado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My Today's Punches History */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#0A3142] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0871A0]" />
          Mis Marcajes Registrados Hoy
        </h3>

        <div className="divide-y divide-neutral-100">
          {myRecordsToday.length > 0 ? (
            myRecordsToday.map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-neutral-900">{r.timestamp}</span>
                  <span className="capitalize font-semibold text-neutral-700">{r.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-neutral-500 text-xs">{r.method}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    r.status === 'on_time' ? 'bg-[#138128]/10 text-[#138128]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status === 'on_time' ? 'A Tiempo' : 'Retardo'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-xs py-3">
              Aún no tienes registros de asistencia en la jornada de hoy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
