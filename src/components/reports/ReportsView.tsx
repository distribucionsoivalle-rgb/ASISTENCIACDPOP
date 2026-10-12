import React, { useState, useMemo } from 'react';
import {
  Activity,
  DPOCommitment,
  DistributionCenter,
  SystemSettings,
  User,
} from '../../types';
import { exportActivitiesToExcel } from '../../utils/exportUtils';
import { calculateAttendanceMetrics, formatDateColombia, getTodayDateString } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ReportsViewProps {
  activities: Activity[];
  commitments: DPOCommitment[];
  centers: DistributionCenter[];
  settings: SystemSettings;
  currentUser: User;
  onPrintActivity: (activity: Activity) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activities,
  commitments,
  centers,
  settings,
  currentUser,
  onPrintActivity,
}) => {
  const today = getTodayDateString();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [centerId, setCenterId] = useState<string>('todos');
  const [activityType, setActivityType] = useState<string>('todos');
  const [cargoFilter, setCargoFilter] = useState<string>('todos');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Filtrado de actividades
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (startDate && act.date < startDate) return false;
      if (endDate && act.date > endDate) return false;
      if (centerId !== 'todos' && act.centerId !== centerId) return false;
      if (activityType !== 'todos' && act.activityType !== activityType) return false;
      if (cargoFilter !== 'todos') {
        const hasCargo = act.attendees.some((a) => a.cargo === cargoFilter);
        if (!hasCargo) return false;
      }
      return true;
    });
  }, [activities, startDate, endDate, centerId, activityType, cargoFilter]);

  // Filtrado de compromisos correspondientes al centro
  const filteredCommitments = useMemo(() => {
    return commitments.filter((c) => {
      if (centerId !== 'todos' && c.centerId !== centerId) return false;
      return true;
    });
  }, [commitments, centerId]);

  const metrics = useMemo(() => {
    return calculateAttendanceMetrics(filteredActivities, settings);
  }, [filteredActivities, settings]);

  const handleExportExcel = () => {
    const centerName = centers.find((c) => c.id === centerId)?.code || 'Nacional';
    const prefix = `Reporte_DPO_Bavaria_${centerName}`;
    exportActivitiesToExcel(filteredActivities, filteredCommitments, centers, settings, prefix);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const handleSetQuickPeriod = (period: 'today' | 'month' | 'year' | 'all') => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curDay = String(now.getDate()).padStart(2, '0');

    if (period === 'today') {
      const todayStr = `${curYear}-${curMonth}-${curDay}`;
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (period === 'month') {
      setStartDate(`${curYear}-${curMonth}-01`);
      setEndDate(`${curYear}-${curMonth}-${curDay}`);
    } else if (period === 'year') {
      setStartDate(`${curYear}-01-01`);
      setEndDate(`${curYear}-12-31`);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
              EXPORTACIÓN & AUDITORÍA DPO
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria Logística</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2D4A]">
            Generación de Reportes Oficiales
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Descarga de matrices consolidadas en formato Excel (.xlsx) y actas imprimibles para auditorías.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-extrabold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Libro Excel (.xlsx)
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Archivo Excel (.xlsx) generado y descargado exitosamente con todas las hojas de cálculo.
        </div>
      )}

      {/* Parámetros de Selección y Periodos Rápidos */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B2D4A] uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5 text-[#CDA323]" />
            Parámetros del Reporte
          </div>

          {/* Atajos de período rápido */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Rango rápido:</span>
            <button
              onClick={() => handleSetQuickPeriod('today')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 text-[11px]"
            >
              Hoy
            </button>
            <button
              onClick={() => handleSetQuickPeriod('month')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 text-[11px]"
            >
              Mes Actual
            </button>
            <button
              onClick={() => handleSetQuickPeriod('year')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 text-[11px]"
            >
              Año Completo
            </button>
            <button
              onClick={() => handleSetQuickPeriod('all')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 text-[11px]"
            >
              Histórico Total
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fecha Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Centro de Distribución
            </label>
            <select
              value={centerId}
              onChange={(e) => setCenterId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="todos">Todos los Centros (Nacional)</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tipo de Actividad
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="todos">Todas las Actividades</option>
              <option value="Matinal">Matinal</option>
              <option value="Capacitación">Capacitación</option>
              <option value="Reunión DPO">Reunión DPO</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Refuerzo operativo">Refuerzo operativo</option>
              <option value="Otra">Otra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen Ejecutivo del Reporte */}
      <div className="bg-[#0B2D4A] text-white p-5 rounded-xl shadow-md">
        <div className="text-xs font-bold text-[#CDA323] uppercase tracking-wider mb-2">
          Resumen Ejecutivo del Período Seleccionado
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          <div>
            <span className="text-slate-300 text-[11px] block">Actividades</span>
            <span className="text-2xl font-extrabold text-white tabular-nums">{metrics.totalActivities}</span>
          </div>

          <div>
            <span className="text-slate-300 text-[11px] block">Capacitaciones</span>
            <span className="text-2xl font-extrabold text-white tabular-nums">{metrics.totalCapacitaciones}</span>
          </div>

          <div>
            <span className="text-slate-300 text-[11px] block">Convocados</span>
            <span className="text-2xl font-extrabold text-white tabular-nums">{metrics.totalConvocados}</span>
          </div>

          <div>
            <span className="text-slate-300 text-[11px] block">Asistieron</span>
            <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">{metrics.totalAsistieron}</span>
          </div>

          <div>
            <span className="text-slate-300 text-[11px] block">Ausentes</span>
            <span className="text-2xl font-extrabold text-rose-400 tabular-nums">{metrics.totalAusentes}</span>
          </div>

          <div>
            <span className="text-slate-300 text-[11px] block">% Asistencia DPO</span>
            <span className="text-2xl font-black text-[#CDA323] tabular-nums">{metrics.attendanceRate}%</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#173F60] text-[11px] text-slate-300">
          {metrics.calculationMethodology}
        </div>
      </div>

      {/* Estructura del Archivo Excel a Exportar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#0B2D4A]">
          Contenido Incluido en la Exportación Excel (.xlsx)
        </h3>
        <p className="text-xs text-slate-600">
          El archivo generado contiene 3 hojas estructuradas listas para presentación ante comités y auditorías DPO:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-[#0B2D4A] mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Hoja 1: Resumen de Actividades
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Fechas, horarios programados vs reales, temas tratados, facilitadores, totales de asistentes, ausencias y % de cumplimiento.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-[#0B2D4A] mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Hoja 2: Detalle de Asistentes
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Registro nominal: cédula, nombre, cargo, estado de asistencia, hora de llegada y observaciones individuales de cada colaborador.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-[#0B2D4A] mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Hoja 3: Compromisos DPO
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Planes de acción, desviaciones de matinales, responsables, fechas límite, estado y comentarios de cierre para seguimiento.
            </p>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-[#0B2D4A] hover:bg-[#173F60] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#CDA323]" />
            Generar y Descargar Archivo Excel (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
};
