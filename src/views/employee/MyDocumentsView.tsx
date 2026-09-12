import React, { useState } from 'react';
import { EmployeeDocument, UserProfile } from '../../types';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  FileCheck2, 
  X 
} from 'lucide-react';

interface MyDocumentsViewProps {
  currentUser: UserProfile;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([
    { id: 'doc-1', name: 'Contrato Individual de Trabajo por Tiempo Indeterminado', status: 'complete', lastUpdated: '2026-01-15', required: true },
    { id: 'doc-2', name: 'Identificación Oficial Vigente (INE / Pasaporte)', status: 'complete', lastUpdated: '2026-01-15', required: true },
    { id: 'doc-3', name: 'Comprobante de Domicilio Actualizado (< 3 meses)', status: 'pending', lastUpdated: '2026-08-10', required: true, notes: 'En validación por RRHH' },
    { id: 'doc-4', name: 'Constancia de Situación Fiscal SAT (RFC con Cédula)', status: 'complete', lastUpdated: '2026-01-15', required: true },
    { id: 'doc-5', name: 'Número de Seguridad Social IMSS / Carta Patronal', status: 'missing', required: true, notes: 'Documento pendiente de entrega urgente' },
  ]);

  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const completedCount = documents.filter(d => d.status === 'complete').length;
  const progressPercent = Math.round((completedCount / documents.length) * 100);

  const handleSimulatedUpload = (docId: string) => {
    setDocuments(prev => prev.map(d => {
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
    setFeedback('Documento cargado correctamente en tu expediente digital.');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDownloadCopy = (docName: string) => {
    setFeedback(`Descargando copia digital certificada de: ${docName}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div id="employee-my-documents-view" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0871A0]">
            Expediente Laboral Digital
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A3142]">
            Mis Documentos y Contratos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Mantén tu documentación al día para asegurar el cumplimiento patronal y tus prestaciones
          </p>
        </div>

        {/* Progress Circular/Badge */}
        <div className="bg-[#0A3142] text-white px-5 py-3 rounded-2xl border border-[#0A3142] flex items-center gap-4 shadow-sm">
          <div>
            <span className="text-[10px] text-neutral-300 uppercase font-bold block">
              Cumplimiento
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {progressPercent}%
            </span>
          </div>
          <div className="text-xs text-neutral-200 font-medium border-l border-white/20 pl-4">
            {completedCount} de {documents.length} documentos<br />aprobados por RRHH
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-[#138128]/10 border border-[#138128]/30 text-[#138128] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#138128]" />
          {feedback}
        </div>
      )}

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-base font-bold text-[#0A3142] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#0871A0]" />
            Checklist de Expediente Individual
          </h3>
        </div>

        <div className="divide-y divide-neutral-100">
          {documents.map((doc) => {
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
                      onClick={() => handleDownloadCopy(doc.name)}
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

      {/* Upload Modal */}
      {activeUploadDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-base font-bold text-[#0A3142]">
                Adjuntar Documento al Expediente
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
                onClick={() => handleSimulatedUpload(activeUploadDocId)}
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
    </div>
  );
};
