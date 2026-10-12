import React, { useState } from 'react';
import {
  Activity,
  DistributionCenter,
  EmployeeRoster,
  User,
  AttendanceStatus,
} from '../../types';
import {
  getTodayDateString,
  getCurrentTimeString,
  formatDateColombia,
} from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Search,
  Filter,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

interface QuickAttendanceViewProps {
  currentUser: User;
  centers: DistributionCenter[];
  employees: EmployeeRoster[];
  onSaveSuccess: (activity: Activity) => void;
  onNavigateToForm: () => void;
}

export const QuickAttendanceView: React.FC<QuickAttendanceViewProps> = ({
  currentUser,
  centers,
  employees,
  onSaveSuccess,
  onNavigateToForm,
}) => {
  const isReadOnly = currentUser.role === 'consulta';
  const today = getTodayDateString();

  const [date, setDate] = useState<string>(today);
  const [centerId, setCenterId] = useState<string>(
    currentUser.centerId || centers[0]?.id || ''
  );
  const [scheduledStartTime, setScheduledStartTime] = useState<string>('06:00');
  const [actualStartTime, setActualStartTime] = useState<string>(
    getCurrentTimeString()
  );
  const [topic, setTopic] = useState<string>(
    'Matinal Operativa Diaria: Rutas y Seguridad'
  );
  const [facilitator, setFacilitator] = useState<string>(currentUser.name);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cargoFilter, setCargoFilter] = useState<string>('todos');

  // Asistencia temporal de los empleados del CD
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; arrivalTime: string; notes: string }>
  >(() => {
    const map: Record<
      string,
      { status: AttendanceStatus; arrivalTime: string; notes: string }
    > = {};
    employees.forEach((emp) => {
      map[emp.id] = {
        status: 'Asistió',
        arrivalTime: '05:55',
        notes: '',
      };
    });
    return map;
  });

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Filtrar empleados del CD seleccionado
  const centerEmployees = employees.filter(
    (e) => e.centerId === centerId && e.active
  );

  const filteredEmployees = centerEmployees.filter((emp) => {
    if (cargoFilter !== 'todos' && emp.cargo !== cargoFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode.includes(q) ||
        emp.cargo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSetStatus = (empId: string, status: AttendanceStatus) => {
    if (isReadOnly) return;
    setAttendanceMap((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status,
        arrivalTime:
          status === 'Asistió'
            ? prev[empId]?.arrivalTime || actualStartTime || '06:00'
            : '',
      },
    }));
  };

  const handleSetAll = (status: AttendanceStatus) => {
    if (isReadOnly) return;
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      centerEmployees.forEach((emp) => {
        updated[emp.id] = {
          ...updated[emp.id],
          status,
          arrivalTime: status === 'Asistió' ? actualStartTime || '06:00' : '',
        };
      });
      return updated;
    });
  };

  const handleSave = () => {
    if (isReadOnly) {
      setStatusMessage({
        type: 'error',
        text: 'Tu rol actual es de solo consulta y no tiene permisos para guardar.',
      });
      return;
    }

    if (!topic.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'El tema de la matinal es obligatorio.',
      });
      return;
    }

    if (centerEmployees.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No hay colaboradores en este Centro para registrar asistencia.',
      });
      return;
    }

    const attendees = centerEmployees.map((emp) => {
      const attState = attendanceMap[emp.id] || {
        status: 'Asistió',
        arrivalTime: '06:00',
        notes: '',
      };
      return {
        id: `att-${Date.now()}-${emp.id}`,
        employeeCode: emp.employeeCode,
        name: emp.name,
        cargo: emp.cargo,
        status: attState.status,
        arrivalTime: attState.arrivalTime,
        observations: attState.notes,
      };
    });

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      date,
      scheduledStartTime,
      actualStartTime,
      centerId,
      activityType: 'Matinal',
      topic: topic.trim(),
      facilitator: facilitator.trim(),
      generalNotes: 'Registro ágil de matinal matutina antes del despacho a ruta.',
      attendees,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    onSaveSuccess(newActivity);
  };

  // Conteo
  let countPresent = 0;
  let countAbsent = 0;
  let countJustified = 0;

  centerEmployees.forEach((emp) => {
    const s = attendanceMap[emp.id]?.status || 'Asistió';
    if (s === 'Asistió') countPresent++;
    else if (s === 'Ausente') countAbsent++;
    else if (s === 'Justificado') countJustified++;
  });

  const total = centerEmployees.length;
  const pct = total > 0 ? Math.round((countPresent / total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
              PASE DE LISTA RÁPIDO
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria CD</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2D4A]">
            Control Ágil de Matinal Matutina
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Optimizado para tablets y dispositivos táctiles en patio de operaciones.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToForm}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Formulario Completo →
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-[#0B2D4A] bg-[#CDA323] hover:bg-[#b8911d] rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Matinal ({countPresent}/{total})
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Configuración rápida de la sesión */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Centro de Distribución
          </label>
          <select
            value={centerId}
            onChange={(e) => setCenterId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Fecha de Matinal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Horario Real de Inicio
          </label>
          <input
            type="time"
            value={actualStartTime}
            onChange={(e) => setActualStartTime(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Facilitador de la Sesión
          </label>
          <input
            type="text"
            value={facilitator}
            onChange={(e) => setFacilitator(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Barra de progreso de asistencia y botones de lote */}
      <div className="bg-[#0B2D4A] text-white p-4 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-[#CDA323] tabular-nums">
              {pct}%
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Asistencia de la Tripulación
              </div>
              <div className="text-[11px] text-slate-300">
                {countPresent} Asistieron · {countAbsent} Ausentes · {countJustified} Justificados ({total} Convocados)
              </div>
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetAll('Asistió')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Todos Asistieron
            </button>
            <button
              onClick={() => handleSetAll('Ausente')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white transition-colors"
            >
              Limpiar / Ausentes
            </button>
          </div>
        )}
      </div>

      {/* Buscador de tripulación */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0B2D4A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium">Filtrar por Cargo:</span>
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          >
            <option value="todos">Todos los Cargos</option>
            <option value="Conductor">Conductor</option>
            <option value="Responsable de Ruta (RR)">Responsable de Ruta (RR)</option>
            <option value="Auxiliar de reparto">Auxiliar de reparto</option>
            <option value="Administrativo">Administrativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Empleados en Tarjetas Táctiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEmployees.map((emp) => {
          const current = attendanceMap[emp.id] || {
            status: 'Asistió',
            arrivalTime: '05:55',
            notes: '',
          };

          return (
            <div
              key={emp.id}
              className={`p-3.5 rounded-xl border transition-all ${
                current.status === 'Asistió'
                  ? 'bg-white border-emerald-300 shadow-2xs'
                  : current.status === 'Ausente'
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-amber-50/50 border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {emp.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {emp.cargo} · <span className="font-mono text-slate-400">{emp.employeeCode}</span>
                  </p>
                </div>
              </div>

              {/* Botones de Selección Rápida */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSetStatus(emp.id, 'Asistió')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    current.status === 'Asistió'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Asistió
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(emp.id, 'Ausente')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    current.status === 'Ausente'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Ausente
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(emp.id, 'Justificado')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    current.status === 'Justificado'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Justif.
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No se encontraron colaboradores en este centro con los filtros especificados.
        </div>
      )}
    </div>
  );
};
