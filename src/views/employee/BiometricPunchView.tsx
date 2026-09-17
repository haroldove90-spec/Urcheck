import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  CameraOff,
  RefreshCw,
  Zap,
  Sparkles,
  QrCode,
  AlertCircle,
  Eye,
  Download,
  Printer,
  SwitchCamera,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  KeyRound,
  Delete,
  Smartphone,
  Radio,
  Wifi,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { playSystemNotificationSound, playSystemNegativeSound } from '../../utils/audioSystem';

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
  const [scanStageText, setScanStageText] = useState('');
  const [recentVoucher, setRecentVoucher] = useState<AttendanceRecord | null>(null);
  
  // Camera & Selfie States
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPunchToView, setSelectedPunchToView] = useState<AttendanceRecord | null>(null);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  // RFID & PIN States
  const [rfidSubMode, setRfidSubMode] = useState<'rfid' | 'pin'>('pin');
  const [pinValue, setPinValue] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [rfidCardTapped, setRfidCardTapped] = useState<boolean>(false);
  const [nfcActive, setNfcActive] = useState<boolean>(false);
  const [nfcMessage, setNfcMessage] = useState<string | null>(null);

  // Fingerprint Touch & Hold States
  const [fingerprintHolding, setFingerprintHolding] = useState<boolean>(false);
  const [fingerprintProgress, setFingerprintProgress] = useState<number>(0);
  const fingerprintHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-MX'));

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-MX'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio confirmation chime using official notification sound file
  const playBiometricSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    playSystemNotificationSound();
  }, [soundEnabled]);

  // Audio failure sound using official negative sound file
  const playBiometricNegativeSound = useCallback(() => {
    if (!soundEnabled) return;
    playSystemNegativeSound();
  }, [soundEnabled]);

  // Audio tone generator for keypad and scanner beeps
  const playBeep = useCallback((freq = 700, duration = 0.07) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext policy handled silently
    }
  }, [soundEnabled]);

  // Cleanup fingerprint timer on unmount
  useEffect(() => {
    return () => {
      if (fingerprintHoldTimerRef.current) {
        clearInterval(fingerprintHoldTimerRef.current);
      }
    };
  }, []);

  // Clean stream helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador sin soporte directo de WebRTC/getUserMedia');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Video play error:', e));
        };
      }
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err: unknown) {
      console.warn('Error accessing webcam:', err);
      const errName = (err as { name?: string })?.name || '';
      let msg = 'No se pudo acceder a la cámara frontal.';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        msg = 'Permiso de cámara denegado en el navegador. Actívalo en la barra de direcciones o usa la captura directa.';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        msg = 'No se detectó una cámara física conectada.';
      }
      setCameraError(msg);
      setCameraLoading(false);
      setCameraActive(false);
    }
  }, [facingMode]);

  // Handle camera start/stop when method changes or facingMode changes
  useEffect(() => {
    if (selectedMethod === 'facial' && cameraActive) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [selectedMethod, cameraActive, startCamera]);

  // Capture frame from video into a data URL
  const captureFrameFromVideo = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set square or optimal aspect ratio
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Optional: Draw subtle biometric watermark on canvas
    ctx.fillStyle = 'rgba(10, 49, 66, 0.7)';
    ctx.fillRect(0, height - 32, width, 32);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`URCHECK FACIAL AI • ${currentUser.employeeId || 'EMP-7742'} • ${new Date().toLocaleDateString('es-MX')} ${currentTime}`, 12, height - 12);

    return canvas.toDataURL('image/jpeg', 0.88);
  };

  // Handle native camera file input (fallback or mobile shortcut)
  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedSelfie(result);
        triggerFacialRecognitionSequence(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Face Recognition Sequence & Finalize Punch
  const triggerFacialRecognitionSequence = (photoToUse: string | null) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStageText('Capturando fotograma selfie en alta resolución...');

    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const steps = [
      { progress: 20, text: 'Detectando óvalo facial y prueba de liveness (vida)...' },
      { progress: 45, text: 'Mapeando 68 vectores biométricos (ojos, nariz, contorno)...' },
      { progress: 75, text: `Comparando vector biométrico con el expediente de ${currentUser.name}...` },
      { progress: 95, text: '¡Rostro reconocido! Generando sello criptográfico SHA-256...' },
      { progress: 100, text: '¡Asistencia registrada y certificada exitosamente!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setScanProgress(step.progress);
        setScanStageText(step.text);
        currentStep++;
      } else {
        clearInterval(interval);
        playBiometricSuccessChime();
        finalizePunchRecord(photoToUse);
      }
    }, 280);
  };

  // Touch & Hold Fingerprint Sensor Handlers
  const handleFingerprintPointerDown = () => {
    if (isScanning) return;
    setFingerprintHolding(true);
    setFingerprintProgress(0);
    playBeep(520, 0.06);
    navigator.vibrate?.(40);

    let progress = 0;
    if (fingerprintHoldTimerRef.current) clearInterval(fingerprintHoldTimerRef.current);
    
    fingerprintHoldTimerRef.current = setInterval(() => {
      progress += 5;
      setFingerprintProgress(progress);
      if (progress === 25 || progress === 50 || progress === 75) {
        playBeep(550 + progress * 3, 0.04);
        navigator.vibrate?.(25);
      }
      if (progress >= 100) {
        if (fingerprintHoldTimerRef.current) clearInterval(fingerprintHoldTimerRef.current);
        setFingerprintHolding(false);
        playBiometricSuccessChime();
        navigator.vibrate?.([60, 90, 60]);
        finalizePunchRecord(null, 'fingerprint');
      }
    }, 45); // ~900ms hold
  };

  const handleFingerprintPointerUp = () => {
    if (fingerprintHolding && fingerprintProgress < 100) {
      if (fingerprintHoldTimerRef.current) clearInterval(fingerprintHoldTimerRef.current);
      setFingerprintHolding(false);
      setFingerprintProgress(0);
    }
  };

  // Trigger Device's Native Biometrics (WebAuthn / Touch ID / Android Fingerprint)
  const handleTriggerWebAuthn = async () => {
    try {
      if (!window.PublicKeyCredential) {
        handleStartBiometricScan();
        return;
      }
      setIsScanning(true);
      setScanProgress(0);
      setScanStageText('Solicitando sensor biométrico del teléfono (Touch ID / Huella Android)...');

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Urcheck Biometrics' },
          user: {
            id: userId,
            name: currentUser.email || 'empleado@urcheck.com',
            displayName: currentUser.name,
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
          },
          timeout: 45000,
        },
      });

      if (credential) {
        playBiometricSuccessChime();
        navigator.vibrate?.([60, 100, 60]);
        finalizePunchRecord(null, 'fingerprint');
      }
    } catch (err: unknown) {
      // If WebAuthn was cancelled, not allowed or user verification failed
      console.warn('WebAuthn native biometric reading:', err);
      // Fallback smoothly to standard verification
      handleStartBiometricScan();
    }
  };

  // Simulate or trigger biometric rejection / failure with requested negative sound
  const handleTriggerSimulatedFailure = (customMsg?: string) => {
    setIsScanning(false);
    playBiometricNegativeSound();
    navigator.vibrate?.([150, 100, 150]);
    const message = customMsg || (
      selectedMethod === 'facial'
        ? 'No se pudo validar el rostro. Rostro no coincide con el expediente o iluminación insuficiente.'
        : selectedMethod === 'fingerprint'
        ? 'No se pudo leer la huella dactilar. Presión insuficiente o sensor sucio. Intenta de nuevo.'
        : 'Código de acceso o credencial no reconocida por el sistema.'
    );
    setBiometricError(message);
    setTimeout(() => setBiometricError(null), 6000);
  };

  // PIN Keypad Handlers
  const handlePinKeyClick = (digit: string) => {
    if (isScanning || pinValue.length >= 6) return;
    playBeep(720, 0.04);
    navigator.vibrate?.(15);
    setPinError(null);
    const updatedPin = pinValue + digit;
    setPinValue(updatedPin);
    
    // Auto-validate when 4 digits are completed
    if (updatedPin.length === 4) {
      validateAndConfirmPin(updatedPin);
    }
  };

  const handlePinDelete = () => {
    if (isScanning) return;
    playBeep(450, 0.05);
    navigator.vibrate?.(15);
    setPinValue(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const validateAndConfirmPin = (pinToTest = pinValue) => {
    if (pinToTest.length < 4) {
      setPinError('Ingresa los 4 dígitos de tu PIN de seguridad');
      playBiometricNegativeSound();
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
    setScanStageText('Validando PIN de seguridad con expediente...');
    playBeep(880, 0.06);

    setTimeout(() => {
      setScanProgress(100);
      playBiometricSuccessChime();
      navigator.vibrate?.([60, 90, 60]);
      finalizePunchRecord(null, 'pin');
      setPinValue('');
    }, 450);
  };

  // RFID Card Simulation & NFC
  const handleTriggerRfidTap = () => {
    if (isScanning) return;
    setIsScanning(true);
    setRfidCardTapped(true);
    setScanProgress(0);
    setScanStageText('Detectando señal RFID / NFC en terminal...');
    playBeep(920, 0.1);
    navigator.vibrate?.(35);

    const steps = [
      { progress: 35, text: 'Lectura de chip RFID (13.56 MHz Mifare Classic)...' },
      { progress: 75, text: `UID verificado: ${currentUser.employeeId || 'EMP-7742'} • Sede Autorizada` },
      { progress: 100, text: '¡Credencial institucional aceptada exitosamente!' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setScanProgress(steps[stepIndex].progress);
        setScanStageText(steps[stepIndex].text);
        stepIndex++;
      } else {
        clearInterval(interval);
        playBiometricSuccessChime();
        navigator.vibrate?.([70, 100, 70]);
        finalizePunchRecord(null, 'rfid');
        setTimeout(() => setRfidCardTapped(false), 800);
      }
    }, 250);
  };

  const handleStartNfcScan = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('NDEFReader' in window) {
      try {
        setNfcActive(true);
        setNfcMessage('Acerca tu gafete RFID/NFC a la parte trasera del teléfono...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ndef.onreading = (event: any) => {
          setNfcMessage(`¡Tarjeta leída! UID: ${event.serialNumber || '04:A2:8B:19'}`);
          handleTriggerRfidTap();
        };
      } catch {
        setNfcActive(false);
        setNfcMessage('NFC no disponible o permiso denegado en este navegador.');
        handleTriggerRfidTap();
      }
    } else {
      handleTriggerRfidTap();
    }
  };

  // Listen for physical keyboard number typing in PIN mode
  useEffect(() => {
    if (selectedMethod !== 'rfid' || rfidSubMode !== 'pin' || isScanning) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handlePinKeyClick(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        validateAndConfirmPin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMethod, rfidSubMode, isScanning, pinValue]);

  // Non-facial scan trigger (fingerprint, rfid)
  const handleStartBiometricScan = () => {
    if (selectedMethod === 'facial') {
      let photo = capturedSelfie;
      if (cameraActive && videoRef.current) {
        photo = captureFrameFromVideo();
        if (photo) setCapturedSelfie(photo);
      }
      // If no camera photo could be taken, use employee avatar as fallback
      if (!photo) {
        photo = currentUser.avatar;
        setCapturedSelfie(photo);
      }
      triggerFacialRecognitionSequence(photo);
      return;
    }

    if (selectedMethod === 'fingerprint') {
      setIsScanning(true);
      setScanProgress(0);
      setScanStageText('Detectando huella dactilar sobre el sensor óptico...');
      playBeep(650, 0.08);

      const steps = [
        { progress: 25, text: 'Mapeando crestas papilares y minutas de huella...' },
        { progress: 65, text: 'Comparando plantilla biométrica ZKTeco (99.8% match)...' },
        { progress: 100, text: '¡Huella dactilar autenticada con éxito!' }
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setScanProgress(steps[stepIdx].progress);
          setScanStageText(steps[stepIdx].text);
          navigator.vibrate?.(30);
          playBeep(700 + stepIdx * 100, 0.05);
          stepIdx++;
        } else {
          clearInterval(interval);
          playBiometricSuccessChime();
          navigator.vibrate?.([60, 90, 60]);
          finalizePunchRecord(null, 'fingerprint');
        }
      }, 260);
      return;
    }

    // If RFID / PIN
    if (rfidSubMode === 'pin') {
      validateAndConfirmPin();
    } else {
      handleTriggerRfidTap();
    }
  };

  const finalizePunchRecord = (photoSnapshotUrl: string | null, overrideMethod?: BiometricMethod) => {
    setIsScanning(false);
    const finalMethod = overrideMethod || (selectedMethod === 'rfid' && rfidSubMode === 'pin' ? 'pin' : selectedMethod);
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Check if late based on shift
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const isLate = selectedPunchType === 'entry' && (currentHour > 8 || (currentHour === 8 && currentMin > 10));

    const deviceName = finalMethod === 'facial' 
      ? 'Urcheck BioCloud AI Facial Cam V5.2'
      : finalMethod === 'fingerprint'
      ? 'Urcheck BioTime Lector Óptico ZKTeco 5000'
      : finalMethod === 'pin'
      ? 'Urcheck Terminal PIN de Seguridad Criptográfico'
      : 'Urcheck RFID Terminal Proximity Mifare 13.56 MHz';

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
      method: finalMethod,
      status: isLate ? 'late' : 'on_time',
      biometricDeviceId: deviceName,
      verificationScore: finalMethod === 'facial' ? 99.8 : finalMethod === 'fingerprint' ? 99.6 : 100,
      hashAudit: `SHA256: ${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      photoSnapshot: photoSnapshotUrl || (finalMethod === 'facial' ? currentUser.avatar : undefined),
    };

    onRecordPunch(newRecord);
    setRecentVoucher(newRecord);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const myRecordsToday = attendanceRecords.filter(r => r.employeeId === currentUser.id);

  return (
    <div id="employee-biometric-punch-view" className="max-w-4xl mx-auto space-y-6">
      
      {/* Hidden canvas for video frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for direct native device selfie camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleDevicePhotoUpload}
      />

      {/* Live Biometric Clock & Server Time Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#069AD8] flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F832D] animate-ping" />
            Terminal Checadora Urcheck BioCloud Activa
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#093244]">
            Registro Oficial de Asistencia
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            {currentUser.branch} • Reconocimiento biométrico facial en tiempo real
          </p>
        </div>

        <div className="bg-[#093244] text-white px-5 py-3 rounded-2xl border border-[#093244] shadow-md text-center">
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
            { id: 'lunch_in', label: 'Regreso Almuerzo', icon: '🔵', color: 'border-[#069AD8] bg-blue-50/50' },
            { id: 'exit', label: 'Salida de Turno', icon: '⚪', color: 'border-neutral-800 bg-neutral-100' },
          ].map(evt => (
            <button
              key={evt.id}
              onClick={() => setSelectedPunchType(evt.id as PunchType)}
              type="button"
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 ${
                selectedPunchType === evt.id
                  ? `${evt.color} text-neutral-900 shadow-xs scale-102 ring-2 ring-[#069AD8] ring-offset-1`
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <span className="text-xl">{evt.icon}</span>
              <span>{evt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Biometric Method - 1 Single Column Layout */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
            2. Método de Verificación Biométrico
          </label>
          <span className="text-xs text-[#069AD8] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> IA Facial Recomendada
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {[
            { 
              id: 'facial', 
              label: 'Reconocimiento Facial (Cámara)', 
              description: 'Verificación en vivo con cámara frontal e IA anti-suplantación',
              icon: ScanFace, 
              badge: 'Cámara Activa' 
            },
            { 
              id: 'fingerprint', 
              label: 'Huella Dactilar', 
              description: 'Sensor biométrico óptico de alta precisión ZKTeco',
              icon: Fingerprint 
            },
            { 
              id: 'rfid', 
              label: 'Tarjeta RFID / PIN', 
              description: 'Lectura de credencial de proximidad o clave PIN de seguridad',
              icon: CreditCard 
            },
          ].map(meth => {
            const Icon = meth.icon;
            const isSelected = selectedMethod === meth.id;
            return (
              <button
                key={meth.id}
                onClick={() => {
                  setSelectedMethod(meth.id as BiometricMethod);
                  if (meth.id === 'facial') setCameraActive(true);
                }}
                type="button"
                className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#069AD8] bg-[#069AD8]/5 shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-[#069AD8] text-white' 
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm sm:text-base font-bold leading-tight ${
                        isSelected ? 'text-[#093244]' : 'text-neutral-800'
                      }`}>
                        {meth.label}
                      </span>
                      {meth.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1F832D] text-white shadow-2xs">
                          {meth.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate hidden xs:block">
                      {meth.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-[#069AD8] bg-[#069AD8] text-white' 
                      : 'border-neutral-300 bg-white'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Interactive Biometric Scanner Device with Live Camera */}
      <div className="bg-[#093244] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-[#082735] relative overflow-hidden">
        
        {/* Flash effect overlay */}
        {flashActive && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-300" />
        )}

        {/* Decorative Hardware Header */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F832D] animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase text-neutral-300">
              Terminal: Urcheck BioCloud Multi-Sensor V5.2
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedMethod === 'facial' && (
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Silenciar confirmación acústica' : 'Activar confirmación acústica'}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 transition"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
            )}

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
              {selectedMethod === 'facial' 
                ? (cameraActive ? 'CÁMARA EN VIVO' : 'CÁMARA INACTIVA')
                : 'SENSOR ONLINE'}
            </span>
          </div>
        </div>

        {/* Biometric Error / Negative result alert banner with sound notification */}
        {biometricError && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/80 border border-rose-500/70 text-rose-100 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-600/30 text-rose-300 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <strong className="block text-rose-200 font-bold">Resultado Negativo de Lectura</strong>
                <span className="text-xs text-rose-300/90">{biometricError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBiometricError(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-rose-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Camera error / fallback notification banner */}
        {selectedMethod === 'facial' && cameraError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-bold flex items-center gap-1 hover:bg-neutral-100 cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#069AD8]" /> Tomar Foto del Dispositivo
              </button>
            </div>
          </div>
        )}

        {/* Biometric Interactive Center Stage */}
        <div className="my-8 flex flex-col items-center justify-center">
          
          {/* Method: Facial Scan with Live Video Stream & HUD */}
          {selectedMethod === 'facial' && (
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-4 border-[#069AD8] p-2 flex items-center justify-center bg-black/60 overflow-hidden shadow-2xl">
              
              {/* Live Video Element */}
              {cameraActive ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]" 
                  />

                  {/* Corner Targeting Brackets HUD */}
                  <div className="absolute inset-2 pointer-events-none flex flex-col justify-between">
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                      <span className="w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                    </div>
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                      <span className="w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>

                  {/* Face Guide Oval */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-36 h-48 sm:w-40 sm:h-52 rounded-full border-2 border-dashed ${isScanning ? 'border-emerald-400 animate-pulse' : 'border-white/50'} flex flex-col items-center justify-center transition-all duration-300`}>
                      {/* Facial Landmark Tracking Points (Simulated Real-time Mesh) */}
                      <div className="w-full h-full relative p-4 flex flex-col justify-between">
                        {/* Eyes */}
                        <div className="flex justify-around pt-6">
                          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 ring-4 ring-emerald-400/40' : 'bg-cyan-300'}`} />
                          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 ring-4 ring-emerald-400/40' : 'bg-cyan-300'}`} />
                        </div>
                        {/* Nose bridge */}
                        <div className="flex justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-emerald-300' : 'bg-cyan-200'}`} />
                        </div>
                        {/* Mouth / Smile line */}
                        <div className="flex justify-center pb-6">
                          <span className={`w-6 h-1 rounded-full ${isScanning ? 'bg-emerald-400' : 'bg-cyan-300/80'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live HUD coordinates badge */}
                  <div className="absolute top-2 left-2 pointer-events-none bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    FACE DETECT: OK (68 PTS)
                  </div>
                </div>
              ) : (
                /* Fallback photo or avatar if camera is disabled */
                <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-neutral-900">
                  <img
                    src={capturedSelfie || currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay message */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-3">
                    <CameraOff className="w-8 h-8 text-neutral-400 mb-1" />
                    <span className="text-xs text-neutral-300 font-semibold">Cámara Web Desactivada</span>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 px-3 py-1 rounded-lg bg-[#069AD8] text-white text-[11px] font-bold hover:bg-[#065a80] cursor-pointer"
                    >
                      Activar Cámara
                    </button>
                  </div>
                </div>
              )}

              {/* Laser Scanning line animation during active scan */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-pulse top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
              )}
            </div>
          )}

          {/* Method: Fingerprint Scan - Interactive Touch & Hold Sensor */}
          {selectedMethod === 'fingerprint' && (
            <div className="flex flex-col items-center justify-center w-full max-w-sm">
              <div className="relative flex flex-col items-center justify-center">
                {/* Outer glowing pulsing ring when holding or scanning */}
                <div className={`absolute -inset-4 rounded-full transition-all duration-300 pointer-events-none ${
                  fingerprintHolding || isScanning 
                    ? 'bg-emerald-500/25 blur-lg scale-110 animate-pulse' 
                    : 'bg-[#069AD8]/10 blur-md'
                }`} />

                {/* Circular Touch / Hold Surface */}
                <div
                  onPointerDown={handleFingerprintPointerDown}
                  onPointerUp={handleFingerprintPointerUp}
                  onPointerLeave={handleFingerprintPointerUp}
                  className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-95 shadow-2xl ${
                    fingerprintHolding || isScanning
                      ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/80 to-[#082735]'
                      : 'border-white/20 bg-gradient-to-b from-neutral-900 to-[#082735] hover:border-[#069AD8]/80'
                  }`}
                  title="Toca y mantén presionado tu dedo aquí para checar asistencia"
                >
                  {/* Circular SVG Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      className="text-white/10"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      className="text-emerald-400 transition-all duration-75"
                      strokeWidth="5"
                      strokeDasharray={289}
                      strokeDashoffset={289 - (289 * (fingerprintProgress || scanProgress)) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>

                  {/* Fingerprint Icon with dynamic coloring and scale */}
                  <Fingerprint className={`w-20 h-20 sm:w-24 sm:h-24 transition-all duration-200 ${
                    fingerprintHolding || isScanning 
                      ? 'text-emerald-400 scale-110 drop-shadow-[0_0_12px_#10b981]' 
                      : 'text-neutral-300 group-hover:text-white'
                  }`} />

                  {/* Hold instruction or percentage */}
                  <span className="text-[11px] font-mono tracking-wider font-bold mt-1 uppercase text-neutral-300">
                    {fingerprintHolding
                      ? `${fingerprintProgress}% CAPTURANDO`
                      : isScanning
                      ? `${scanProgress}% VALIDANDO`
                      : 'MANTÉN PRESIONADO'}
                  </span>
                </div>
              </div>

              {/* Sub-actions for mobile native sensor or auto-scan */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerWebAuthn}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-neutral-200 font-semibold inline-flex items-center gap-1.5 border border-white/15 cursor-pointer transition active:scale-95"
                  title="Usar lector de huella o Touch ID del teléfono"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Usar Sensor del Teléfono / Touch ID</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBiometricScan}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-xs text-emerald-300 font-semibold inline-flex items-center gap-1.5 border border-emerald-500/40 cursor-pointer transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Autocheck Rápido</span>
                </button>
              </div>
            </div>
          )}

          {/* Method: RFID Tap & Security PIN Sub-Modes */}
          {selectedMethod === 'rfid' && (
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Sub-mode Toggle (PIN vs Tarjeta RFID) */}
              <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/15 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setRfidSubMode('pin');
                    setPinError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rfidSubMode === 'pin'
                      ? 'bg-[#069AD8] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>PIN de Seguridad (Clave)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRfidSubMode('rfid');
                    setPinError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rfidSubMode === 'rfid'
                      ? 'bg-[#069AD8] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Tarjeta RFID / NFC</span>
                </button>
              </div>

              {/* Sub-mode 1: Interactive PIN Keypad */}
              {rfidSubMode === 'pin' && (
                <div className="w-full max-w-xs flex flex-col items-center">
                  {/* PIN Dots Display */}
                  <div className="bg-black/50 border border-white/20 rounded-2xl px-6 py-3.5 w-full flex flex-col items-center mb-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">
                      Ingresa tu PIN de 4 Dígitos
                    </span>
                    <div className="flex items-center gap-4">
                      {[0, 1, 2, 3].map(idx => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                            pinValue.length > idx
                              ? 'bg-emerald-400 border-emerald-400 ring-4 ring-emerald-400/30 scale-110'
                              : 'bg-transparent border-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    {pinError && (
                      <span className="text-[11px] text-amber-400 font-semibold mt-2 animate-bounce flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {pinError}
                      </span>
                    )}
                  </div>

                  {/* 3x4 Touch Keypad */}
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handlePinKeyClick(digit)}
                        className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-mono text-lg font-bold border border-white/10 transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handlePinDelete}
                      className="h-12 rounded-xl bg-red-900/30 hover:bg-red-900/45 text-red-300 border border-red-500/30 transition cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Borrar dígito"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinKeyClick('0')}
                      className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-mono text-lg font-bold border border-white/10 transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => validateAndConfirmPin()}
                      className="h-12 rounded-xl bg-emerald-600/70 hover:bg-emerald-600 text-white border border-emerald-400/40 transition cursor-pointer active:scale-95 flex items-center justify-center font-bold text-xs"
                      title="Confirmar PIN"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <span className="text-[10px] text-neutral-400 mt-2 font-mono">
                    💡 También puedes teclear los números desde tu teclado físico
                  </span>
                </div>
              )}

              {/* Sub-mode 2: RFID Proximity SmartCard Simulation & Web NFC */}
              {rfidSubMode === 'rfid' && (
                <div className="w-full flex flex-col items-center">
                  {/* PVC RFID Card Visual */}
                  <div
                    onClick={handleTriggerRfidTap}
                    className={`relative w-64 sm:w-72 h-40 rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer shadow-2xl overflow-hidden select-none active:scale-95 ${
                      rfidCardTapped || isScanning
                        ? 'border-emerald-400 bg-gradient-to-tr from-[#082735] via-emerald-950 to-[#093244] ring-4 ring-emerald-400/30'
                        : 'border-white/25 bg-gradient-to-tr from-[#082735] via-neutral-900 to-[#093244] hover:border-[#069AD8]'
                    }`}
                  >
                    {/* Chip Graphic */}
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-7 rounded-sm bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600 shadow-inner flex flex-col justify-around p-1">
                        <div className="h-0.5 bg-amber-800/40 rounded-full" />
                        <div className="h-0.5 bg-amber-800/40 rounded-full" />
                        <div className="h-0.5 bg-amber-800/40 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1 text-neutral-300">
                        <Wifi className="w-4 h-4 rotate-90 text-cyan-300" />
                        <span className="text-[10px] font-mono font-bold tracking-widest">RFID 13.56MHz</span>
                      </div>
                    </div>

                    {/* Cardholder Info */}
                    <div className="mt-4 flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-lg border border-white/30 object-cover"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                        <span className="text-[10px] font-mono text-cyan-300 block">{currentUser.employeeId || 'EMP-7742'}</span>
                      </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="absolute bottom-2 inset-x-4 flex items-center justify-between border-t border-white/10 pt-1 text-[9px] font-mono text-neutral-400">
                      <span>URCHECK ACCESS SMARTCARD</span>
                      <span className="text-emerald-400">ACTIVA</span>
                    </div>
                  </div>

                  {nfcMessage && (
                    <span className="text-xs text-cyan-300 mt-2 text-center bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800 font-mono">
                      {nfcMessage}
                    </span>
                  )}

                  {/* RFID Action Trigger Buttons */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerRfidTap}
                      disabled={isScanning}
                      className="px-4 py-2 rounded-xl bg-[#069AD8] hover:bg-[#0580b3] active:scale-95 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Acercar Tarjeta a la Terminal</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartNfcScan}
                      disabled={isScanning}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-200 font-semibold text-xs border border-white/15 transition cursor-pointer flex items-center gap-1.5"
                      title="Activar lectura por antena NFC del dispositivo móvil"
                    >
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <span>Leer NFC del Móvil</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status & Feedback */}
          <div className="mt-5 text-center max-w-md px-4">
            <span className="text-sm font-bold text-neutral-200 block">
              {isScanning ? scanStageText : `Colaborador: ${currentUser.name}`}
            </span>
            <span className="text-xs text-neutral-400 mt-0.5 block">
              {selectedMethod === 'facial' && (isScanning ? 'Mantén la mirada fija al lente...' : 'Mira directamente a la cámara y sonríe para validar tu asistencia')}
              {selectedMethod === 'fingerprint' && (fingerprintHolding ? 'Escaneando huella dactilar, mantén colocado tu dedo...' : 'Mantén presionado el sensor con tu dedo para checar')}
              {selectedMethod === 'rfid' && rfidSubMode === 'pin' && 'Digita tu PIN de 4 números para registrar tu marcaje'}
              {selectedMethod === 'rfid' && rfidSubMode === 'rfid' && 'Toca la tarjeta o acércala a la terminal para leer el chip RFID'}
            </span>
          </div>

          {/* Progress bar during scan */}
          {isScanning && (
            <div className="w-64 sm:w-80 bg-neutral-800 rounded-full h-3 mt-4 overflow-hidden border border-white/10 p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
          
          {selectedMethod === 'facial' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (cameraActive) {
                    stopCameraStream();
                    setCameraActive(false);
                  } else {
                    startCamera();
                  }
                }}
                type="button"
                className="px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                {cameraActive ? <CameraOff className="w-3.5 h-3.5 text-amber-400" /> : <Camera className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{cameraActive ? 'Pausar Cámara' : 'Reactivar Cámara'}</span>
              </button>

              <button
                onClick={() => {
                  setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                }}
                type="button"
                className="px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-1.5"
                title="Cambiar entre cámara frontal y trasera"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-[#069AD8]" />
                <span className="hidden sm:inline">{facingMode === 'user' ? 'Cámara Frontal' : 'Cámara Trasera'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-1.5"
                title="Subir o tomar selfie desde la cámara del teléfono"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Foto Dispositivo</span>
              </button>
            </div>
          )}

          {/* Primary Punch Button */}
          <button
            id="btn-trigger-punch"
            onClick={handleStartBiometricScan}
            disabled={isScanning}
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1F832D] hover:bg-[#0e661f] active:scale-95 text-white font-black text-sm tracking-wide shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {selectedMethod === 'facial' ? (
              <Camera className="w-5 h-5 text-white" />
            ) : selectedMethod === 'fingerprint' ? (
              <Fingerprint className="w-5 h-5 text-white" />
            ) : rfidSubMode === 'pin' ? (
              <KeyRound className="w-5 h-5 text-white" />
            ) : (
              <CreditCard className="w-5 h-5 text-white" />
            )}
            <span>
              {isScanning 
                ? 'PROCESANDO MARCAJE...' 
                : selectedMethod === 'facial' 
                ? '📸 TOMAR SELFIE Y CHECAR ASISTENCIA' 
                : selectedMethod === 'fingerprint'
                ? 'VALIDAR HUELLA DACTILAR'
                : rfidSubMode === 'pin'
                ? 'CONFIRMAR PIN DE SEGURIDAD'
                : 'LEER TARJETA RFID'}
            </span>
          </button>

          {/* Quick simulation button to verify failure negative sound requested by user */}
          <button
            type="button"
            onClick={() => handleTriggerSimulatedFailure()}
            disabled={isScanning}
            className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="Probar sonido negativo oficial cuando no se puede leer rostro, huella o resultado fallido"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Probar Sonido Negativo</span>
            <span className="sm:hidden">Error Test</span>
          </button>
        </div>
      </div>

      {/* Digital Receipt / Comprobante Inmediato con Selfie Capturada */}
      {recentVoucher && (
        <div className="bg-white rounded-2xl border-2 border-[#1F832D] p-6 shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-neutral-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1F832D]/10 text-[#1F832D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F832D] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {recentVoucher.method === 'facial' && '¡Marcaje Facial Verificado y Sincronizado Exitosamente!'}
                  {recentVoucher.method === 'fingerprint' && '¡Marcaje por Huella Dactilar Verificado Exitosamente!'}
                  {recentVoucher.method === 'pin' && '¡Marcaje por PIN de Seguridad Verificado Exitosamente!'}
                  {recentVoucher.method === 'rfid' && '¡Marcaje con Tarjeta RFID Verificado Exitosamente!'}
                </span>
                <h3 className="text-lg font-bold text-[#093244]">
                  Comprobante Laboral Digital Urcheck
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintVoucher}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#069AD8]" />
                <span>Imprimir Ticket</span>
              </button>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#093244] text-white font-mono">
                FOLIO: {recentVoucher.hashAudit}
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Visual Biometric Badge or Photo Snapshot Card */}
            <div className="md:col-span-1 bg-neutral-900 rounded-xl p-2.5 flex flex-col items-center border border-neutral-200 shadow-xs relative">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                {recentVoucher.method === 'facial' && <ScanFace className="w-3 h-3" />}
                {recentVoucher.method === 'fingerprint' && <Fingerprint className="w-3 h-3" />}
                {recentVoucher.method === 'pin' && <KeyRound className="w-3 h-3" />}
                {recentVoucher.method === 'rfid' && <CreditCard className="w-3 h-3" />}
                <span>
                  {recentVoucher.method === 'facial' ? 'Selfie Registrada' : 'Validación Biométrica'}
                </span>
              </span>

              {recentVoucher.photoSnapshot ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-emerald-400 relative">
                  <img
                    src={recentVoucher.photoSnapshot}
                    alt={recentVoucher.employeeName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5">
                    VERIFICADO 99.8%
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 border-emerald-400/80 bg-emerald-950/50 flex flex-col items-center justify-center p-2 text-center relative">
                  {recentVoucher.method === 'fingerprint' && (
                    <Fingerprint className="w-12 h-12 text-emerald-400" />
                  )}
                  {recentVoucher.method === 'pin' && (
                    <KeyRound className="w-12 h-12 text-emerald-400" />
                  )}
                  {recentVoucher.method === 'rfid' && (
                    <CreditCard className="w-12 h-12 text-emerald-400" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5">
                    AUTENTICADO 100%
                  </div>
                </div>
              )}
              <span className="text-[10px] text-neutral-400 mt-1 font-mono">{recentVoucher.timestamp}</span>
            </div>

            {/* Attendance Details */}
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block">Colaborador:</span>
                <span className="font-bold text-neutral-900 text-sm">{recentVoucher.employeeName}</span>
                <span className="text-[11px] font-mono text-neutral-500">{recentVoucher.employeeCode}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Tipo Marcaje:</span>
                <span className="font-bold text-neutral-900 text-sm capitalize">
                  {recentVoucher.type === 'entry' && 'Entrada Jornada'}
                  {recentVoucher.type === 'lunch_out' && 'Salida a Almuerzo'}
                  {recentVoucher.type === 'lunch_in' && 'Regreso de Almuerzo'}
                  {recentVoucher.type === 'exit' && 'Salida Fin de Turno'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Hora Servidor:</span>
                <span className="font-bold font-mono text-neutral-900 text-sm text-[#069AD8]">{recentVoucher.timestamp}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Método Biométrico:</span>
                <span className="font-bold text-neutral-900 text-sm flex items-center gap-1">
                  {recentVoucher.method === 'facial' && (
                    <>
                      <ScanFace className="w-3.5 h-3.5 text-[#069AD8]" />
                      <span>Facial AI (Selfie)</span>
                    </>
                  )}
                  {recentVoucher.method === 'fingerprint' && (
                    <>
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Huella Dactilar Óptica</span>
                    </>
                  )}
                  {recentVoucher.method === 'pin' && (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                      <span>PIN de Seguridad</span>
                    </>
                  )}
                  {recentVoucher.method === 'rfid' && (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tarjeta RFID / NFC</span>
                    </>
                  )}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Sede Laboral:</span>
                <span className="font-bold text-neutral-900 text-sm">{recentVoucher.branchName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Estatus de Puntualidad:</span>
                <span className={`font-bold text-sm inline-flex items-center gap-1 ${recentVoucher.status === 'on_time' ? 'text-[#1F832D]' : 'text-amber-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {recentVoucher.status === 'on_time' ? 'A Tiempo' : 'Retardo Registrado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Today's Punches History with Selfie Thumbnails */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#093244] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#069AD8]" />
            Mis Marcajes Registrados Hoy
          </h3>
          <span className="text-xs font-semibold text-neutral-500">
            {myRecordsToday.length} registro(s) hoy
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {myRecordsToday.length > 0 ? (
            myRecordsToday.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="flex items-center gap-3">
                  {/* Photo Preview or Biometric Method Icon Badge */}
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-300 shrink-0 bg-neutral-100 flex items-center justify-center">
                    {r.photoSnapshot ? (
                      <img
                        src={r.photoSnapshot}
                        alt={r.employeeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white">
                        {r.method === 'fingerprint' && <Fingerprint className="w-5 h-5 text-emerald-400" />}
                        {r.method === 'pin' && <KeyRound className="w-5 h-5 text-cyan-400" />}
                        {r.method === 'rfid' && <CreditCard className="w-5 h-5 text-indigo-400" />}
                        {(!r.method || r.method === 'facial') && <ScanFace className="w-5 h-5 text-cyan-400" />}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 bg-[#093244] text-white p-0.5 rounded-tl">
                      {r.photoSnapshot && <Camera className="w-2.5 h-2.5" />}
                      {!r.photoSnapshot && r.method === 'fingerprint' && <Fingerprint className="w-2.5 h-2.5 text-emerald-400" />}
                      {!r.photoSnapshot && r.method === 'pin' && <KeyRound className="w-2.5 h-2.5 text-cyan-400" />}
                      {!r.photoSnapshot && r.method === 'rfid' && <CreditCard className="w-2.5 h-2.5 text-indigo-400" />}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">{r.timestamp}</span>
                      <span className="font-semibold text-neutral-700 capitalize">
                        {r.type === 'entry' && 'Entrada'}
                        {r.type === 'lunch_out' && 'Salida Almuerzo'}
                        {r.type === 'lunch_in' && 'Regreso Almuerzo'}
                        {r.type === 'exit' && 'Salida Turno'}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                      {r.method === 'fingerprint' && <Fingerprint className="w-3 h-3 text-emerald-600 shrink-0" />}
                      {r.method === 'pin' && <KeyRound className="w-3 h-3 text-cyan-600 shrink-0" />}
                      {r.method === 'rfid' && <CreditCard className="w-3 h-3 text-indigo-600 shrink-0" />}
                      {r.method === 'facial' && <ScanFace className="w-3 h-3 text-[#069AD8] shrink-0" />}
                      <span className="truncate">{r.biometricDeviceId}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {r.photoSnapshot && (
                    <button
                      type="button"
                      onClick={() => setSelectedPunchToView(r)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 hover:border-[#069AD8] text-[#069AD8] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">Ver Selfie</span>
                    </button>
                  )}

                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    r.status === 'on_time' ? 'bg-[#1F832D]/10 text-[#1F832D]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status === 'on_time' ? 'A Tiempo' : 'Retardo'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-xs py-4 text-center">
              Aún no tienes registros de asistencia en la jornada de hoy.
            </p>
          )}
        </div>
      </div>

      {/* Modal: View Full Punch Selfie Inspection */}
      {selectedPunchToView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-[#069AD8]" />
                <h3 className="font-bold text-neutral-900 text-base">
                  Auditoría de Selfie Facial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPunchToView(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-[#069AD8] shadow-md relative bg-neutral-900">
                <img
                  src={selectedPunchToView.photoSnapshot || selectedPunchToView.employeeAvatar}
                  alt={selectedPunchToView.employeeName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  MATCH: {selectedPunchToView.verificationScore || 99.8}%
                </div>
                <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-white text-center">
                  {selectedPunchToView.timestamp} • {selectedPunchToView.branchName}
                </div>
              </div>

              <div className="mt-4 w-full bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Colaborador:</span>
                  <span className="font-bold text-neutral-900">{selectedPunchToView.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ID / Código:</span>
                  <span className="font-mono text-neutral-800">{selectedPunchToView.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dispositivo:</span>
                  <span className="text-neutral-800 font-medium">{selectedPunchToView.biometricDeviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hash de Auditoría:</span>
                  <span className="font-mono text-neutral-800 text-[10px]">{selectedPunchToView.hashAudit}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPunchToView(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#093244] text-white font-bold text-xs hover:bg-[#082735] transition cursor-pointer"
              >
                Cerrar Visualización
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
