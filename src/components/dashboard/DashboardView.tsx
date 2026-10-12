import React, { useMemo, useState } from 'react';
import {
  Activity,
  DistributionCenter,
  SystemSettings,
  Cargo,
  ActivityType,
} from '../../types';
import { calculateAttendanceMetrics, formatDateColombia } from '../../utils/formatters';
import {
  Calendar,
  Users,
  UserCheck,
  UserX,
  Percent,
  GraduationCap,
  Filter,
  RotateCcw,
  Clock,
  Building,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertTriangle,
  IdCard,
} from 'lucide-react';

interface DashboardViewProps {
  activities: Activity[];
  centers: DistributionCenter[];
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onNavigateToNewActivity: () => void;
  onViewActivityDetail: (activity: Activity) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activities,
  centers,
  settings,
  onUpdateSettings,
  onNavigateToNewActivity,
  onViewActivityDetail,
}) => {
  // Filtros locales del Dashboard (100% enfocado en Matinales)
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterCenterId, setFilterCenterId] = useState<string>('todos');
  const [filterCargo, setFilterCargo] = useState<string>('todos');

  // Filtrado de matinales
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filterStartDate && act.date < filterStartDate) return false;
      if (filterEndDate && act.date > filterEndDate) return false;
      if (filterCenterId !== 'todos' && act.centerId !== filterCenterId) return false;
      if (filterCargo !== 'todos') {
        const hasCargo = act.attendees.some((att) => att.cargo === filterCargo);
        if (!hasCargo) return false;
      }
      return true;
    });
  }, [activities, filterStartDate, filterEndDate, filterCenterId, filterCargo]);

  // Si se filtra por cargo, filtramos también los asistentes individuales para el cálculo
  const effectiveActivitiesForMetrics = useMemo(() => {
    if (filterCargo === 'todos') return filteredActivities;
    return filteredActivities.map((act) => ({
      ...act,
      attendees: act.attendees.filter((att) => att.cargo === filterCargo),
    }));
  }, [filteredActivities, filterCargo]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    return calculateAttendanceMetrics(effectiveActivitiesForMetrics, settings);
  }, [effectiveActivitiesForMetrics, settings]);

  const resetFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterCenterId('todos');
    setFilterCargo('todos');
  };

  const hasActiveFilters =
    filterStartDate ||
    filterEndDate ||
    filterCenterId !== 'todos' ||
    filterCargo !== 'todos';

  // Métricas por Cargo
  const cargoStats = useMemo(() => {
    const roles: Record<Cargo, { convocados: number; asistieron: number; ausentes: number; justificados: number }> = {
      'Conductor': { convocados: 0, asistieron: 0, ausentes: 0, justificados: 0 },
      'Responsable de Ruta (RR)': { convocados: 0, asistieron: 0, ausentes: 0, justificados: 0 },
      'Auxiliar de reparto': { convocados: 0, asistieron: 0, ausentes: 0, justificados: 0 },
      'Administrativo': { convocados: 0, asistieron: 0, ausentes: 0, justificados: 0 },
      'Otro': { convocados: 0, asistieron: 0, ausentes: 0, justificados: 0 },
    };

    filteredActivities.forEach((act) => {
      act.attendees.forEach((att) => {
        const c = roles[att.cargo] || roles['Otro'];
        c.convocados++;
        if (att.status === 'Asistió') c.asistieron++;
        else if (att.status === 'Ausente') c.ausentes++;
        else if (att.status === 'Justificado') c.justificados++;
      });
    });

    return Object.entries(roles).map(([cargo, data]) => {
      const denom = settings.excludeJustifiedFromPercentage
        ? Math.max(0, data.convocados - data.justificados)
        : data.convocados;
      const pct = denom > 0 ? Math.round((data.asistieron / denom) * 1000) / 10 : 0;
      return { cargo, ...data, percentage: pct };
    });
  }, [filteredActivities, settings]);

  // Métricas por Centro de Distribución
  const centerStats = useMemo(() => {
    const map = new Map<string, { convocados: number; asistieron: number; justificados: number; count: number }>();
    centers.forEach((c) => {
      map.set(c.id, { convocados: 0, asistieron: 0, justificados: 0, count: 0 });
    });

    filteredActivities.forEach((act) => {
      const current = map.get(act.centerId) || { convocados: 0, asistieron: 0, justificados: 0, count: 0 };
      current.count++;
      act.attendees.forEach((att) => {
        current.convocados++;
        if (att.status === 'Asistió') current.asistieron++;
        else if (att.status === 'Justificado') current.justificados++;
      });
      map.set(act.centerId, current);
    });

    return centers.map((c) => {
      const d = map.get(c.id) || { convocados: 0, asistieron: 0, justificados: 0, count: 0 };
      const denom = settings.excludeJustifiedFromPercentage
        ? Math.max(0, d.convocados - d.justificados)
        : d.convocados;
      const pct = denom > 0 ? Math.round((d.asistieron / denom) * 1000) / 10 : 0;
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        activitiesCount: d.count,
        convocados: d.convocados,
        asistieron: d.asistieron,
        percentage: pct,
      };
    });
  }, [filteredActivities, centers, settings]);

  // Asistencia cronológica por fecha (últimas actividades)
  const timelineStats = useMemo(() => {
    const datesMap = new Map<string, { total: number; asistieron: number; count: number }>();
    // Ordenar actividades por fecha
    const sorted = [...filteredActivities].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((act) => {
      const cur = datesMap.get(act.date) || { total: 0, asistieron: 0, count: 0 };
      cur.count++;
      act.attendees.forEach((att) => {
        cur.total++;
        if (att.status === 'Asistió') cur.asistieron++;
      });
      datesMap.set(act.date, cur);
    });

    return Array.from(datesMap.entries()).map(([date, d]) => {
      const pct = d.total > 0 ? Math.round((d.asistieron / d.total) * 100) : 0;
      return {
        date,
        formattedDate: formatDateColombia(date),
        total: d.total,
        asistieron: d.asistieron,
        percentage: pct,
        activitiesCount: d.count,
      };
    });
  }, [filteredActivities]);

  // Puntualidad operativa: Comparación hora real vs programada
  const punctualityStats = useMemo(() => {
    let punctual = 0;
    let lateUnder10 = 0;
    let lateOver10 = 0;

    filteredActivities.forEach((act) => {
      if (!act.actualStartTime || !act.scheduledStartTime) {
        punctual++;
        return;
      }
      const [sh, sm] = act.scheduledStartTime.split(':').map(Number);
      const [ah, am] = act.actualStartTime.split(':').map(Number);
      const schedMinutes = sh * 60 + sm;
      const actMinutes = ah * 60 + am;
      const diff = actMinutes - schedMinutes;

      if (diff <= 0) {
        punctual++;
      } else if (diff <= 10) {
        lateUnder10++;
      } else {
        lateOver10++;
      }
    });

    const total = filteredActivities.length;
    return {
      total,
      punctual,
      punctualRate: total > 0 ? Math.round((punctual / total) * 100) : 100,
      lateUnder10,
      lateOver10,
    };
  }, [filteredActivities]);

  return (
    <div className="space-y-6">
      {/* Barra de Bienvenida y Acción Rápida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-widest uppercase">
              TABLERO DE CONTROL DPO
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria Distribución</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#0B2D4A] tracking-tight">
            Monitoreo Diario de Asistencia a Matinales – DPO
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Indicadores en tiempo real de asistencia a matinales operativas, puntualidad de arranque y salida a ruta.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNavigateToNewActivity}
            className="px-4 py-2 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Registrar Matinal
          </button>
        </div>
      </div>

      {/* Filtros Superiores */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B2D4A] uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5 text-[#CDA323]" />
            Filtros de Búsqueda de Matinales
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B2D4A] focus:outline-none"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B2D4A] focus:outline-none"
            />
          </div>

          {/* Centro de Distribución */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Centro de Distribución (CD)
            </label>
            <select
              value={filterCenterId}
              onChange={(e) => setFilterCenterId(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B2D4A] focus:outline-none"
            >
              <option value="todos">Todos los Centros</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cargo
            </label>
            <select
              value={filterCargo}
              onChange={(e) => setFilterCargo(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B2D4A] focus:outline-none"
            >
              <option value="todos">Todos los Cargos</option>
              <option value="Conductor">Conductor</option>
              <option value="Responsable de Ruta (RR)">Responsable de Ruta (RR)</option>
              <option value="Auxiliar de reparto">Auxiliar de reparto</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metodología de Cálculo y Banner Informativo */}
      <div className="bg-[#173F60]/10 border border-[#173F60]/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#0B2D4A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#0B2D4A]">Metodología de Asistencia: </span>
            <span className="text-slate-700">{metrics.calculationMethodology}</span>
            {settings.excludeJustifiedFromPercentage ? (
              <span className="ml-1.5 text-amber-700 font-semibold">(Ausencias justificadas excluidas de la base)</span>
            ) : (
              <span className="ml-1.5 text-slate-600">(Ausencias justificadas contabilizadas en la base de convocados)</span>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            onUpdateSettings({
              ...settings,
              excludeJustifiedFromPercentage: !settings.excludeJustifiedFromPercentage,
            })
          }
          className="text-xs px-2.5 py-1 rounded bg-white border border-slate-300 font-medium text-[#0B2D4A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
        >
          {settings.excludeJustifiedFromPercentage
            ? 'Cambiar a base total oficial'
            : 'Excluir justificadas del cálculo'}
        </button>
      </div>

      {/* Tarjetas Superiores de Indicadores (5 KPIs de Matinales) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Total Matinales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Matinales
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0B2D4A] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0B2D4A] tabular-nums">
              {metrics.totalActivities}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Realizadas en período</p>
          </div>
        </div>

        {/* 2. Total convocados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Convocados
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0B2D4A] tabular-nums">
              {metrics.totalConvocados}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Tripulaciones y nómina</p>
          </div>
        </div>

        {/* 3. Total asistentes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Asistentes
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
              {metrics.totalAsistieron}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Presentes en matinal</p>
          </div>
        </div>

        {/* 4. Total ausentes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Ausentes
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
              {metrics.totalAusentes}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {metrics.totalJustificados > 0 ? `+${metrics.totalJustificados} justif.` : 'Sin novedad'}
            </p>
          </div>
        </div>

        {/* 5. Porcentaje de asistencia */}
        <div className="bg-white p-4 rounded-xl border-2 border-[#CDA323] shadow-xs flex flex-col justify-between bg-gradient-to-b from-amber-50/40 to-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2D4A]">
              % Asistencia
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#CDA323]/20 text-[#0B2D4A] flex items-center justify-center font-bold">
              <Percent className="w-4 h-4 text-[#CDA323]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0B2D4A] tabular-nums">
              {metrics.attendanceRate}%
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Meta DPO: ≥ 95%
            </p>
          </div>
        </div>
      </div>

      {/* Sección Gráfica: Asistencia por Cargo + Cumplimiento por CD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gráfico 1: Asistencia por Cargo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2D4A]">
                Cumplimiento de Asistencia por Cargo
              </h3>
              <p className="text-xs text-slate-500">
                Conductores, Responsables de Ruta (RR) y Auxiliares de Reparto
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 px-2 py-1 bg-slate-100 rounded">
              Objetivo: 95%
            </div>
          </div>

          <div className="space-y-4">
            {cargoStats.map((item) => {
              const isGoalMet = item.percentage >= 95;
              return (
                <div key={item.cargo} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.cargo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 tabular-nums">
                        {item.asistieron}/{item.convocados} presentes
                      </span>
                      <span
                        className={`font-bold tabular-nums px-1.5 py-0.5 rounded text-[11px] ${
                          isGoalMet
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isGoalMet ? 'bg-[#0B2D4A]' : 'bg-[#CDA323]'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 2: Cumplimiento por Centro de Distribución (CD) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2D4A]">
                Cumplimiento de Asistencia por Centro de Distribución
              </h3>
              <p className="text-xs text-slate-500">
                Desempeño operativo regional de la red logística Bavaria
              </p>
            </div>
            <Building className="w-4 h-4 text-[#CDA323]" />
          </div>

          <div className="space-y-3.5">
            {centerStats.map((center) => (
              <div
                key={center.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B2D4A] truncate">
                      {center.name}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {center.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {center.activitiesCount} actividades · {center.asistieron} de {center.convocados} asistentes
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-[#0B2D4A] tabular-nums">
                    {center.percentage}%
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      center.percentage >= 95
                        ? 'text-emerald-600'
                        : center.percentage >= 80
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {center.percentage >= 95
                      ? 'Cumple DPO'
                      : center.percentage >= 80
                      ? 'Alerta'
                      : 'Crítico'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico 3: Histórico de Asistencia por Día + Puntualidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Historial diario interactivo */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2D4A]">
                Evolución Diaria de Asistencia (%)
              </h3>
              <p className="text-xs text-slate-500">
                Comportamiento diario de asistencia en matinales operativas
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0B2D4A]" /> % Asistencia
            </div>
          </div>

          {timelineStats.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No hay actividades registradas en el rango de fechas seleccionado.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-200">
                {timelineStats.map((item, idx) => {
                  const heightPercent = Math.max(12, item.percentage);
                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center gap-1.5 group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B2D4A] text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                        {item.formattedDate}: {item.percentage}% ({item.asistieron}/{item.total})
                      </div>

                      <div className="text-[10px] font-bold text-slate-600 tabular-nums">
                        {item.percentage}%
                      </div>

                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t h-28 flex items-end overflow-hidden">
                        <div
                          className={`w-full transition-all duration-300 rounded-t ${
                            item.percentage >= 95
                              ? 'bg-[#0B2D4A] group-hover:bg-[#173F60]'
                              : 'bg-[#CDA323] group-hover:bg-[#b8911d]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 truncate max-w-[50px] text-center font-medium">
                        {item.formattedDate.slice(0, 5)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Indicador de Puntualidad y Disciplina de Inicio DPO */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B2D4A]">
                Disciplina Operativa de Inicio
              </h3>
              <Clock className="w-4 h-4 text-[#CDA323]" />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Comparativa entre hora programada y hora real de inicio de matinales (auditoría de arranque puntual DPO).
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    A Tiempo / Anticipada
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Inicio puntual según horario
                  </div>
                </div>
                <div className="text-lg font-extrabold text-emerald-800 tabular-nums">
                  {punctualityStats.punctual}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Retraso Menor (1-10 min)
                  </div>
                  <div className="text-[11px] text-amber-700">
                    En tolerancia operativa
                  </div>
                </div>
                <div className="text-lg font-extrabold text-amber-800 tabular-nums">
                  {punctualityStats.lateUnder10}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-900">
                    Desviación Crítica (&gt;10 min)
                  </div>
                  <div className="text-[11px] text-rose-700">
                    Requiere compromiso DPO
                  </div>
                </div>
                <div className="text-lg font-extrabold text-rose-800 tabular-nums">
                  {punctualityStats.lateOver10}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
            Puntualidad Global: <strong className="text-[#0B2D4A] tabular-nums">{punctualityStats.punctualRate}%</strong> de las matinales iniciaron a tiempo.
          </div>
        </div>
      </div>

      {/* Resumen de Actividades Recientes en el Período */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B2D4A]">
            Últimas Actividades Registradas
          </h3>
          <span className="text-xs text-slate-500 tabular-nums">
            Mostrando {filteredActivities.slice(0, 5).length} de {filteredActivities.length} actividades
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-3">Horario</th>
                <th className="py-2.5 px-3">CD</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-4">Tema Tratado</th>
                <th className="py-2.5 px-3">Facilitador</th>
                <th className="py-2.5 px-3 text-center">Asistentes</th>
                <th className="py-2.5 px-3 text-center">% Asistencia</th>
                <th className="py-2.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.slice(0, 5).map((act) => {
                const total = act.attendees.length;
                const asistieron = act.attendees.filter((a) => a.status === 'Asistió').length;
                const justificados = act.attendees.filter((a) => a.status === 'Justificado').length;
                const denom = settings.excludeJustifiedFromPercentage
                  ? Math.max(0, total - justificados)
                  : total;
                const pct = denom > 0 ? Math.round((asistieron / denom) * 100) : 0;
                const centerName = centers.find((c) => c.id === act.centerId)?.name || act.centerId;

                return (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                      {formatDateColombia(act.date)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap tabular-nums">
                      {act.scheduledStartTime} → {act.actualStartTime}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {centerName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                        {act.activityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate">
                      {act.topic}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {act.facilitator}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium tabular-nums">
                      {asistieron}/{total}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          pct >= 95
                            ? 'bg-emerald-50 text-emerald-700'
                            : pct >= 80
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewActivityDetail(act)}
                        className="text-xs font-semibold text-[#0B2D4A] hover:text-[#CDA323] transition-colors"
                      >
                        Ver detalle →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
