import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PenTool, 
  Download, 
  Eye, 
  Trash2, 
  Users, 
  Lock, 
  Building2, 
  Calendar, 
  X,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { CompanyDocument, DigitalSignature, Employee, UserProfile } from '../../types';
import { DigitalSignatureModal } from '../../components/DigitalSignatureModal';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { downloadCertifiedDocument } from '../../utils/documentUtils';

interface DocumentsViewProps {
  documents: CompanyDocument[];
  employees: Employee[];
  currentUser: UserProfile;
  onAddDocument: (doc: CompanyDocument) => void;
  onUpdateDocument: (doc: CompanyDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  employees,
  currentUser,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<CompanyDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<CompanyDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'contrato' | 'nda' | 'politica' | 'addendum' | 'constancia'>('contrato');
  const [newTargetEmpId, setNewTargetEmpId] = useState<string>('all');
  const [newDescription, setNewDescription] = useState('');
  const [newClausesText, setNewClausesText] = useState(
    'PRIMERA. OBJETO: El colaborador desempeñará las funciones encomendadas conforme al perfil de puesto.\nSEGUNDA. CUMPLIMIENTO: Se mantendrá apego irrestricto a los reglamentos y normatividad interna.\nTERCERA. VIGENCIA Y FIRMA: Este documento adquiere validez jurídica inmediata al estamparse las firmas digitales.'
  );
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [adminSignsNow, setAdminSignsNow] = useState(true);

  // Quick stats
  const totalDocs = documents.length;
  const fullySignedCount = documents.filter(d => d.isAdminSigned && d.isEmployeeSigned).length;
  const pendingEmployeeCount = documents.filter(d => !d.isEmployeeSigned).length;
  const pendingAdminCount = documents.filter(d => !d.isAdminSigned).length;

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.targetEmployeeName && doc.targetEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'fully_signed') {
      matchesStatus = doc.isAdminSigned && doc.isEmployeeSigned;
    } else if (statusFilter === 'pending_employee') {
      matchesStatus = !doc.isEmployeeSigned;
    } else if (statusFilter === 'pending_admin') {
      matchesStatus = !doc.isAdminSigned;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const categoryLabels: Record<string, string> = {
      contrato: 'Contrato Laboral',
      nda: 'Convenio Confidencialidad',
      politica: 'Reglamento y Políticas',
      addendum: 'Addendum Contractual',
      constancia: 'Constancia Laboral',
    };

    const targetEmp = employees.find(e => e.id === newTargetEmpId);
    const targetName = newTargetEmpId === 'all' ? 'Todos los Colaboradores' : (targetEmp?.name || 'Colaborador Específico');

    const clauses = newClausesText
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    const docCode = `${newCategory.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc: CompanyDocument = {
      id: `doc-comp-${Date.now()}`,
      code: docCode,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Documento Oficial',
      description: newDescription.trim() || `Documento oficial ${newTitle} emitido para ${targetName}.`,
      fileSize: selectedFileName ? '1.8 MB' : '950 KB',
      fileName: selectedFileName || `${docCode}_${newTitle.replace(/\s+/g, '_')}.pdf`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: `${currentUser.name} (${currentUser.roleName})`,
      targetEmployeeId: newTargetEmpId,
      targetEmployeeName: targetName,
      contentClauses: clauses.length > 0 ? clauses : ['PRIMERA. VIGENCIA: Documento oficial y vinculante.'],
      requiresAdminSignature: true,
      isAdminSigned: false,
      requiresEmployeeSignature: true,
      isEmployeeSigned: false,
      status: 'pending_both',
    };

    onAddDocument(newDoc);
    setIsUploadOpen(false);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setSelectedFileName('');

    if (adminSignsNow) {
      // Automatically prompt admin to sign the newly created document
      setSigningDoc(newDoc);
      setToastMessage(`Documento "${newDoc.title}" registrado. Procede a estampar tu firma patronal.`);
    } else {
      setToastMessage(`Documento "${newDoc.title}" subido y sincronizado con el colaborador.`);
    }

    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAdminSignatureSaved = (sig: DigitalSignature) => {
    if (!signingDoc) return;

    const updated: CompanyDocument = {
      ...signingDoc,
      isAdminSigned: true,
      adminSignature: sig,
      status: signingDoc.isEmployeeSigned ? 'signed_both' : 'pending_employee',
    };

    onUpdateDocument(updated);

    if (viewingDoc && viewingDoc.id === updated.id) {
      setViewingDoc(updated);
    }

    setSigningDoc(null);
    setToastMessage(`Firma patronal estampada con éxito en "${updated.title}". Sincronizado en tiempo real.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = (docId: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar el documento "${title}" del sistema?`)) {
      onDeleteDocument(docId);
      setToastMessage(`Documento "${title}" eliminado.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div id="admin-documents-view" className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0871A0]/10 text-[#0871A0]">
              Gestión Documental Patronal
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sincronización Móvil Activa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A3142] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0871A0]" />
            Mis Documentos y Contratos Digitales
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 max-w-2xl">
            Sube o importa contratos laborales, addendums y convenios confidenciales. Los colaboradores reciben y firman digitalmente desde su teléfono móvil con validez jurídica.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Subir / Importar Documento</span>
          </button>
        </div>
      </div>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Total Documentos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#0A3142]">{totalDocs}</span>
            <FileText className="w-5 h-5 text-neutral-400" />
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">En expediente central</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase block">100% Firmados</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">{fullySignedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Con ambas firmas digitales</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Firma Empleado Pendiente</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{pendingEmployeeCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Esperando firma en móvil</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Firma Admin Pendiente</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-[#0871A0]">{pendingAdminCount}</span>
            <PenTool className="w-5 h-5 text-[#0871A0]" />
          </div>
          <span className="text-[11px] text-[#0871A0] mt-1 block">Requiere tu firma patronal</span>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por título, código o nombre de colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-neutral-50 focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="all">Todas las Categorías</option>
            <option value="contrato">Contratos Laborales</option>
            <option value="nda">Convenios NDA</option>
            <option value="addendum">Addendums</option>
            <option value="politica">Políticas y Reglamentos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-neutral-50 focus:ring-2 focus:ring-[#0871A0]"
          >
            <option value="all">Todos los Estatus</option>
            <option value="fully_signed">Firmados por Ambas Partes</option>
            <option value="pending_employee">Pendiente Firma Empleado</option>
            <option value="pending_admin">Pendiente Firma Admin</option>
          </select>
        </div>
      </div>

      {/* 4. Documents Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Documento / Código</th>
                <th className="py-3.5 px-4">Asignado a</th>
                <th className="py-3.5 px-4">Firma Patronal (RRHH)</th>
                <th className="py-3.5 px-4">Firma Colaborador (Móvil)</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No se encontraron documentos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isBothSigned = doc.isAdminSigned && doc.isEmployeeSigned;

                  return (
                    <tr key={doc.id} className="hover:bg-neutral-50/60 transition">
                      
                      {/* Doc Title & Code */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isBothSigned ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0871A0]'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-[#0A3142] block leading-tight">
                              {doc.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                              <span className="font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {doc.code}
                              </span>
                              <span className="text-[#0871A0] font-semibold">
                                {doc.categoryLabel}
                              </span>
                              <span className="text-neutral-400">• {doc.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Employee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          {doc.targetEmployeeName || 'Todos los colaboradores'}
                        </span>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          {doc.targetEmployeeId === 'all' ? 'Difusión general' : `ID: ${doc.targetEmployeeId}`}
                        </span>
                      </td>

                      {/* Admin Signature Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.isAdminSigned && doc.adminSignature ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-12 bg-white border border-neutral-200 rounded p-0.5 shrink-0 flex items-center justify-center">
                              <img src={doc.adminSignature.signatureImage} alt="Firma" className="max-h-full max-w-full" />
                            </div>
                            <div>
                              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Firmado
                              </span>
                              <span className="text-[10px] text-neutral-400 block">{doc.adminSignature.signedAt}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSigningDoc(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A3142] hover:bg-[#082735] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <PenTool className="w-3 h-3 text-emerald-400" />
                            <span>Firmar Ahora</span>
                          </button>
                        )}
                      </td>

                      {/* Employee Signature Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.isEmployeeSigned && doc.employeeSignature ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-12 bg-white border border-neutral-200 rounded p-0.5 shrink-0 flex items-center justify-center">
                              <img src={doc.employeeSignature.signatureImage} alt="Firma" className="max-h-full max-w-full" />
                            </div>
                            <div>
                              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Firmado en Móvil
                              </span>
                              <span className="text-[10px] text-neutral-400 block">{doc.employeeSignature.signedAt}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              <Clock className="w-3 h-3 text-amber-600" /> Pendiente en App Móvil
                            </span>
                            <span className="text-[10px] text-neutral-400 block">
                              Descarga del empleado bloqueada
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          title="Ver documento completo y cláusulas"
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-[#0871A0] hover:bg-[#0871A0]/10 transition cursor-pointer inline-flex items-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadCertifiedDocument(doc)}
                          title="Descargar copia oficial certificada"
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer inline-flex items-center"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          title="Eliminar documento"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0871A0]">
                  Nuevo Expediente Digital
                </span>
                <h3 className="text-lg font-bold text-[#0A3142]">
                  Subir o Importar Documento / Contrato
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs sm:text-sm">
              
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-[#0871A0]/40 rounded-2xl p-5 text-center bg-blue-50/20 hover:bg-blue-50/40 transition">
                <UploadCloud className="w-8 h-8 text-[#0871A0] mx-auto mb-2" />
                <label className="cursor-pointer block">
                  <span className="font-bold text-[#0A3142] hover:underline block">
                    {selectedFileName || 'Haz clic para explorar o arrastra tu archivo aquí'}
                  </span>
                  <span className="text-neutral-400 text-xs mt-0.5 block">
                    Acepta PDF, Word (.docx), escaneos oficiales (Hasta 25 MB)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedFileName(file.name);
                        if (!newTitle) {
                          setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                        }
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Contrato Individual de Trabajo 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0871A0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-[#0871A0]"
                  >
                    <option value="contrato">Contrato Laboral Formal</option>
                    <option value="nda">Convenio de Confidencialidad (NDA)</option>
                    <option value="addendum">Addendum / Modificación Salarial</option>
                    <option value="politica">Reglamento Interior / Políticas</option>
                    <option value="constancia">Constancia o Carta Patronal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Asignar al Colaborador *
                  </label>
                  <select
                    value={newTargetEmpId}
                    onChange={(e) => setNewTargetEmpId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-[#0871A0]"
                  >
                    <option value="all">🌟 Todos los Colaboradores (General)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode} - {emp.branchName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Descripción o Resumen Ejecutivo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Establece términos contractuales y salario convenido."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Cláusulas Legales Vinculantes (Una por renglón)
                </label>
                <textarea
                  rows={4}
                  value={newClausesText}
                  onChange={(e) => setNewClausesText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-[#0871A0]"
                />
              </div>

              {/* Admin auto-sign option */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#0871A0]" />
                  <div>
                    <span className="text-xs font-bold text-[#0A3142] block">
                      Firmar inmediatamente como Administrador
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Abrirá la ventana de firma táctil tras guardar
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={adminSignsNow}
                  onChange={(e) => setAdminSignsNow(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0871A0] focus:ring-[#0871A0]"
                />
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  Guardar y Sincronizar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Document Viewer / Details Modal */}
      <DocumentViewerModal
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        currentUser={currentUser}
        onOpenSignatureModal={(doc) => {
          setSigningDoc(doc);
        }}
      />

      {/* Admin Signature Modal */}
      <DigitalSignatureModal
        isOpen={Boolean(signingDoc)}
        onClose={() => setSigningDoc(null)}
        documentTitle={signingDoc?.title || ''}
        documentCode={signingDoc?.code || ''}
        signerName={currentUser.name}
        signerRole="admin"
        signerTitle={currentUser.position || 'Directora de Recursos Humanos'}
        onConfirmSignature={handleAdminSignatureSaved}
      />

    </div>
  );
};
