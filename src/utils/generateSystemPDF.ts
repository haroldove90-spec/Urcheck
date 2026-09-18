import { jsPDF } from 'jspdf';

interface PDFGeneratorOptions {
  companyName?: string;
  generatedBy?: string;
}

/**
 * Generates an executive, beautifully formatted multi-page PDF document
 * detailing Urcheck BioCloud's system characteristics, user roles, feature checklist,
 * operational workflow, and technical architecture.
 */
export const generateSystemDocumentationPDF = (options: PDFGeneratorOptions = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178 mm
  const marginBottom = 20;

  let cursorY = 20;

  // Institutional Color Palette
  const colorPrimary = [9, 50, 68];      // #093244 Navy Dark
  const colorAccent = [6, 154, 216];     // #069AD8 Cyan Primary
  const colorSuccess = [31, 131, 45];    // #1F832D Green
  const colorText = [30, 41, 59];        // Neutral 800
  const colorTextMuted = [100, 116, 139];// Slate 500
  const colorBgLight = [248, 250, 252];  // Slate 50
  const colorBorder = [226, 232, 240];   // Slate 200

  // Helper to ensure page breaks with headers/footers
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      drawRunningHeader();
      cursorY = 26;
    }
  };

  // Running Header on subsequent pages
  const drawRunningHeader = () => {
    doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.rect(0, 4, pageWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('URCHECK BIOCLOUD ENTERPRISE', marginX, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('ESPECIFICACIONES TÉCNICAS, ROLES Y MATRIZ DE FUNCIONES', pageWidth - marginX, 12, { align: 'right' });

    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(marginX, 15, pageWidth - marginX, 15);
  };

  // Section Banner Helper
  const drawSectionTitle = (title: string, subtitle?: string) => {
    checkPageBreak(18);

    doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
    doc.roundedRect(marginX, cursorY, contentWidth, subtitle ? 14 : 10, 2, 2, 'F');

    doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.roundedRect(marginX, cursorY, 3, subtitle ? 14 : 10, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(title, marginX + 6, cursorY + 6.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
      doc.text(subtitle, marginX + 6, cursorY + 11.5);
      cursorY += 17;
    } else {
      cursorY += 13;
    }
  };

  // Subsection Title Helper
  const drawSubSectionTitle = (title: string) => {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(title, marginX, cursorY + 4);
    cursorY += 7;
  };

  // Paragraph Helper with auto wrapping
  const drawParagraph = (text: string, fontSize = 8.5, isMuted = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    if (isMuted) {
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    } else {
      doc.setTextColor(colorText[0], colorText[1], colorText[2]);
    }

    const lines = doc.splitTextToSize(text, contentWidth);
    const blockHeight = lines.length * (fontSize * 0.42);
    checkPageBreak(blockHeight + 3);
    doc.text(lines, marginX, cursorY + 3);
    cursorY += blockHeight + 3;
  };

  // Bullet point helper
  const drawBullet = (boldTitle: string, description: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);

    const prefix = `•  ${boldTitle}: `;
    const prefixWidth = doc.getTextWidth(prefix);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);

    const availableDescWidth = contentWidth - prefixWidth;
    const fullText = boldTitle ? `${boldTitle}: ${description}` : description;
    const lines = doc.splitTextToSize(fullText, contentWidth - 4);
    const blockHeight = lines.length * 3.8;

    checkPageBreak(blockHeight + 2);

    // Render bullet symbol
    doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.circle(marginX + 1.5, cursorY + 2.5, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(boldTitle ? `${boldTitle}: ` : '', marginX + 4, cursorY + 3.2);

    const titleWidth = boldTitle ? doc.getTextWidth(`${boldTitle}: `) : 0;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);

    // Split text remaining
    const remainingTextLines = doc.splitTextToSize(description, contentWidth - 4 - titleWidth);
    if (remainingTextLines.length === 1) {
      doc.text(remainingTextLines[0], marginX + 4 + titleWidth, cursorY + 3.2);
      cursorY += 5;
    } else {
      const allLines = doc.splitTextToSize(`• ${boldTitle}: ${description}`, contentWidth - 2);
      doc.text(allLines, marginX + 2, cursorY + 3.2);
      cursorY += allLines.length * 3.8 + 1.5;
    }
  };

  // Checklist Item with visual box
  const drawChecklistItem = (itemText: string, category?: string) => {
    checkPageBreak(6);

    // Box
    doc.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX + 1, cursorY + 0.5, 3.2, 3.2, 0.5, 0.5, 'S');

    // Checkmark
    doc.setDrawColor(colorSuccess[0], colorSuccess[1], colorSuccess[2]);
    doc.setLineWidth(0.4);
    doc.line(marginX + 1.6, cursorY + 2.1, marginX + 2.3, cursorY + 2.9);
    doc.line(marginX + 2.3, cursorY + 2.9, marginX + 3.7, cursorY + 1.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);

    if (category) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
      const catText = `[${category}] `;
      doc.text(catText, marginX + 6, cursorY + 3);
      const catWidth = doc.getTextWidth(catText);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorText[0], colorText[1], colorText[2]);
      doc.text(itemText, marginX + 6 + catWidth, cursorY + 3);
    } else {
      doc.text(itemText, marginX + 6, cursorY + 3);
    }

    cursorY += 4.6;
  };

  // Callout Box
  const drawCalloutBox = (title: string, bodyText: string, borderColor = colorAccent) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(bodyText, contentWidth - 10);
    const boxHeight = lines.length * 3.6 + 10;

    checkPageBreak(boxHeight + 3);

    doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
    doc.roundedRect(marginX, cursorY, contentWidth, boxHeight, 2, 2, 'F');

    doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(marginX, cursorY, 2.5, boxHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(title, marginX + 5, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);
    doc.text(lines, marginX + 5, cursorY + 9);

    cursorY += boxHeight + 4;
  };

  /* =========================================================================
     PAGE 1: PORTADA EJECUTIVA Y SINOPSIS DEL SISTEMA
     ========================================================================= */

  // Top Institutional Header Bar
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Title in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text('URCHECK BIOCLOUD ENTERPRISE', marginX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(220, 240, 255);
  doc.text('Sistema Integral de Asistencia Biométrica, Gestión de Incidencias y Expediente Digital', marginX, 26);

  // Folio & Date Ribbon
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  const todayStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`VERSIÓN OFICIAL v5.2 • FECHA DE EMISIÓN: ${todayStr.toUpperCase()}`, marginX, 35);

  cursorY = 52;

  // Executive Badge Summary Grid (4 Highlights)
  const boxW = (contentWidth - 6) / 3;
  const metrics = [
    { label: 'PLATAFORMA', val: 'Web App Progresiva (PWA)', sub: 'Android / iOS / PC / Mac' },
    { label: 'PERSISTENCIA', val: 'PostgreSQL Relacional', sub: 'Supabase Cloud Realtime' },
    { label: 'BIOMETRÍA', val: 'Facial IA + Huella + RFID', sub: 'Evidencia Fotográfica + GPS' },
  ];

  metrics.forEach((m, idx) => {
    const xPos = marginX + idx * (boxW + 3);
    doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(xPos, cursorY, boxW, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text(m.label, xPos + 3.5, cursorY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(m.val, xPos + 3.5, cursorY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text(m.sub, xPos + 3.5, cursorY + 14.5);
  });

  cursorY += 24;

  // Section 1: Resumen y Arquitectura General
  drawSectionTitle('1. DESCRIPCIÓN GENERAL Y PROPÓSITO DEL SISTEMA', 'Solución de nivel empresarial para control laboral y cumplimiento normativo.');

  drawParagraph(
    'Urcheck BioCloud es una plataforma moderna y completa concebida para automatizar el ciclo completo de control de asistencia, mitigación del ausentismo no justificado, cálculo preliminar de nómina y expediente digital de colaboradores. Diseñado para operar con cero margen de suplantación mediante cotejo fotográfico facial obligatorio, geocercas satelitales GPS y auditoría en tiempo real.'
  );

  drawBullet('Cero Suplantación (Anti-Buddy Punching)', 'Cada marcaje captura una fotografía en vivo (selfie de evidencia) y registra la geolocalización satelital exacta para corroboración de Recursos Humanos.');
  drawBullet('Alta Disponibilidad y Modo Offline', 'Permite operaciones ininterrumpidas incluso en contingencias de red, sincronizando automáticamente los datos con la nube al restablecer la conexión.');
  drawBullet('Capacidad Multi-Dispositivo y Modo Kiosco', 'Se adapta a teléfonos inteligentes, computadoras portátiles y terminales fijas táctiles (tablets) ubicadas en casetas de acceso o recepciones.');

  cursorY += 4;

  // Section 2: Roles de Acceso
  drawSectionTitle('2. ROLES DE USUARIO Y ALCANCE OPERATIVO', 'Matriz de segregación de funciones para colaboradores, supervisores y terminales.');

  const roles = [
    {
      name: 'ROL 1: COLABORADOR / EMPLEADO',
      desc: 'Orientado al personal operativo y administrativo para el registro ágil de su jornada laboral, solicitud formal de permisos, justificación de incidencias y consulta de su expediente digital.',
      color: colorAccent,
    },
    {
      name: 'ROL 2: ADMINISTRADOR / RECURSOS HUMANOS',
      desc: 'Control total de la infraestructura laboral: monitoreo de asistencia en tiempo real, corroboración visual con foto selfie, dictamen de permisos, configuración de turnos y pre-nómina.',
      color: colorPrimary,
    },
    {
      name: 'ROL 3: TERMINAL DE ACCESO (MODO KIOSCO)',
      desc: 'Interfaz optimizada para pantalla táctil en recepción o entrada de planta. Opera en pantalla completa desatendida con reinicio automático a los 5 segundos de cada marcaje.',
      color: colorSuccess,
    },
  ];

  roles.forEach(r => {
    drawCalloutBox(r.name, r.desc, r.color);
  });

  /* =========================================================================
     PAGE 2: CHECKLIST DETALLADO DE FUNCIONES POR ROL
     ========================================================================= */
  checkPageBreak(pageHeight);

  drawSectionTitle('3. CHECKLIST EXHAUSTIVO DE FUNCIONALIDADES POR ROL', 'Matriz completa de capacidades operativas implementadas y activas.');

  drawSubSectionTitle('A. FUNCIONALIDADES DEL ROL EMPLEADO (COLABORADOR)');
  drawChecklistItem('Marcaje de 4 eventos: Entrada a Laborar, Salida a Almuerzo, Regreso y Salida de Turno', 'Checadora');
  drawChecklistItem('Escaneo Facial con cámara en vivo, visor HUD y captura de foto selfie de evidencia', 'Biometría');
  drawChecklistItem('Alternancia de cámara frontal y trasera para uso óptimo en teléfonos móviles y tablets', 'Hardware');
  drawChecklistItem('Soporte de carga fotográfica manual ante fallos de hardware o restricciones del navegador', 'Contingencia');
  drawChecklistItem('Modo biométrico por Huella Dactilar óptica con simulación de porcentaje de coincidencia', 'Biometría');
  drawChecklistItem('Modo de lectura por Tarjeta de Proximidad RFID y Teclado Numérico con PIN de seguridad', 'Alternativo');
  drawChecklistItem('Emisión de Comprobante Laboral Digital instantáneo con folio único SHA-256 descargable', 'Legal');
  drawChecklistItem('Historial del Día con desglose de horas laboradas y estado de puntualidad', 'Consulta');
  drawChecklistItem('Bandeja de Avisos y Notificaciones operativas con contador dinámico de pendientes', 'Avisos');
  drawChecklistItem('Módulo de Permisos e Incidencias con carga de justificantes médicos y constancias', 'Solicitudes');
  drawChecklistItem('Módulo de Horas Extras con horario de inicio/fin y seguimiento de dictamen', 'Jornada');
  drawChecklistItem('Expediente Laboral Digital con gafete con código QR y constancias de servicio', 'Expediente');
  drawChecklistItem('Manual de Operación Interactivo paso a paso disponible directamente en el menú', 'Ayuda');

  cursorY += 4;
  drawSubSectionTitle('B. FUNCIONALIDADES DEL ROL ADMINISTRADOR (RECURSOS HUMANOS)');
  drawChecklistItem('Tablero de Mando Ejecutivo (Dashboard) con métricas en tiempo real y tasa de puntualidad', 'KPIs');
  drawChecklistItem('Alertas tempranas automáticas de ausentismo crítico, retardos graves y faltas acumuladas', 'Alertas');
  drawChecklistItem('Pase de Lista en Vivo con foto selfie capturada, método utilizado y geolocalización satelital', 'Monitoreo');
  drawChecklistItem('Módulo de Corroboración de Marcajes: inspección comparativa de foto y justificación manual', 'Auditoría');
  drawChecklistItem('Corroboración en Lote de múltiples asistencias para optimizar tiempos de supervisión', 'Operación');
  drawChecklistItem('Directorio Centralizado de Empleados con alta, edición, suspensión y credenciales QR', 'Personal');
  drawChecklistItem('Compartir Credencial Digital directamente vía WhatsApp o Correo Electrónico', 'Distribución');
  drawChecklistItem('Gestión Multisede de Sucursales con Geocercas GPS y radio de tolerancia en metros', 'Sucursales');
  drawChecklistItem('Configuración de Turnos Laborales: matutino, vespertino, nocturno y tiempos de gracia', 'Horarios');
  drawChecklistItem('Pre-Nómina Automatizada con cálculo de deducciones por retardos, faltas y horas extras', 'Nómina');
  drawChecklistItem('Bandeja de Dictamen de Solicitudes de Permiso con aprobación/rechazo y justificación', 'Incidencias');
  drawChecklistItem('Autorización formal de Horas Extras con comparativa contra checadas reales', 'Supervisión');
  drawChecklistItem('Bitácora de Auditoría Inmutable (Audit Log) con trazabilidad total de cambios y usuarios', 'Seguridad');
  drawChecklistItem('Sincronización manual y reactiva con base de datos central Supabase Cloud', 'Conectividad');

  cursorY += 4;
  drawSubSectionTitle('C. FUNCIONALIDADES DEL MODO KIOSCO (TERMINAL DESATENDIDA)');
  drawChecklistItem('Modo Pantalla Completa bloqueada para tablets y terminales de acceso en recepción', 'Kiosco');
  drawChecklistItem('Reinicio automático de pantalla a los 5 segundos tras completar el marcaje de asistencia', 'Automatismo');
  drawChecklistItem('Salida del modo protegida con confirmación administrativa para evitar cierres accidentales', 'Seguridad');

  /* =========================================================================
     PAGE 3: FLUJO DE TRABAJO OPERATIVO (WORKFLOW)
     ========================================================================= */
  checkPageBreak(pageHeight);

  drawSectionTitle('4. FLUJO DE TRABAJO OPERATIVO DEL SISTEMA (WORKFLOW)', 'Ciclo de vida de la información desde la configuración hasta el cierre de nómina.');

  const workflowSteps = [
    {
      step: 'FASE 1: ALTA Y ENROLAMIENTO',
      actor: 'Administrador de Recursos Humanos',
      desc: '1. Se crean las Sucursales y se definen sus Geocercas satelitales oficiales (latitud, longitud y radio en metros).\n2. Se configuran los Turnos de Trabajo (horas de entrada, salida, tiempos de gracia y tolerancia).\n3. Se registra al Empleado en el sistema, subiendo su foto de referencia y asignando su PIN y tarjeta RFID.',
    },
    {
      step: 'FASE 2: JORNADA Y REGISTRO EN VIVO',
      actor: 'Colaborador (Móvil o Terminal Kiosco)',
      desc: '1. El colaborador abre la aplicación o se presenta en la tablet de acceso.\n2. Selecciona el evento: Entrada, Salida a Comer, Regreso o Salida de Turno.\n3. Se posiciona en la cámara: el visor HUD escanea el rostro, captura la selfie de evidencia y valida coordenadas GPS.\n4. El sistema emite confirmación auditiva y genera el Comprobante Digital con Folio único SHA-256.',
    },
    {
      step: 'FASE 3: SINCRONIZACIÓN Y MONITOREO REAL-TIME',
      actor: 'Motor Cloud & Supervisor',
      desc: '1. La información se persiste de inmediato en la base de datos central PostgreSQL en la nube.\n2. El Dashboard actualiza los KPIs de puntualidad y asistencia en tiempo real.\n3. Si un empleado no registra entrada tras el tiempo de gracia, el sistema genera una alerta de ausentismo.',
    },
    {
      step: 'FASE 4: GESTIÓN DE INCIDENCIAS Y PERMISOS',
      actor: 'Colaborador y Supervisor',
      desc: '1. El empleado solicita permisos (vacaciones, incapacidades) adjuntando comprobantes.\n2. El Administrador revisa los documentos en la bandeja de dictamen y aprueba o rechaza con comentarios.\n3. Se calculan las horas extraordinarias debidamente autorizadas por la jefatura.',
    },
    {
      step: 'FASE 5: PRE-NÓMINA Y AUDITORÍA FINAL',
      actor: 'Departamento Contable y RRHH',
      desc: '1. Al cierre del período (quincenal o mensual), el Administrador genera el cálculo de incidencias.\n2. El sistema aplica deducciones por retardos, faltas injustificadas y suma de horas extras dobles/triples.\n3. Se exporta la sábana consolidada en formato CSV/Excel para dispersión y archivo contable.',
    },
  ];

  workflowSteps.forEach(ws => {
    checkPageBreak(25);
    doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(marginX, cursorY, contentWidth, 23, 2, 2, 'FD');

    doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.roundedRect(marginX, cursorY, 2.5, 23, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(ws.step, marginX + 5, cursorY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text(`Responsable: ${ws.actor}`, marginX + 5, cursorY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorText[0], colorText[1], colorText[2]);
    const lines = doc.splitTextToSize(ws.desc, contentWidth - 8);
    doc.text(lines, marginX + 5, cursorY + 13.5);

    cursorY += 26;
  });

  /* =========================================================================
     PAGE 4: ESPECIFICACIONES TÉCNICAS Y DE ARQUITECTURA
     ========================================================================= */
  checkPageBreak(pageHeight);

  drawSectionTitle('5. ESPECIFICACIONES TÉCNICAS Y CARACTERÍSTICAS DEL SISTEMA', 'Ficha técnica de desarrollo, arquitectura de base de datos y estándares de seguridad.');

  drawSubSectionTitle('A. ARQUITECTURA DE SOFTWARE');
  drawBullet('Paradigma', 'Single Page Application (SPA) con arquitectura modular basada en componentes reactivos.');
  drawBullet('Lenguaje de Programación', 'TypeScript con tipado estricto para máxima fiabilidad y cero errores en tiempo de ejecución.');
  drawBullet('Librería de Renderizado', 'React 18 con gestión de estado global reactivo y Hooks de ciclo de vida.');
  drawBullet('Sistema de Diseño & UI', 'Tailwind CSS con paleta institucional de alto contraste, tipografía optimizada y accesibilidad WCAG AA.');

  cursorY += 3;
  drawSubSectionTitle('B. BASE DE DATOS Y CONECTIVIDAD');
  drawBullet('Motor de Persistencia', 'PostgreSQL relacional alojado en la nube con escalabilidad horizontal.');
  drawBullet('Sincronización en Vivo', 'Conectores en tiempo real que transmiten altas, marcajes y solicitudes de forma instantánea.');
  drawBullet('Almacenamiento de Evidencias', 'Storage seguro para fotografías selfies capturadas en el punto de marcaje.');

  cursorY += 3;
  drawSubSectionTitle('C. SEGURIDAD Y CUMPLIMIENTO LEGAL');
  drawBullet('Protección Anti-Suplantación', 'Cada marcaje almacena foto selfie en vivo y coordenadas GPS para auditoría cruzada.');
  drawBullet('Sello de Tiempo Criptográfico', 'Cada folio de asistencia se sella con algoritmo SHA-256 inmutable.');
  drawBullet('Bitácora de Auditoría (Audit Trail)', 'Registro inalterable de cada acción administrativa con usuario, fecha, hora y notas.');

  cursorY += 3;
  drawSubSectionTitle('D. TECNOLOGÍA PROGRESIVA (PWA) Y RESPONSIVIDAD');
  drawBullet('Instalación Nativa (PWA)', 'Instalable directamente en teléfonos Android, iPhone, tablets y PC sin necesidad de tiendas de apps.');
  drawBullet('Diseño 100% Responsivo', 'Adaptación milimétrica a pantallas desde 360px hasta monitores de escritorio sin desbordamientos.');

  cursorY += 6;

  // Final Certification / Validity Block
  checkPageBreak(25);
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.roundedRect(marginX, cursorY, contentWidth, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DOCUMENTO DE CERTIFICACIÓN TÉCNICA OFICIAL', marginX + 6, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 240, 255);
  doc.text('Este documento describe las funcionalidades activas de Urcheck BioCloud v5.2 Enterprise.', marginX + 6, cursorY + 11.5);
  doc.text(`Generado digitalmente por el sistema • Trazabilidad: SHA-256-VALID-ENTERPRISE • ${todayStr}`, marginX + 6, cursorY + 15.5);

  // Add Page Numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('Urcheck BioCloud Enterprise • Control Biométrico y Expediente Digital', marginX, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF file to trigger download
  const dateFormatted = new Date().toISOString().split('T')[0];
  doc.save(`Urcheck_BioCloud_Especificaciones_Roles_y_Manual_${dateFormatted}.pdf`);
};
