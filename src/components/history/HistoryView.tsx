import React, { useState, useMemo } from 'react';
import { Activity, DistributionCenter, User } from '../../types';
import { formatDateColombia } from '../../utils/formatters';
import { ActivityDetailModal } from './ActivityDetailModal';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Printer,
  RotateCcw,
  Plus,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HistoryViewProps {
  activities: Activity[];
  centers: DistributionCenter[];
  currentUser: User;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onNavigateToNew: () => void;
  onPrintActivity: (activity: Activity) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  activities,
  centers,
  currentUser,
  onEditActivity,
  onDeleteActivity,
  onNavigateToNew,
  onPrintActivity,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [centerFilter, setCenterFilter] = useState<string>('todos');
  const [cargoFilter, setCargoFilter] = useState<string>('todos');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'registrador';
  const canDelete = currentUser.role === 'admin';

  // Filtrado exhaustivo de matinales
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (startDate && act.date < startDate) return false;
      if (endDate && act.date > endDate) return false;
      if (centerFilter !== 'todos' && act.centerId !== centerFilter) return false;

      // Filtrar por cargo en los asistentes
      if (cargoFilter !== 'todos') {
        const hasCargo = act.attendees.some((a) => a.cargo === cargoFilter);
        if (!hasCargo) return false;
      }

      // Búsqueda por texto (nombre de asistente, tema, facilitador, cédula)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = act.topic.toLowerCase().includes(q);
        const matchesFacilitator = act.facilitator.toLowerCase().includes(q);
        const matchesGeneral = (act.generalNotes || '').toLowerCase().includes(q);
        const matchesAttendee = act.attendees.some(
          (att) =>
            att.name.toLowerCase().includes(q) ||
            att.employeeCode.includes(q)
        );

        if (!matchesTopic && !matchesFacilitator && !matchesGeneral && !matchesAttendee) {
          return false;
        }
      }

      return true;
    });
  }, [activities, searchQuery, centerFilter, cargoFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearchQuery('');
    setCenterFilter('todos');
    setCargoFilter('todos');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchQuery ||
    centerFilter !== 'todos' ||
    cargoFilter !== 'todos' ||
    startDate ||
    endDate;

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de actividad? Esta acción es irreversible para auditoría DPO.')) {
      onDeleteActivity(id);
      if (selectedActivity?.id === id) {
        setSelectedActivity(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
              CONSULTA OPERATIVA
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria Distribución</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2D4A]">
            Historial de Matinales
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Registro auditable de asistencias, horarios reales y participantes convocados a la matinal.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onNavigateToNew}
            className="px-4 py-2 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Matinal
          </button>
        )}
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B2D4A] uppercase tracking-wide">
            <Search className="w-3.5 h-3.5 text-[#CDA323]" />
            Búsqueda Multicriterio
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Buscador de texto completo */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de participante, cédula, tema tratado o facilitador..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0B2D4A] bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filtros en cuadrícula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Centro (CD)
            </label>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            >
              <option value="todos">Todos los Centros</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cargo de Asistente
            </label>
            <select
              value={cargoFilter}
              onChange={(e) => setCargoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
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

      {/* Tabla Principal de Historial */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-[#0B2D4A] uppercase tracking-wide">
            Registros Encontrados: <span className="tabular-nums font-black text-[#CDA323]">{filteredActivities.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-3">Horario</th>
                <th className="py-3 px-3">Centro (CD)</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-4">Tema Tratado</th>
                <th className="py-3 px-3">Facilitador</th>
                <th className="py-3 px-3 text-center">Asistentes</th>
                <th className="py-3 px-3 text-center">% Cumpl.</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.map((act) => {
                const total = act.attendees.length;
                const asistieron = act.attendees.filter((a) => a.status === 'Asistió').length;
                const pct = total > 0 ? Math.round((asistieron / total) * 100) : 0;
                const centerName = centers.find((c) => c.id === act.centerId)?.name || act.centerId;

                return (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      {formatDateColombia(act.date)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap tabular-nums">
                      {act.scheduledStartTime} → {act.actualStartTime}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {centerName}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-[#0B2D4A]">
                        {act.activityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium max-w-xs truncate" title={act.topic}>
                      {act.topic}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {act.facilitator}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-800 tabular-nums">
                      {asistieron}/{total}
                    </td>
                    <td className="py-3.5 px-3 text-center tabular-nums">
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedActivity(act)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#0B2D4A] hover:bg-slate-100 transition-colors"
                          title="Ver detalle completo de asistentes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintActivity(act)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Imprimir formato DPO"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEditActivity(act)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#CDA323] hover:bg-slate-100 transition-colors"
                            title="Editar actividad"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteConfirm(act.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredActivities.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500">
            No se encontraron actividades con los filtros actuales. Prueba cambiando los términos de búsqueda o las fechas.
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          centers={centers}
          currentUser={currentUser}
          onClose={() => setSelectedActivity(null)}
          onEdit={(act) => {
            setSelectedActivity(null);
            onEditActivity(act);
          }}
          onDelete={(id) => {
            handleDeleteConfirm(id);
          }}
          onPrint={(act) => {
            onPrintActivity(act);
          }}
        />
      )}
    </div>
  );
};
