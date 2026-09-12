import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  Search,
  CheckCircle2,
  ShieldCheck,
  ScanFace,
  FileSignature,
  Building2,
  Clock,
  CalendarCheck,
  Users,
  Smartphone,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FileText,
  Lock,
  Camera,
  Activity,
  Award
} from 'lucide-react';
import { UserRole } from '../../types';

interface UserManualViewProps {
  currentRole: UserRole;
}

interface ManualSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  roleAudience: 'both' | 'admin' | 'employee';
  content: {
    summary: string;
    steps: string[];
    tips: string[];
    faq?: { q: string; a: string }[];
  };
}

export const UserManualView: React.FC<UserManualViewProps> = ({ currentRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<'all' | 'admin' | 'employee'>('all');
  const [activeSectionId, setActiveSectionId] = useState<string>('intro');

  const manualSections: ManualSection[] = [
    {
      id: 'intro',
      title: '1. Introducción y Arquitectura Urcheck BioCloud',
      subtitle: 'Visión general del sistema, perfiles de acceso y seguridad perimetral.',
      icon: ShieldCheck,
      roleAudience: 'both',
      content: {
        summary: 'Urcheck BioCloud es la solución empresarial para la gestión integral de asistencia laboral, auditoría biométrica con reconocimiento facial e inteligencia artificial, expediente digital con firma electrónica avanzada y administración multisede.',
        steps: [
          'Roles del Sistema: Perfil Administrador / Recursos Humanos (control total, corroboración, altas, contratos y reportes) y Perfil Empleado / Colaborador (marcaje en cámara, consulta de expediente, solicitudes y firmas).',
          'Seguridad Biocriptográfica: Cada registro de asistencia y documento firmado incorpora un sello criptográfico SHA-256 inmutable y marca temporal.',
          'Arquitectura Multi-Dispositivo: Funciona en PC de escritorio, laptops, tablets de recepción y dispositivos móviles mediante tecnología PWA (Progressive Web App).',
        ],
        tips: [
          'Puede alternar su rol de prueba o cambiar de usuario en cualquier momento desde el selector en la esquina superior del panel.',
          'El sistema no almacena datos sensibles en texto plano; las firmas y fotos se procesan con algoritmos de hashing seguro.',
        ],
        faq: [
          {
            q: '¿Qué navegadores son compatibles?',
            a: 'Google Chrome, Microsoft Edge, Safari y Mozilla Firefox con permisos de cámara web y geolocalización habilitados.',
          },
          {
            q: '¿Qué sucede si se interrumpe la conexión a internet?',
            a: 'La aplicación mantiene un caché local que sincroniza automáticamente los marcajes al restablecer la conectividad.',
          },
        ],
      },
    },
    {
      id: 'facial-punch',
      title: '2. Terminal Checadora y Reconocimiento Facial (Cámara y Selfie)',
      subtitle: 'Cómo realizar marcajes con prueba de vida (liveness) y captura fotográfica en tiempo real.',
      icon: ScanFace,
      roleAudience: 'both',
      content: {
        summary: 'La terminal de asistencia digital integra un motor de visión artificial que escanea los 68 puntos biométricos del rostro del colaborador, corrobora su presencia física y registra una fotografía selfie como comprobante legal.',
        steps: [
          'Paso 1: Diríjase al módulo "Marcaje Biométrico" en el menú principal.',
          'Paso 2: Permita el acceso a la cámara de su dispositivo cuando el navegador lo solicite.',
          'Paso 3: Sitúe su rostro en el centro del óvalo guía del visor en pantalla.',
          'Paso 4: Seleccione el tipo de evento: Entrada a Laborar, Salida a Almuerzo, Regreso de Almuerzo o Salida de Turno.',
          'Paso 5: Presione el botón principal "TOMAR SELFIE Y CHECAR ASISTENCIA".',
          'Paso 6: El sistema ejecutará el escaneo láser, emitirá un tono acústico de confirmación y generará un Comprobante Laboral Digital con folio SHA-256.',
        ],
        tips: [
          'Asegúrese de estar en un ambiente iluminado de forma homogénea y evitar el uso de gorras o lentes muy oscuros.',
          'Puede utilizar el botón de cambio de cámara (frontal / trasera) en dispositivos móviles o tablets.',
          'El sistema también admite métodos de contingencia como Huella Dactilar óptica o Tarjetas RFID.',
        ],
        faq: [
          {
            q: '¿Dónde queda guardada mi selfie?',
            a: 'En el expediente digital del marcaje, protegida con sello de tiempo y visible únicamente para el colaborador y el departamento de Recursos Humanos.',
          },
          {
            q: '¿Qué hago si mi cámara no inicia?',
            a: 'Verifique los permisos en el candado de la barra de direcciones del navegador o utilice el botón "Tomar Selfie con Cámara del Dispositivo".',
          },
        ],
      },
    },
    {
      id: 'attendance-corroboration',
      title: '3. Módulo de Asistencias y Corroboración de Recursos Humanos',
      subtitle: 'Supervisión de checadas, dictamen de retardos, inspección de selfies y justificaciones.',
      icon: Clock,
      roleAudience: 'admin',
      content: {
        summary: 'El nuevo módulo dedicado "Asistencias" permite al Administrador y al personal de Recursos Humanos inspeccionar cada checada, comparar la foto de la credencial contra la selfie tomada en vivo y emitir un dictamen oficial.',
        steps: [
          'Paso 1: Ingrese al módulo "Asistencias" desde la barra lateral izquierda.',
          'Paso 2: Observe el resumen en tiempo real: Marcajes hoy, porcentaje de puntualidad, retardos y selfies auditadas.',
          'Paso 3: Utilice la barra de filtros para segmentar por Sucursal, Tipo de Evento (Entrada/Salida), Método y Estatus.',
          'Paso 4: Haga clic en el botón de cámara "Selfie" para abrir la comparativa biométrica entre la foto de perfil y la foto tomada al checar.',
          'Paso 5: Presione "Corroborar" para validar formalmente la asistencia, justificar un retardo o añadir una observación de auditoría.',
          'Paso 6: Utilice las casillas de verificación para "Corroborar en Lote" múltiples marcajes en un solo clic.',
        ],
        tips: [
          'Los marcajes corroborados muestran el nombre del auditor y la fecha exacta para efectos de nómina.',
          'Puede exportar en cualquier momento la lista filtrada a un archivo CSV compatible con Excel para su entrega a contabilidad.',
        ],
        faq: [
          {
            q: '¿Cómo justifico un retardo por causas de fuerza mayor?',
            a: 'Presione el botón "Corroborar", seleccione la opción "Validar como Puntual" e ingrese en el cuadro de texto el justificante emitido.',
          },
        ],
      },
    },
    {
      id: 'employees-management',
      title: '4. Gestión de Colaboradores, Credenciales y Compartir',
      subtitle: 'Altas, edición de perfiles, credenciales QR y distribución directa por WhatsApp y Correo.',
      icon: Users,
      roleAudience: 'admin',
      content: {
        summary: 'Administre de manera centralizada la plantilla de empleados, asigne sucursales, configure puestos y genere gafetes de identificación digital con código QR de acceso rápido.',
        steps: [
          'Paso 1: Ingrese a "Empleados" en el menú de navegación.',
          'Paso 2: Haga clic en "+ Nuevo Colaborador" para registrar nombre, email, teléfono, puesto, departamento y sucursal.',
          'Paso 3: Ingrese al expediente de cualquier colaborador para consultar su credencial digital con código de barras y QR biométrico.',
          'Paso 4: Utilice los botones directos "Compartir por WhatsApp" o "Enviar por Email" para enviar al colaborador su gafete oficial.',
          'Paso 5: Puede editar los datos en cualquier momento o dar de baja a un colaborador manteniendo su historial intacto.',
        ],
        tips: [
          'El código de empleado único (ej. EMP-7742) permite al personal identificarse ágilmente en terminales físicas de huella o tarjeta.',
        ],
      },
    },
    {
      id: 'digital-documents',
      title: '5. Expediente Digital y Firma Electrónica Avanzada',
      subtitle: 'Carga de contratos, políticas laborales, firma biométrica manuscrita y sellado NOM-151.',
      icon: FileSignature,
      roleAudience: 'both',
      content: {
        summary: 'Gestione el archivo laboral sin papel. Los administradores pueden subir contratos, reglamentos internos y convenios para que los empleados los firmen digitalmente desde su pantalla con validez legal.',
        steps: [
          'Paso 1 (Administrador): Ingrese a "Mis Documentos", presione "Nuevo Documento / Contrato", elija si aplica para toda la empresa o un colaborador específico y cargue las cláusulas.',
          'Paso 2 (Empleado): Ingrese a "Expediente / Docs", localice los documentos con estatus "Pendiente de Firma".',
          'Paso 3: Lea las cláusulas del documento y presione "Firmar Documento".',
          'Paso 4: Realice su trazo de firma manuscrita en el lienzo interactivo táctil.',
          'Paso 5: El sistema sellará el documento con dirección IP, navegador, fecha y hora exacta, generando un certificado criptográfico inalterable.',
        ],
        tips: [
          'Tanto el administrador como el empleado pueden descargar o imprimir el documento con los sellos de ambas partes estampados.',
        ],
      },
    },
    {
      id: 'branches-geofencing',
      title: '6. Sucursales, Geocercas GPS y Dispositivos Biométricos',
      subtitle: 'Configuración de sedes, radio perimetral y enlace con checadores ZKTeco y Anviz.',
      icon: Building2,
      roleAudience: 'admin',
      content: {
        summary: 'Configure múltiples sedes de trabajo con coordenadas GPS y radio de geocerca en metros para garantizar que los empleados solo puedan checar dentro de las instalaciones autorizadas.',
        steps: [
          'Paso 1: Diríjase a "Sucursales" en el menú de navegación.',
          'Paso 2: Administre sedes corporativas, plantas industriales y centros logísticos.',
          'Paso 3: Asigne el radio de tolerancia GPS (por ejemplo, 100 metros a la redonda).',
          'Paso 4: Consulte el estado de sincronización del hardware biométrico en tiempo real (ZKTeco SpeedFace, Anviz FacePass, etc.).',
        ],
        tips: [
          'Si un empleado intenta checar fuera del radio permitido, el sistema alertará sobre la inconsistencia de geolocalización.',
        ],
      },
    },
    {
      id: 'leaves-overtime',
      title: '7. Permisos, Vacaciones, Incidencias y Horas Extra',
      subtitle: 'Flujo de solicitud, cálculo de días y dictamen de aprobación o rechazo con motivos.',
      icon: CalendarCheck,
      roleAudience: 'both',
      content: {
        summary: 'Sistema integral de gestión de ausencias, licencias médicas, días económicos, vacaciones anuales y solicitud y validación de horas extra extraordinarias.',
        steps: [
          'Paso 1 (Empleado): Ingrese a "Permisos y Vacaciones" y presione "+ Solicitar Permiso / Vacaciones".',
          'Paso 2: Seleccione el tipo de ausencia, fecha inicial, fecha final y justificación.',
          'Paso 3 (Administrador): En el módulo de permisos, revise las solicitudes con estatus "Pendiente".',
          'Paso 4: Presione "Aprobar" o "Rechazar" ingresando el motivo fundamentado.',
          'Paso 5: El estatus se actualizará al instante en la cuenta del colaborador.',
        ],
        tips: [
          'Las horas extra aprobadas se reflejan automáticamente en el cómputo final de reportes de asistencia.',
        ],
      },
    },
    {
      id: 'reports-audit',
      title: '8. Reportes Oficiales, Auditoría Forense y Exportación',
      subtitle: 'Generación de sábanas de asistencia, métricas de puntualidad y entrega a nómina.',
      icon: FileText,
      roleAudience: 'admin',
      content: {
        summary: 'Visualice gráficas de desempeño, índices de ausentismo y exporte reportes detallados en formatos CSV y hojas de cálculo para la dispersión de nómina.',
        steps: [
          'Paso 1: Diríjase al módulo "Reportes".',
          'Paso 2: Seleccione el rango de fechas (Hoy, Esta Semana, Este Mes o Personalizado).',
          'Paso 3: Filtre por departamento o sucursal.',
          'Paso 4: Presione "Exportar CSV" o "Imprimir Reporte" para obtener el documento oficial membretado.',
        ],
        tips: [
          'Los reportes incluyen el desglose de horas laboradas, minutos de retardo acumulados y método de checado.',
        ],
      },
    },
  ];

  // Filter sections by search and audience
  const filteredSections = manualSections.filter((section) => {
    const matchesAudience =
      activeAudienceFilter === 'all'
        ? true
        : section.roleAudience === 'both' || section.roleAudience === activeAudienceFilter;

    const matchesSearch =
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAudience && matchesSearch;
  });

  const activeSection = manualSections.find((s) => s.id === activeSectionId) || manualSections[0];

  // Function to print / generate PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Function to download structured text/markdown manual
  const handleDownloadTextManual = () => {
    let content = `# MANUAL DE OPERACIÓN OFICIAL - URCHECK BIOCLOUD ENTERPRISE\n`;
    content += `Fecha de Generación: ${new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })}\n`;
    content += `Sistema: Urcheck BioCloud v5.2 (Control Biométrico de Asistencia y Expediente Digital)\n\n`;
    content += `=========================================================================\n\n`;

    manualSections.forEach((sec) => {
      content += `## ${sec.title}\n`;
      content += `${sec.subtitle}\n`;
      content += `Audiencia: ${sec.roleAudience === 'both' ? 'Administradores y Empleados' : sec.roleAudience === 'admin' ? 'Administrador / Recursos Humanos' : 'Colaboradores'}\n\n`;
      content += `### Descripción General\n${sec.content.summary}\n\n`;
      content += `### Procedimiento Operativo Paso a Paso:\n`;
      sec.content.steps.forEach((st) => {
        content += `- ${st}\n`;
      });
      content += `\n### Recomendaciones y Tips:\n`;
      sec.content.tips.forEach((tp) => {
        content += `- ${tp}\n`;
      });
      if (sec.content.faq && sec.content.faq.length > 0) {
        content += `\n### Preguntas Frecuentes:\n`;
        sec.content.faq.forEach((f) => {
          content += `* P: ${f.q}\n  R: ${f.a}\n`;
        });
      }
      content += `\n-------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_Operacion_Urcheck_BioCloud_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="user-manual-view" className="space-y-6">
      
      {/* Header Banner with Action Buttons */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0A3142] text-white flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#0871A0]" />
              Centro de Ayuda y Documentación
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#138128]/10 text-[#138128]">
              Versión Oficial v5.2
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0A3142]">
            Manual de Operación de Urcheck BioCloud
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Guía de usuario interactiva y descargable para Administradores de Recursos Humanos y Colaboradores.
          </p>
        </div>

        {/* Action Buttons: PDF & Document Download */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-download-manual-pdf"
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-2.5 rounded-xl bg-[#0871A0] hover:bg-[#065a80] text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm"
            title="Generar y descargar archivo PDF del manual completo"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Manual en PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTextManual}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            title="Descargar versión en texto / markdown"
          >
            <FileText className="w-4 h-4 text-[#0871A0]" />
            <span>Descargar .DOC / .MD</span>
          </button>
        </div>
      </div>

      {/* Search and Audience Filter */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por tema (ej. selfie, firma, corroborar, permisos)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0871A0] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveAudienceFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeAudienceFilter === 'all'
                ? 'bg-white text-[#0A3142] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Todos los Temas
          </button>
          <button
            type="button"
            onClick={() => setActiveAudienceFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeAudienceFilter === 'admin'
                ? 'bg-white text-[#0A3142] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Guía para Administrador / RRHH
          </button>
          <button
            type="button"
            onClick={() => setActiveAudienceFilter('employee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeAudienceFilter === 'employee'
                ? 'bg-white text-[#0A3142] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Guía para Empleados
          </button>
        </div>
      </div>

      {/* Manual Layout: Interactive Index (Left) + Detail Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Table of Contents / Index */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-1.5 sticky top-24">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-2 block mb-2">
            Índice de Capítulos ({filteredSections.length})
          </span>

          <div className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isSelected = activeSection.id === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#0A3142] text-white shadow-sm border-l-4 border-[#0871A0]'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-[#0871A0]' : 'text-neutral-500'}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {section.title}
                    </span>
                    <span className={`block text-[11px] truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {section.subtitle}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-[#0871A0]' : 'text-neutral-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Section Detailed Reader */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Chapter Header */}
          <div className="border-b border-neutral-200 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#0871A0]/10 text-[#0871A0]">
                {activeSection.roleAudience === 'both' ? 'Para Todos los Usuarios' : activeSection.roleAudience === 'admin' ? 'Módulo de Administrador' : 'Módulo de Empleado'}
              </span>
              <span className="text-xs text-neutral-400">• Procedimiento Oficial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
              {activeSection.title}
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm mt-1">
              {activeSection.subtitle}
            </p>
          </div>

          {/* Section Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0871A0]" /> Resumen Ejecutivo
            </h3>
            <p className="text-neutral-800 text-xs sm:text-sm leading-relaxed">
              {activeSection.content.summary}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A3142] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#138128]" />
              Guía de Ejecución Paso a Paso
            </h3>
            <div className="space-y-2.5">
              {activeSection.content.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/70 border border-neutral-100 hover:border-neutral-200 transition">
                  <span className="w-6 h-6 rounded-full bg-[#0871A0] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips and Best Practices */}
          {activeSection.content.tips && activeSection.content.tips.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-amber-700" />
                Buenas Prácticas y Consejos Clave
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
                {activeSection.content.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Frequently Asked Questions */}
          {activeSection.content.faq && activeSection.content.faq.length > 0 && (
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold text-[#0A3142] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0871A0]" />
                Preguntas Frecuentes
              </h4>
              <div className="space-y-2.5">
                {activeSection.content.faq.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                    <p className="font-bold text-neutral-900 mb-1">
                      {faq.q}
                    </p>
                    <p className="text-neutral-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Print/Download Footer inside reader */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>Manual Oficial Urcheck BioCloud • Todos los derechos reservados</span>
            <button
              type="button"
              onClick={handlePrintPDF}
              className="text-[#0871A0] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir este capítulo
            </button>
          </div>
        </div>

      </div>

      {/* Printable Section for Window Print / PDF Export */}
      <div className="hidden print:block print:p-8 bg-white text-black space-y-6">
        <div className="border-b-2 border-black pb-4 text-center">
          <h1 className="text-2xl font-black uppercase">URCHECK BIOCLOUD ENTERPRISE</h1>
          <p className="text-sm font-bold">MANUAL OFICIAL DE OPERACIÓN Y PROCEDIMIENTOS</p>
          <p className="text-xs text-neutral-600">Fecha de emisión: {new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })}</p>
        </div>

        {manualSections.map((sec, idx) => (
          <div key={sec.id} className="py-4 border-b border-neutral-300 page-break-inside-avoid">
            <h2 className="text-lg font-bold">{sec.title}</h2>
            <p className="text-xs italic mb-2">{sec.subtitle}</p>
            <p className="text-xs mb-3">{sec.content.summary}</p>
            
            <h3 className="text-xs font-bold uppercase mb-1">Procedimiento:</h3>
            <ol className="list-decimal list-inside text-xs space-y-1 mb-3">
              {sec.content.steps.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>

            <h3 className="text-xs font-bold uppercase mb-1">Buenas Prácticas:</h3>
            <ul className="list-disc list-inside text-xs space-y-1">
              {sec.content.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="text-center text-xs text-neutral-500 pt-6">
          Documento Certificado por el Departamento de Recursos Humanos y Seguridad Informática.
        </div>
      </div>

    </div>
  );
};
