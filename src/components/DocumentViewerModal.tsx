import React from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Download, 
  Lock, 
  PenTool, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock,
  Printer
} from 'lucide-react';
import { CompanyDocument, UserProfile } from '../types';
import { downloadCertifiedDocument } from '../utils/documentUtils';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CompanyDocument | null;
  currentUser: UserProfile;
  onOpenSignatureModal: (doc: CompanyDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentUser,
  onOpenSignatureModal,
}) => {
  if (!isOpen || !doc) return null;

  const isAdmin = currentUser.role === 'admin';
  const isEmployee = currentUser.role === 'employee';

  // Rule: employee can ONLY download if they have signed it themselves!
  const canEmployeeDownload = doc.isEmployeeSigned;
  const canDownload = isAdmin || canEmployeeDownload;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#069AD8]/10 text-[#069AD8]">
                {doc.categoryLabel}
              </span>
              <span className="font-mono text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                {doc.code}
              </span>
              {doc.isEmployeeSigned && doc.isAdminSigned ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Firmado por Ambas Partes
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pendiente de Firma
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[#093244] leading-snug">
              {doc.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {doc.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Metadata, Clauses, and Signature Blocks */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs sm:text-sm">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-400 block font-medium">Asignado a:</span>
              <strong className="text-neutral-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#069AD8]" />
                {doc.targetEmployeeName || 'Todos los colaboradores'}
              </strong>
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Fecha de Emisión:</span>
              <strong className="text-neutral-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {doc.uploadedAt}
              </strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-neutral-400 block font-medium">Emitido por:</span>
              <strong className="text-neutral-800 flex items-center gap-1 mt-0.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                {doc.uploadedBy}
              </strong>
            </div>
          </div>

          {/* Download notice for employee if not signed */}
          {isEmployee && !doc.isEmployeeSigned && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-amber-900 block text-xs sm:text-sm">
                  Descarga Protegida hasta Completar Firma
                </span>
                <p className="text-xs text-amber-800 mt-0.5">
                  Por disposición legal y de seguridad laboral, debes estampar tu firma digital desde tu dispositivo antes de poder descargar la copia oficial.
                </p>
              </div>
            </div>
          )}

          {/* Contract Content / Clauses */}
          <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-[#093244] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#069AD8]" />
                Cláusulas y Términos Legales
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {doc.contentClauses.length} Cláusulas Vinculantes
              </span>
            </div>

            <div className="space-y-3 text-neutral-700 leading-relaxed text-xs sm:text-[13px]">
              {doc.contentClauses.map((clause, idx) => {
                const parts = clause.split(':');
                const title = parts[0];
                const rest = parts.slice(1).join(':');
                return (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-100">
                    <strong className="text-[#093244] block mb-0.5">{title}:</strong>
                    <span>{rest}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signatures Stamping Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#093244] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Firmas Digitales Institucionales
              </span>
              <span className="text-[11px] text-neutral-500">
                Sello Electrónico con Validez Oficial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Box 1: Admin / Patrón Signature */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#069AD8] uppercase">
                      1. Firma Patronal (RRHH)
                    </span>
                    {doc.isAdminSigned ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Firmado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {doc.isAdminSigned && doc.adminSignature ? (
                    <div className="space-y-2">
                      <div className="h-16 flex items-center justify-center bg-white rounded-xl border border-neutral-200 p-2">
                        <img 
                          src={doc.adminSignature.signatureImage} 
                          alt="Firma Admin" 
                          className="max-h-14 max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs">
                        <strong className="text-neutral-900 block">{doc.adminSignature.signerName}</strong>
                        <span className="text-[11px] text-neutral-500 block">{doc.adminSignature.signerTitle}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">Fecha: {doc.adminSignature.signedAt}</span>
                        <span className="text-[10px] font-mono text-emerald-600 block mt-0.5">
                          ✓ {doc.adminSignature.securityHash}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-neutral-400">
                        Aún no ha sido firmado por la Dirección de Recursos Humanos
                      </p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onOpenSignatureModal(doc)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#093244] text-white text-xs font-bold hover:bg-[#082735] transition cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Firmar como Administrador</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Employee Signature */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#1F832D] uppercase">
                      2. Firma del Colaborador
                    </span>
                    {doc.isEmployeeSigned ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Firmado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {doc.isEmployeeSigned && doc.employeeSignature ? (
                    <div className="space-y-2">
                      <div className="h-16 flex items-center justify-center bg-white rounded-xl border border-neutral-200 p-2">
                        <img 
                          src={doc.employeeSignature.signatureImage} 
                          alt="Firma Empleado" 
                          className="max-h-14 max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs">
                        <strong className="text-neutral-900 block">{doc.employeeSignature.signerName}</strong>
                        <span className="text-[11px] text-neutral-500 block">{doc.employeeSignature.signerTitle}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">Fecha: {doc.employeeSignature.signedAt}</span>
                        <span className="text-[10px] font-mono text-emerald-600 block mt-0.5">
                          ✓ {doc.employeeSignature.securityHash}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-neutral-400">
                        Pendiente de firma del colaborador en su dispositivo
                      </p>
                      {isEmployee && (
                        <button
                          type="button"
                          onClick={() => onOpenSignatureModal(doc)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#069AD8] text-white text-xs font-bold hover:bg-[#065b82] transition shadow-xs cursor-pointer animate-pulse"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Firmar desde este Dispositivo</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Certificado digital con sello de tiempo e IP trazable</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cerrar
            </button>

            {/* If employee is viewing and hasn't signed, show prominent "Firmar" button */}
            {isEmployee && !doc.isEmployeeSigned && (
              <button
                type="button"
                onClick={() => onOpenSignatureModal(doc)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#093244] hover:bg-[#082735] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Firmar Digitalmente Ahora</span>
              </button>
            )}

            {/* If Admin is viewing and hasn't signed, show prominent Admin sign button */}
            {isAdmin && !doc.isAdminSigned && (
              <button
                type="button"
                onClick={() => onOpenSignatureModal(doc)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#093244] hover:bg-[#082735] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Firmar como Administrador</span>
              </button>
            )}

            {/* Download Button with strict permission check */}
            {canDownload ? (
              <button
                type="button"
                onClick={() => downloadCertifiedDocument(doc)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                title="Descargar copia oficial certificada en PDF"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Copia Certificada</span>
              </button>
            ) : (
              <div 
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-200 text-neutral-500 text-xs sm:text-sm font-bold cursor-not-allowed opacity-80"
                title="Debes firmar este documento primero antes de poder descargarlo"
              >
                <Lock className="w-4 h-4" />
                <span>Descarga Bloqueada (Firma requerida)</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
