import React, { useState } from 'react';
import { 
  CompanyDocument, 
  DigitalSignature, 
  EmployeeDocument, 
  UserProfile 
} from '../../types';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Download, 
  FileCheck2, 
  Lock, 
  PenTool, 
  Eye, 
  Smartphone, 
  Sparkles, 
  AlertCircle,
  X
} from 'lucide-react';
import { DigitalSignatureModal } from '../../components/DigitalSignatureModal';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { downloadCertifiedDocument } from '../../utils/documentUtils';

interface MyDocumentsViewProps {
  currentUser: UserProfile;
  companyDocuments: CompanyDocument[];
  onSignDocument: (docId: string, signature: DigitalSignature) => void;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({ 
  currentUser,
  companyDocuments,
  onSignDocument,
}) => {
  // Tabs: 'contracts' (Sincronizados con RRHH y Firma Digital) vs 'personal' (Expediente Personal INE/SAT/IMSS)
  const [activeTab, setActiveTab] = useState<'contracts' | 'personal'>('contracts');

  // Personal dossier documents (INE, SAT, etc.)
  const [personalDocs, setPersonalDocs] = useState<EmployeeDocument[]>([
    { id: 'pdoc-1', name: 'Identificación Oficial Vigente (INE / Pasaporte)', status: 'complete', lastUpdated: '2026-01-15', required: true },
    { id: 'pdoc-2', name: 'Comprobante de Domicilio Actualizado (< 3 meses)', status: 'pending', lastUpdated: '2026-08-10', required: true, notes: 'En validación por RRHH' },
    { id: 'pdoc-3', name: 'Constancia de Situación Fiscal SAT (RFC con Cédula)', status: 'complete', lastUpdated: '2026-01-15', required: true },
    { id: 'pdoc-4', name: 'Número de Seguridad Social IMSS / Carta Patronal', status: 'complete', lastUpdated: '2026-01-15', required: true },
  ]);

  // Modal States
  const [viewingDoc, setViewingDoc] = useState<CompanyDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<CompanyDocument | null>(null);
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Filter company documents targeted to this employee or to 'all'
  const myCompanyDocs = companyDocuments.filter(doc => 
    doc.targetEmployeeId === 'all' || 
    doc.targetEmployeeId === currentUser.id || 
    (currentUser.employeeId && doc.targetEmployeeId === currentUser.employeeId)
  );

  const signedContractsCount = myCompanyDocs.filter(d => d.isEmployeeSigned).length;
  const pendingContractsCount = myCompanyDocs.filter(d => !d.isEmployeeSigned).length;

  const handleEmployeeSignatureSaved = (signature: DigitalSignature) => {
    if (!signingDoc) return;

    onSignDocument(signingDoc.id, signature);

    // Update viewing modal if open
    if (viewingDoc && viewingDoc.id === signingDoc.id) {
      setViewingDoc({
        ...viewingDoc,
        isEmployeeSigned: true,
        employeeSignature: signature,
        status: viewingDoc.isAdminSigned ? 'signed_both' : 'pending_admin',
      });
    }

    setSigningDoc(null);
    setToastFeedback(`¡Documento "${signingDoc.title}" firmado con éxito desde tu dispositivo móvil! La descarga oficial ya se encuentra desbloqueada.`);
    setTimeout(() => setToastFeedback(null), 5000);
  };

  const handleSimulatedUploadPersonal = (docId: string) => {
    setPersonalDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'complete',
          lastUpdated: new Date().toISOString().split('T')[0],
          notes: 'Subido y verificado hoy',
        };
      }
      return d;
    }));
    setActiveUploadDocId(null);
    setToastFeedback('Documento personal cargado y enviado a validación de RRHH.');
    setTimeout(() => setToastFeedback(null), 3500);
  };

  return (
    <div id="employee-my-documents-view" className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0871A0] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0871A0]" />
              Expediente Laboral y Firma Digital
            </span>
            {pendingContractsCount > 0 ? (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" /> {pendingContractsCount} Pendiente(s) de Firma
              </span>
            ) : (
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Al Día con RRHH
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
            Mis Documentos y Contratos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 max-w-xl">
            Revisa los contratos y políticas emitidos por la empresa, estampa tu firma digital desde tu dispositivo y descarga copias certificadas.
          </p>
        </div>

        {/* Mobile & Signatures Counter */}
        <div className="bg-[#0A3142] text-white p-4 rounded-2xl border border-[#0A3142] flex items-center gap-4 shrink-0 shadow-xs">
          <div className="text-center">
            <span className="text-[10px] text-neutral-300 uppercase font-bold block">
              Firmados
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {signedContractsCount}/{myCompanyDocs.length}
            </span>
          </div>
          <div className="text-xs text-neutral-200 border-l border-white/20 pl-3 leading-tight">
            <span className="block font-semibold">Sincronizado con RRHH</span>
            <span className="text-[11px] text-neutral-300">Firma táctil móvil activa</span>
          </div>
        </div>
      </div>

      {/* 2-Column Mobile KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 block leading-tight">
            Contratos Empresa
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0A3142]">{myCompanyDocs.length}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">oficiales</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#138128] block leading-tight">
            Firmados 100%
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#138128]">{signedContractsCount}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">vigentes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 block leading-tight">
            Pendientes de Firma
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {myCompanyDocs.length - signedContractsCount}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">requeridos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0871A0] block leading-tight">
            Expediente Personal
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0871A0]">{personalDocs.length}</span>
            <span className="text-[11px] text-neutral-500 font-semibold">requisitos</span>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl text-xs sm:text-sm font-bold max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'contracts'
              ? 'bg-white text-[#0A3142] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#0871A0]" />
          <span>Contratos Oficiales ({myCompanyDocs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-white text-[#0A3142] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-[#138128]" />
          <span>Expediente Personal</span>
        </button>
      </div>

      {/* TAB 1: CONTRATOS OFICIALES Y FIRMA DIGITAL */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          
          {/* Important Security Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs sm:text-sm text-neutral-700 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#0871A0] text-white shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#0A3142] block">
                Firma Digital y Descarga Segura desde tu Dispositivo Móvil
              </strong>
              <p className="text-xs text-neutral-600 mt-0.5">
                Para garantizar la validez legal patronal, <strong>la descarga oficial en PDF está restringida hasta que firmes el documento con tu dedo o trazo</strong> desde este dispositivo.
              </p>
            </div>
          </div>

          {/* Documents Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {myCompanyDocs.map((doc) => {
              const isEmployeeSigned = doc.isEmployeeSigned;
              const isAdminSigned = doc.isAdminSigned;

              return (
                <div 
                  key={doc.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    isEmployeeSigned ? 'border-neutral-200' : 'border-amber-300 bg-amber-50/10'
                  }`}
                >
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0871A0]/10 text-[#0871A0]">
                        {doc.categoryLabel}
                      </span>
                      <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {doc.code}
                      </span>
                      {isEmployeeSigned ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Firmado por ti
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Requiere tu Firma Móvil
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#0A3142]">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {doc.description}
                    </p>

                    {/* Admin Signature Status Badge */}
                    <div className="flex items-center gap-4 flex-wrap pt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400">Firma Patronal (RRHH):</span>
                        {isAdminSigned && doc.adminSignature ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                            {doc.adminSignature.signerName} (Firmado)
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">En proceso de firma patronal</span>
                        )}
                      </div>

                      {isEmployeeSigned && doc.employeeSignature && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <span>• Firmado el {doc.employeeSignature.signedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    
                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => setViewingDoc(doc)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-neutral-500" />
                      <span>Ver Cláusulas y Firmas</span>
                    </button>

                    {/* Sign Button if not signed yet */}
                    {!isEmployeeSigned && (
                      <button
                        type="button"
                        onClick={() => setSigningDoc(doc)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0871A0] hover:bg-[#065b82] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer animate-pulse"
                      >
                        <PenTool className="w-4 h-4" />
                        <span>Firmar en este Móvil</span>
                      </button>
                    )}

                    {/* Download Button: STRICTLY LOCKED until signed by employee! */}
                    {isEmployeeSigned ? (
                      <button
                        type="button"
                        onClick={() => downloadCertifiedDocument(doc)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                        title="Descargar copia oficial certificada en PDF con ambas firmas"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Copia Firmada</span>
                      </button>
                    ) : (
                      <div 
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs font-semibold cursor-not-allowed select-none"
                        title="La descarga estará disponible automáticamente después de que firmes el documento"
                      >
                        <Lock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Descarga Bloqueada</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: EXPEDIENTE PERSONAL (INE, SAT, IMSS) */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h3 className="text-base font-bold text-[#0A3142] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#0871A0]" />
              Checklist de Documentos Personales de Identidad
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Copia de comprobantes entregados a Recursos Humanos para tu expediente laboral
            </p>
          </div>

          <div className="divide-y divide-neutral-100">
            {personalDocs.map((doc) => {
              const isComplete = doc.status === 'complete';
              const isPending = doc.status === 'pending';
              const isMissing = doc.status === 'missing';

              return (
                <div key={doc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 transition">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isComplete ? 'bg-[#138128]/10 text-[#138128]' :
                      isPending ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isComplete && <CheckCircle2 className="w-5 h-5" />}
                      {isPending && <Clock className="w-5 h-5" />}
                      {isMissing && <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#0A3142] text-sm sm:text-base">
                          {doc.name}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isComplete ? 'bg-[#138128]/10 text-[#138128]' :
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isComplete && '✓ Aprobado y Completo'}
                          {isPending && '⏳ En Revisión'}
                          {isMissing && '🔴 Faltante Requerido'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 mt-1">
                        {doc.lastUpdated && <span>Última actualización: {doc.lastUpdated}</span>}
                        {doc.notes && <span className="ml-2 text-rose-600 font-semibold">• {doc.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isComplete ? (
                      <button
                        onClick={() => {
                          setToastFeedback(`Descargando copia digital certificada de: ${doc.name}`);
                          setTimeout(() => setToastFeedback(null), 3500);
                        }}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Copia</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveUploadDocId(doc.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Subir Documento</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Personal Doc Modal */}
      {activeUploadDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-[#0A3142]">
                Adjuntar Documento Personal
              </h3>
              <button
                onClick={() => setActiveUploadDocId(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-[#0871A0]/40 rounded-2xl p-6 text-center bg-blue-50/30 space-y-3">
              <UploadCloud className="w-10 h-10 text-[#0871A0] mx-auto" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-neutral-800">
                  Arrastra tu archivo aquí o haz clic para explorar
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Formatos aceptados: PDF, JPG, PNG (Máximo 15 MB)
                </p>
              </div>

              <button
                onClick={() => handleSimulatedUploadPersonal(activeUploadDocId)}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#0A3142] hover:bg-[#082735] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Seleccionar y Subir Documento
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveUploadDocId(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        currentUser={currentUser}
        onOpenSignatureModal={(doc) => {
          setSigningDoc(doc);
        }}
      />

      {/* Employee Digital Signature Modal */}
      <DigitalSignatureModal
        isOpen={Boolean(signingDoc)}
        onClose={() => setSigningDoc(null)}
        documentTitle={signingDoc?.title || ''}
        documentCode={signingDoc?.code || ''}
        signerName={currentUser.name}
        signerRole="employee"
        signerTitle={currentUser.position || 'Colaborador'}
        onConfirmSignature={handleEmployeeSignatureSaved}
      />

    </div>
  );
};
