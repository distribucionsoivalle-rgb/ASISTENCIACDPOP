import React from 'react';
import { Activity, DistributionCenter, User } from '../../types';
import { formatDateColombia } from '../../utils/formatters';
import { exportSingleActivityToExcel } from '../../utils/exportUtils';
import {
  X,
  Calendar,
  Clock,
  Building,
  User as UserIcon,
  Users,
  Printer,
  FileSpreadsheet,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: Activity;
  centers: DistributionCenter[];
  currentUser: User;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onPrint: (activity: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  centers,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onPrint,
}) => {
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'registrador';
  const canDelete = currentUser.role === 'admin';
  const centerName = centers.find((c) => c.id === activity.centerId)?.name || activity.centerId;

  const total = activity.attendees.length;
  const countAsistio = activity.attendees.filter((a) => a.status === 'Asistió').length;
  const countAusente = activity.attendees.filter((a) => a.status === 'Ausente').length;
  const countJustificado = activity.attendees.filter((a) => a.status === 'Justificado').length;
  const attendanceRate = total > 0 ? Math.round((countAsistio / total) * 100) : 0;

  const handleExcelExport = () => {
    exportSingleActivityToExcel(activity, centerName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Encabezado Modal con Estilo Bavaria */}
        <div className="bg-[#0B2D4A] text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#CDA323] uppercase tracking-wider bg-[#173F60] px-2 py-0.5 rounded">
                {activity.activityType}
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-300">{centerName}</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {activity.topic}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Facilitador: <strong className="text-white">{activity.facilitator}</strong> · Fecha: {formatDateColombia(activity.date)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#173F60] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Acciones y Auditoría */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Registrado por: <strong className="text-slate-800">{activity.createdBy}</strong>
            {activity.updatedBy && (
              <span className="ml-2">
                · Modificado por: <strong className="text-slate-800">{activity.updatedBy}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={() => onPrint(activity)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              Imprimir PDF
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(activity)}
                className="px-3 py-1.5 rounded-lg bg-[#CDA323] hover:bg-[#b8911d] font-bold text-[#0B2D4A] flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(activity.id)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 font-semibold text-rose-700 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-5 space-y-5 max-h-[calc(80vh-140px)] overflow-y-auto">
          {/* Métricas de Asistencia de la Actividad */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Convocados</span>
              <strong className="text-lg text-slate-900 tabular-nums">{total}</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block">Asistieron</span>
              <strong className="text-lg text-emerald-800 tabular-nums">{countAsistio}</strong>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-rose-700 block">Ausentes</span>
              <strong className="text-lg text-rose-800 tabular-nums">{countAusente}</strong>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-700 block">% Asistencia</span>
              <strong className="text-lg text-amber-900 tabular-nums">{attendanceRate}%</strong>
            </div>
          </div>

          {/* Horarios y Observaciones */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Hora Programada:</span>{' '}
                <strong className="text-slate-800 tabular-nums">{activity.scheduledStartTime}</strong>
              </div>
              <div>
                <span className="text-slate-500">Hora Real de Inicio:</span>{' '}
                <strong className="text-slate-800 tabular-nums">{activity.actualStartTime}</strong>
              </div>
            </div>
            {activity.generalNotes && (
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block font-semibold mb-0.5">Observaciones y acuerdos:</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activity.generalNotes}
                </p>
              </div>
            )}
          </div>

          {/* Tabla de Asistentes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#0B2D4A] uppercase tracking-wide">
                Lista Detallada de Asistentes ({activity.attendees.length})
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Identificación</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Cargo</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3">Hora Llegada</th>
                    <th className="py-2.5 px-3">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activity.attendees.map((att, idx) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{att.employeeCode}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{att.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{att.cargo}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            att.status === 'Asistió'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'Ausente'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {att.status === 'Asistió' && <CheckCircle2 className="w-3 h-3" />}
                          {att.status === 'Ausente' && <XCircle className="w-3 h-3" />}
                          {att.status === 'Justificado' && <AlertCircle className="w-3 h-3" />}
                          {att.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {att.arrivalTime || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic">
                        {att.observations || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
