import React, { useState, useRef } from 'react';
import { UserProfile, Branch, Employee } from '../../types';
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  ShieldCheck,
  KeyRound,
  CreditCard,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  QrCode,
  Fingerprint,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updatedUser: UserProfile) => void;
  branches?: Branch[];
  allEmployees?: Employee[];
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  branches = [],
  allEmployees = [],
}) => {
  // Form State initialized with current user details
  const [formData, setFormData] = useState<UserProfile>({ ...currentUser });
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser.avatar);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera capture modal state
  const [isCapturingCamera, setIsCapturingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Security / PIN visibility
  const [showPin, setShowPin] = useState<boolean>(false);

  // Handle text field changes
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  // Handle image upload from computer / phone gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen no debe superar los 5 MB de tamaño.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarPreview(result);
        setFormData((prev) => ({
          ...prev,
          avatar: result,
          biometricEnrolled: true,
        }));
        setIsSaved(false);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start live webcam for taking profile selfie
  const startCamera = async () => {
    setIsCapturingCamera(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('No se pudo acceder a la cámara:', err);
      setCameraError('No se pudo acceder a la cámara web. Verifica los permisos de tu navegador o sube una fotografía desde archivo.');
    }
  };

  // Take photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setAvatarPreview(dataUrl);
      setFormData((prev) => ({
        ...prev,
        avatar: dataUrl,
        biometricEnrolled: true,
      }));
      setIsSaved(false);
      stopCamera();
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  // Submit and save profile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('El nombre completo no puede estar vacío.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('El correo electrónico es obligatorio.');
      return;
    }

    const updatedUser: UserProfile = {
      ...formData,
      avatar: avatarPreview,
      biometricEnrolled: true,
    };

    onUpdateProfile(updatedUser);
    setIsSaved(true);
    setErrorMessage(null);

    // Fade confirmation after 4 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  // Reset to original data
  const handleReset = () => {
    setFormData({ ...currentUser });
    setAvatarPreview(currentUser.avatar);
    setIsSaved(false);
    setErrorMessage(null);
  };

  return (
    <div id="user-profile-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#093244] text-white flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#069AD8]" />
              Ficha de Usuario
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#069AD8]/15 text-[#069AD8]">
              {currentUser.role === 'admin' ? 'Administrador del Sistema' : 'Colaborador Institucional'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F832D]/15 text-[#1F832D] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Biometría Activa
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#093244]">
            Perfil de Usuario y Datos Personales
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Actualiza tu fotografía de perfil facial, información de contacto, credenciales y datos generales.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revertir</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#069AD8] hover:bg-[#0584b8] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F832D] shrink-0" />
          <div className="text-xs text-emerald-800">
            <span className="font-bold">¡Perfil actualizado correctamente!</span> Los cambios en tu fotografía, datos personales y credenciales han sido guardados y sincronizados con la base de datos central.
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs text-rose-800 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar / Photo Management & Biometric Status */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Photo Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs text-center">
              <h2 className="text-sm font-bold text-[#093244] mb-4 text-left flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#069AD8]" />
                Fotografía Facial y Avatar
              </h2>

              <div className="relative inline-block mx-auto mb-4 group">
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#069AD8] shadow-md mx-auto bg-neutral-100 relative">
                  <img
                    src={avatarPreview}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white/90 text-neutral-800 hover:bg-white transition"
                      title="Cambiar fotografía"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-2 rounded-full bg-white/90 text-neutral-800 hover:bg-white transition"
                      title="Tomar fotografía con cámara"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-1 right-3 p-1.5 rounded-full bg-[#1F832D] text-white border-2 border-white shadow-xs" title="Biometría Facial Enrolada">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-neutral-500 mb-4 px-2 leading-relaxed">
                Esta fotografía es utilizada como tu avatar en el sistema y como referencia facial para cotejo biométrico en la checadora.
              </p>

              {/* Action Buttons for Avatar */}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#093244] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#069AD8]" />
                  <span>Subir Fotografía desde Archivo</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#093244] hover:bg-[#072431] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#069AD8]" />
                  <span>Tomar Foto con Cámara Web</span>
                </button>
              </div>
            </div>

            {/* Biometric & Access Status Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#093244] flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#069AD8]" />
                Credenciales y Biometría
              </h2>

              <div className="space-y-3 text-xs">
                {/* RFID */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#069AD8]" />
                    <div>
                      <span className="font-bold text-neutral-800 block">Tarjeta RFID</span>
                      <span className="text-neutral-500 font-mono text-[11px]">
                        {formData.rfidCode || 'RFID-DEFAULT-01'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Activa
                  </span>
                </div>

                {/* PIN Code */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#069AD8]" />
                      <span className="font-bold text-neutral-800">PIN de Marcaje</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                      title={showPin ? 'Ocultar PIN' : 'Ver PIN'}
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={formData.pinCode || ''}
                    onChange={(e) => handleInputChange('pinCode', e.target.value.slice(0, 6))}
                    placeholder="4 a 6 dígitos"
                    maxLength={6}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#069AD8]"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Utilizado en contingencias si la cámara o sensor no están disponibles.
                  </p>
                </div>

                {/* Role Badge */}
                <div className="p-3 rounded-xl bg-[#093244]/5 border border-[#069AD8]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#069AD8]" />
                    <div>
                      <span className="font-bold text-[#093244] block">Rol Asignado</span>
                      <span className="text-neutral-500 text-[11px]">{formData.roleName}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#069AD8]/20 text-[#093244] font-bold text-[10px] uppercase">
                    {formData.role}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Personal Data & Job Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General & Personal Information */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-[#093244] flex items-center gap-2 pb-2 border-b border-neutral-100">
                <User className="w-4 h-4 text-[#069AD8]" />
                Información Personal
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    Teléfono Móvil / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    placeholder="+52 55 1234 5678"
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* CURP or Tax ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    CURP / Documento de Identidad
                  </label>
                  <input
                    type="text"
                    value={formData.curpOrTaxId || ''}
                    placeholder="Ej. ABCD901234HDFR00"
                    onChange={(e) => handleInputChange('curpOrTaxId', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8] uppercase"
                  />
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Dirección Residencial
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    placeholder="Calle, Número, Colonia, Alcaldía/Municipio, Ciudad"
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#093244] flex items-center gap-2 pb-2 border-b border-neutral-100">
                <HeartHandshake className="w-4 h-4 text-[#1F832D]" />
                Contacto en Caso de Emergencia
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Nombre de Contacto</label>
                  <input
                    type="text"
                    value={formData.emergencyContact || ''}
                    placeholder="Nombre y parentesco"
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Teléfono de Emergencia</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone || ''}
                    placeholder="+52 55 0000 0000"
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>
              </div>
            </div>

            {/* Job / Corporate Data */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#093244] flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Briefcase className="w-4 h-4 text-[#069AD8]" />
                Adscripción y Puesto Laboral
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Código de Empleado</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.employeeId || 'USR-CORE-001'}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-500 cursor-not-allowed"
                  />
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Cargo / Puesto</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Departamento</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Sucursal Base</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8]"
                  />
                </div>

                {/* Professional Bio */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700">Resumen Profesional / Notas</label>
                  <textarea
                    rows={3}
                    value={formData.bio || ''}
                    placeholder="Escribe una breve descripción de tus responsabilidades o perfil profesional..."
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#069AD8] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition cursor-pointer"
              >
                Descartar Cambios
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1F832D] hover:bg-[#166422] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Perfil y Fotografía</span>
              </button>
            </div>

          </div>

        </div>
      </form>

      {/* Live Camera Modal for Taking Profile Picture */}
      {isCapturingCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#069AD8]" />
                <span className="font-bold text-sm text-[#093244]">Captura de Fotografía Facial</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs leading-relaxed">
                {cameraError}
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {/* Visual Facial Oval Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-[#069AD8] opacity-80" />
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    Centra tu rostro dentro de la guía
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 rounded-xl bg-[#069AD8] hover:bg-[#0584b8] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar Fotografía</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
