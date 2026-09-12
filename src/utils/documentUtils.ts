import { CompanyDocument, DigitalSignature } from '../types';

export function generateSecurityHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 48; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SHA-256:${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

// Generate an initial SVG data URL for a realistic admin signature
export function createSampleSignatureSvg(name: string, roleTitle: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
    <path d="M 20 70 Q 50 15, 80 60 T 130 50 Q 160 20, 190 65 T 250 45" fill="none" stroke="#082735" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 40 45 Q 90 85, 220 55" fill="none" stroke="#0871A0" stroke-width="1.8" stroke-linecap="round"/>
    <text x="30" y="88" font-family="sans-serif" font-size="10" fill="#64748b" font-style="italic">Firmado digitalmente: ${name}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    id: 'doc-comp-001',
    code: 'CON-INDET-2026-001',
    title: 'Contrato Individual de Trabajo por Tiempo Indeterminado',
    category: 'contrato',
    categoryLabel: 'Contrato Laboral',
    description: 'Contrato formal de trabajo que estipula derechos, jornada laboral, prestaciones de ley y relación contractual patrono-trabajador.',
    fileSize: '1.4 MB',
    fileName: 'Contrato_Individual_Carlos_Mendoza_2026.pdf',
    uploadedAt: '2026-01-15',
    uploadedBy: 'Lic. Fernanda Soto (Directora RRHH)',
    targetEmployeeId: 'emp-001',
    targetEmployeeName: 'Carlos Mendoza Ortiz',
    contentClauses: [
      'PRIMERA. OBJETO Y CARGO: El trabajador se compromete a prestar sus servicios subordinados en el puesto de Ingeniero de Operaciones Senior, desempeñando las actividades descritas en el manual institucional.',
      'SEGUNDA. JORNADA LABORAL Y SEDE: La prestación del servicio se realizará en la sede Corporativo Reforma, con sujeción al sistema de marcaje biométrico y horario legal pactado.',
      'TERCERA. SALARIO Y PRESTACIONES: La empresa abonará al trabajador la remuneración acordada, incluyendo aguinaldo superior a la ley, prima vacacional y seguridad social conforme a la LFT.',
      'CUARTA. PROPIEDAD INTELECTUAL Y CONFIDENCIALIDAD: Toda invención, código, metodología o desarrollo ejecutado durante la relación laboral pertenecerá en exclusiva a la patronal.',
      'QUINTA. JURISDICCIÓN Y FIRMA: Las partes convienen que la presente firma electrónica surtirá los mismos efectos jurídicos que la firma autógrafa conforme al Código de Comercio y legislación laboral.',
    ],
    requiresAdminSignature: true,
    isAdminSigned: true,
    adminSignature: {
      id: 'sig-adm-01',
      signerName: 'Lic. Fernanda Soto Vargas',
      signerRole: 'admin',
      signerTitle: 'Directora de Recursos Humanos',
      signedAt: '15 Ene 2026, 10:15 hrs',
      signatureImage: createSampleSignatureSvg('Lic. Fernanda Soto Vargas', 'Directora RRHH'),
      ipAddress: '192.168.10.15 (Corporativo)',
      deviceInfo: 'Terminal Central RRHH • macOS Chrome',
      securityHash: 'SHA-256:9f83a1b4...2c0e81f7',
    },
    requiresEmployeeSignature: true,
    isEmployeeSigned: false, // Pending employee signature!
    status: 'pending_employee',
  },
  {
    id: 'doc-comp-002',
    code: 'NDA-CORP-2026-014',
    title: 'Convenio de Confidencialidad y Secreto Industrial (NDA)',
    category: 'nda',
    categoryLabel: 'Convenio de Confidencialidad',
    description: 'Acuerdo de no divulgación sobre sistemas biométricos, bases de datos de clientes, código fuente y secretos comerciales de Urcheck.',
    fileSize: '840 KB',
    fileName: 'Convenio_NDA_Secreto_Industrial.pdf',
    uploadedAt: '2026-02-01',
    uploadedBy: 'Lic. Fernanda Soto (Directora RRHH)',
    targetEmployeeId: 'all',
    targetEmployeeName: 'Todos los Colaboradores',
    contentClauses: [
      'PRIMERA. INFORMACIÓN CONFIDENCIAL: Se entenderá por información confidencial todo dato, algoritmo, arquitectura de red, credenciales y registros de asistencia.',
      'SEGUNDA. OBLIGACIÓN DE CUSTODIA: El colaborador se obliga a guardar estricta reserva de la información a la que tenga acceso y no divulgarla sin consentimiento por escrito.',
      'TERCERA. VIGENCIA: Las obligaciones de secrecía subsistirán durante la vigencia de la relación laboral y hasta por 5 años posteriores a su terminación.',
      'CUARTA. SANCIONES: La infracción a este convenio constituirá causa justificada de rescisión laboral sin responsabilidad para el patrón, con reserva de acciones penales y civiles.',
    ],
    requiresAdminSignature: true,
    isAdminSigned: true,
    adminSignature: {
      id: 'sig-adm-02',
      signerName: 'Lic. Fernanda Soto Vargas',
      signerRole: 'admin',
      signerTitle: 'Directora de Recursos Humanos',
      signedAt: '01 Feb 2026, 09:30 hrs',
      signatureImage: createSampleSignatureSvg('Lic. Fernanda Soto Vargas', 'Directora RRHH'),
      ipAddress: '192.168.10.15',
      deviceInfo: 'Terminal Central RRHH',
      securityHash: 'SHA-256:4c718a22...bb901e33',
    },
    requiresEmployeeSignature: true,
    isEmployeeSigned: true, // Signed by Carlos!
    employeeSignature: {
      id: 'sig-emp-01',
      signerName: 'Carlos Mendoza Ortiz',
      signerRole: 'employee',
      signerTitle: 'Ingeniero de Operaciones Senior',
      signedAt: '02 Feb 2026, 14:22 hrs',
      signatureImage: createSampleSignatureSvg('Carlos Mendoza Ortiz', 'Colaborador'),
      ipAddress: '189.204.14.82 (Móvil 5G)',
      deviceInfo: 'Dispositivo Móvil iPhone 15 Pro • Safari Mobile',
      securityHash: 'SHA-256:d82e441a...a3098f12',
    },
    status: 'signed_both',
  },
  {
    id: 'doc-comp-003',
    code: 'ADD-REM-2026-088',
    title: 'Adenda de Trabajo Híbrido y Apoyo Tecnológico 2026',
    category: 'addendum',
    categoryLabel: 'Addendum Contractual',
    description: 'Actualización sobre políticas de trabajo remoto, teletrabajo NOM-037 y asignación de equipo portátil para operaciones.',
    fileSize: '620 KB',
    fileName: 'Addendum_Politica_Teletrabajo_2026.pdf',
    uploadedAt: '2026-03-01',
    uploadedBy: 'Lic. Fernanda Soto (Directora RRHH)',
    targetEmployeeId: 'emp-001',
    targetEmployeeName: 'Carlos Mendoza Ortiz',
    contentClauses: [
      'PRIMERA. MODALIDAD: Se acuerda esquema de trabajo híbrido con 3 días presenciales en Corporativo Reforma y 2 días de jornada remota.',
      'SEGUNDA. ERGONOMÍA Y EQUIPO: La empresa asigna equipo de cómputo portátil con candado de seguridad, comprometiéndose el empleado a su cuidado.',
      'TERCERA. REGISTRO DE JORNADA: El colaborador utilizará la aplicación móvil Urcheck para registrar su jornada mediante geolocalización y reconocimiento facial.',
    ],
    requiresAdminSignature: true,
    isAdminSigned: false, // Pending Admin signature!
    requiresEmployeeSignature: true,
    isEmployeeSigned: false, // Pending Employee signature!
    status: 'pending_both',
  },
  {
    id: 'doc-comp-004',
    code: 'RIT-REV-2026',
    title: 'Reglamento Interior de Trabajo y Código de Ética',
    category: 'politica',
    categoryLabel: 'Reglamento y Políticas',
    description: 'Disposiciones normativas que rigen el orden, higiene, disciplina y convivencia en todas las instalaciones y plantas de la empresa.',
    fileSize: '2.1 MB',
    fileName: 'Reglamento_Interior_Trabajo_2026.pdf',
    uploadedAt: '2026-01-10',
    uploadedBy: 'Lic. Fernanda Soto (Directora RRHH)',
    targetEmployeeId: 'all',
    targetEmployeeName: 'Todos los Colaboradores',
    contentClauses: [
      'ARTÍCULO 1. OBLIGATORIEDAD: El presente reglamento es de observancia obligatoria para todos los trabajadores que laboren en la empresa.',
      'ARTÍCULO 8. ASISTENCIA Y PUNTUALIDAD: Todo colaborador deberá registrar su ingreso y salida en los lectores biométricos asignados a su centro de trabajo.',
      'ARTÍCULO 15. TOLERANCIA: Se estipula una tolerancia máxima de 10 minutos para el registro de entrada según el turno asignado.',
      'ARTÍCULO 24. SEGURIDAD E HIGIENE: Es mandatorio portar gafete visible y el equipo de protección personal en áreas operativas y de planta.',
    ],
    requiresAdminSignature: true,
    isAdminSigned: true,
    adminSignature: {
      id: 'sig-adm-04',
      signerName: 'Lic. Fernanda Soto Vargas',
      signerRole: 'admin',
      signerTitle: 'Directora de Recursos Humanos',
      signedAt: '10 Ene 2026, 08:00 hrs',
      signatureImage: createSampleSignatureSvg('Lic. Fernanda Soto Vargas', 'Directora RRHH'),
      ipAddress: '192.168.10.15',
      deviceInfo: 'Terminal Central RRHH',
      securityHash: 'SHA-256:1a84f390...44bb8271',
    },
    requiresEmployeeSignature: true,
    isEmployeeSigned: false,
    status: 'pending_employee',
  }
];

// Triggers download of the officially certified document with both signatures and security certificate
export function downloadCertifiedDocument(doc: CompanyDocument) {
  const adminSigBlock = doc.adminSignature ? `
    <div style="flex: 1; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; background: #f8fafc;">
      <div style="font-size: 10px; font-weight: bold; color: #0871A0; text-transform: uppercase;">Firma por la Empresa (Patrón / RRHH)</div>
      <div style="margin: 8px 0; height: 50px;">
        <img src="${doc.adminSignature.signatureImage}" alt="Firma Admin" style="max-height: 50px; max-width: 100%; object-fit: contain;" />
      </div>
      <div style="font-weight: bold; font-size: 12px; color: #0f172a;">${doc.adminSignature.signerName}</div>
      <div style="font-size: 11px; color: #64748b;">${doc.adminSignature.signerTitle || 'Recursos Humanos'}</div>
      <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Fecha: ${doc.adminSignature.signedAt}</div>
      <div style="font-size: 9px; font-family: monospace; color: #059669; margin-top: 2px;">✓ ${doc.adminSignature.securityHash}</div>
    </div>
  ` : `
    <div style="flex: 1; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; text-align: center; color: #94a3b8; font-size: 11px;">
      [ Pendiente de Firma Institucional ]
    </div>
  `;

  const employeeSigBlock = doc.employeeSignature ? `
    <div style="flex: 1; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; background: #f8fafc;">
      <div style="font-size: 10px; font-weight: bold; color: #138128; text-transform: uppercase;">Firma Digital del Colaborador (Empleado)</div>
      <div style="margin: 8px 0; height: 50px;">
        <img src="${doc.employeeSignature.signatureImage}" alt="Firma Empleado" style="max-height: 50px; max-width: 100%; object-fit: contain;" />
      </div>
      <div style="font-weight: bold; font-size: 12px; color: #0f172a;">${doc.employeeSignature.signerName}</div>
      <div style="font-size: 11px; color: #64748b;">${doc.employeeSignature.signerTitle || 'Colaborador Asignado'}</div>
      <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Fecha: ${doc.employeeSignature.signedAt} • Dispositivo Móvil</div>
      <div style="font-size: 9px; font-family: monospace; color: #059669; margin-top: 2px;">✓ ${doc.employeeSignature.securityHash}</div>
    </div>
  ` : `
    <div style="flex: 1; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; text-align: center; color: #94a3b8; font-size: 11px;">
      [ Pendiente de Firma del Empleado ]
    </div>
  `;

  const clausesHtml = doc.contentClauses.map((clause, idx) => `
    <div style="margin-bottom: 12px; font-size: 12px; line-height: 1.6; color: #334155;">
      <strong>${clause.split(':')[0]}:</strong>${clause.split(':').slice(1).join(':')}
    </div>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${doc.title} - Copia Certificada Urcheck</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0A3142; padding-bottom: 20px; margin-bottom: 25px; }
        .logo-title { font-size: 20px; font-weight: 900; color: #0A3142; }
        .code { font-family: monospace; font-size: 12px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; color: #475569; }
        .doc-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; }
        .badge { display: inline-block; padding: 3px 10px; background: #e0f2fe; color: #0369a1; border-radius: 12px; font-size: 11px; font-weight: bold; margin-bottom: 20px; }
        .clauses { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #fff; margin-bottom: 30px; }
        .signatures { display: flex; gap: 20px; margin-top: 30px; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: #065f46; font-weight: bold;">✓ Documento Certificado y Firmado Digitalmente en Urcheck Cloud</span>
        <button onclick="window.print()" style="background: #0A3142; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimir / Guardar en PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="logo-title">URCHECK® ENTERPRISE</div>
          <div style="font-size: 11px; color: #64748b;">Sistema Institucional de Gestión y Control Laboral</div>
        </div>
        <div style="text-align: right;">
          <div class="code">${doc.code}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Fecha de emisión: ${doc.uploadedAt}</div>
        </div>
      </div>

      <span class="badge">${doc.categoryLabel.toUpperCase()}</span>
      <div class="doc-title">${doc.title}</div>
      <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">
        Asignado a: <strong>${doc.targetEmployeeName || 'Todos los colaboradores'}</strong> • Registrado por: <strong>${doc.uploadedBy}</strong>
      </p>

      <div class="clauses">
        ${clausesHtml}
      </div>

      <div style="font-size: 12px; font-weight: bold; color: #0A3142; margin-bottom: 10px;">
        ESTAMPA DE FIRMAS Y VALIDEZ LEGAL DIGITAL
      </div>

      <div class="signatures">
        ${adminSigBlock}
        ${employeeSigBlock}
      </div>

      <div class="footer">
        Este documento ha sido suscrito mediante Firma Electrónica Avanzada conforme a la legislación aplicable, conservando plena validez legal y valor probatorio.<br/>
        Identificador Único Transaccional Urcheck: ${doc.id} • Hash Auditoría: ${generateSecurityHash()}
      </div>

      <script>
        // Auto trigger print prompt for immediate PDF download
        setTimeout(() => {
          window.print();
        }, 800);
      </script>
    </body>
    </html>
  `;

  // Open printable window or download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    // Fallback direct download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_Firmado.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
