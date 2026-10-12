import React from 'react';
import { Activity, DistributionCenter, SystemSettings } from '../../types';
import { formatDateColombia } from '../../utils/formatters';
import { BavariaLogo } from './BavariaLogo';

interface PrintTemplateProps {
  activity: Activity | null;
  centers: DistributionCenter[];
  settings: SystemSettings;
  onClose: () => void;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({
  activity,
  centers,
  settings,
  onClose,
}) => {
  if (!activity) return null;

  const centerName = centers.find((c) => c.id === activity.centerId)?.name || activity.centerId;
  const total = activity.attendees.length;
  const countAsistio = activity.attendees.filter((a) => a.status === 'Asistió').length;
  const countAusente = activity.attendees.filter((a) => a.status === 'Ausente').length;
  const countJustificado = activity.attendees.filter((a) => a.status === 'Justificado').length;

  const denom = settings.excludeJustifiedFromPercentage
    ? Math.max(0, total - countJustificado)
    : total;
  const pct = denom > 0 ? Math.round((countAsistio / denom) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 sm:p-8 print-page">
      {/* Botones de acción en pantalla (se ocultan al imprimir) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-[#0B2D4A]">
            Vista Previa de Impresión / Exportación PDF
          </h3>
          <p className="text-xs text-slate-500">
            Formato oficial DPO para auditorías y archivo físico de centro de distribución.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 text-xs font-bold text-[#0B2D4A] bg-[#CDA323] hover:bg-[#b8911d] rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            Imprimir / Guardar como PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL IMPRIMIBLE */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 p-8 shadow-xs text-slate-900 font-sans print:border-none print:p-0">
        {/* Encabezado Oficial Bavaria */}
        <div className="border-b-2 border-[#0B2D4A] pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BavariaLogo className="h-10" allowEdit={false} variant="dark" />
          </div>

          <div className="text-right">
            <h1 className="text-base font-extrabold text-[#0B2D4A] uppercase tracking-wide">
              REGISTRO DE ASISTENCIA OPERATIVA DPO
            </h1>
            <p className="text-[11px] font-semibold text-slate-600">
              PROGRAMA DE EXCELENCIA EN DISTRIBUCIÓN (DPO)
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              CÓD: DPO-LOG-FR-024 · VERSIÓN 4.1
            </p>
          </div>
        </div>

        {/* Ficha Técnica de la Actividad */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fecha (DD/MM/AAAA)</span>
            <span className="font-bold text-slate-900 tabular-nums">{formatDateColombia(activity.date)}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Centro de Distribución</span>
            <span className="font-bold text-slate-900">{centerName}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Tipo de Actividad</span>
            <span className="font-bold text-slate-900">{activity.activityType}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Horario (Prog. / Real)</span>
            <span className="font-bold text-slate-900 tabular-nums">{activity.scheduledStartTime} → {activity.actualStartTime}</span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Facilitador / Responsable</span>
            <span className="font-bold text-slate-900">{activity.facilitator}</span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Tema Tratado</span>
            <span className="font-bold text-slate-900">{activity.topic}</span>
          </div>
        </div>

        {/* Observaciones generales */}
        {activity.generalNotes && (
          <div className="text-xs p-3 bg-slate-50/70 border border-slate-200 rounded-lg mb-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase mb-0.5">
              Observaciones y Compromisos Generales:
            </span>
            <p className="text-slate-800 leading-relaxed">{activity.generalNotes}</p>
          </div>
        )}

        {/* Tabla Oficial de Asistentes con Casilla de Firma */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#0B2D4A] text-white text-[11px] font-bold">
                <th className="py-2 px-2.5 border border-slate-300 w-8 text-center">N°</th>
                <th className="py-2 px-2.5 border border-slate-300 w-28">Cédula / ID</th>
                <th className="py-2 px-3 border border-slate-300">Nombre Completo del Colaborador</th>
                <th className="py-2 px-2.5 border border-slate-300 w-36">Cargo</th>
                <th className="py-2 px-2 border border-slate-300 w-20 text-center">Asistencia</th>
                <th className="py-2 px-2 border border-slate-300 w-16 text-center">Llegada</th>
                <th className="py-2 px-3 border border-slate-300 w-36 text-center">Firma Asistente</th>
              </tr>
            </thead>
            <tbody>
              {activity.attendees.map((att, idx) => (
                <tr key={att.id} className="border-b border-slate-200 text-[11px]">
                  <td className="py-2 px-2.5 border border-slate-300 text-center text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2.5 border border-slate-300 font-mono text-slate-800">
                    {att.employeeCode}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-medium text-slate-900">
                    {att.name}
                  </td>
                  <td className="py-2 px-2.5 border border-slate-300 text-slate-700">
                    {att.cargo}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center font-bold">
                    <span
                      className={
                        att.status === 'Asistió'
                          ? 'text-emerald-700'
                          : att.status === 'Ausente'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }
                    >
                      {att.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center font-mono">
                    {att.arrivalTime || '-'}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-center">
                    {/* Espacio para firma física */}
                    <div className="h-6 border-b border-slate-300 mx-2" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen Estadístico y Metodología */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 mb-8">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Convocados</span>
            <span className="font-extrabold text-slate-900 tabular-nums">{total}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Asistieron</span>
            <span className="font-extrabold text-emerald-800 tabular-nums">{countAsistio}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Ausentes</span>
            <span className="font-extrabold text-rose-800 tabular-nums">{countAusente} ({countJustificado} justif.)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">% Cumplimiento DPO</span>
            <span className="font-extrabold text-[#0B2D4A] tabular-nums">{pct}%</span>
          </div>
        </div>

        {/* Firmas de Autorización y Auditoría */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-300 text-xs text-center">
          <div>
            <div className="h-14 border-b border-slate-400 mb-2" />
            <p className="font-bold text-slate-900">{activity.facilitator}</p>
            <p className="text-[10px] text-slate-500">Facilitador / Responsable Matinal</p>
          </div>

          <div>
            <div className="h-14 border-b border-slate-400 mb-2" />
            <p className="font-bold text-slate-900">Jefe de Distribución</p>
            <p className="text-[10px] text-slate-500">Operaciones CD Bavaria</p>
          </div>

          <div>
            <div className="h-14 border-b border-slate-400 mb-2" />
            <p className="font-bold text-slate-900">Coordinador DPO / SST</p>
            <p className="text-[10px] text-slate-500">Auditoría y Disciplina Operativa</p>
          </div>
        </div>

        {/* Trazabilidad al pie */}
        <div className="pt-6 mt-6 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Registrado por: {activity.createdBy} · {new Date(activity.createdAt).toLocaleString('es-CO')}</span>
          <span>Bavaria & CIA S.C.A. · Documento Confidencial de Operaciones</span>
        </div>
      </div>
    </div>
  );
};
