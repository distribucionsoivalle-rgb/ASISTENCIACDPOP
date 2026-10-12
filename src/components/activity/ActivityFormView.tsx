import React, { useState, useEffect } from 'react';
import {
  Activity,
  Attendee,
  DistributionCenter,
  EmployeeRoster,
  User,
  ActivityType,
  Cargo,
  AttendanceStatus,
  DPOCommitment,
} from '../../types';
import {
  getTodayDateString,
  getCurrentTimeString,
  formatDateColombia,
} from '../../utils/formatters';
import {
  Save,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  UserCheck,
  ClipboardList,
  Sparkles,
  ArrowLeft,
  Search,
  ShieldAlert,
} from 'lucide-react';

interface ActivityFormViewProps {
  activityToEdit?: Activity | null;
  currentUser: User;
  centers: DistributionCenter[];
  employees: EmployeeRoster[];
  onSaveSuccess: (activity: Activity) => void;
  onCancel: () => void;
}

export const ActivityFormView: React.FC<ActivityFormViewProps> = ({
  activityToEdit,
  currentUser,
  centers,
  employees,
  onSaveSuccess,
  onCancel,
}) => {
  const isReadOnly = currentUser.role === 'consulta';

  // Form State: Actividad
  const [date, setDate] = useState<string>(
    activityToEdit?.date || getTodayDateString()
  );
  const [scheduledStartTime, setScheduledStartTime] = useState<string>(
    activityToEdit?.scheduledStartTime || '06:00'
  );
  const [actualStartTime, setActualStartTime] = useState<string>(
    activityToEdit?.actualStartTime || getCurrentTimeString()
  );
  const [centerId, setCenterId] = useState<string>(
    activityToEdit?.centerId || currentUser.centerId || centers[0]?.id || ''
  );
  const [activityType] = useState<ActivityType>('Matinal');
  const [topic, setTopic] = useState<string>(
    activityToEdit?.topic || 'Matinal Operativa Diaria: Seguridad y Despacho a Ruta'
  );
  const [facilitator, setFacilitator] = useState<string>(
    activityToEdit?.facilitator || currentUser.name
  );
  const [generalNotes, setGeneralNotes] = useState<string>(
    activityToEdit?.generalNotes || ''
  );

  // Form State: Asistentes
  const [attendees, setAttendees] = useState<Attendee[]>(
    activityToEdit?.attendees && activityToEdit.attendees.length > 0
      ? activityToEdit.attendees
      : [
          {
            id: `att-${Date.now()}-1`,
            employeeCode: '',
            name: '',
            cargo: 'Conductor',
            status: 'Asistió',
            arrivalTime: '05:55',
            observations: '',
          },
        ]
  );

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sincronizar si cambia activityToEdit
  useEffect(() => {
    if (activityToEdit) {
      setDate(activityToEdit.date);
      setScheduledStartTime(activityToEdit.scheduledStartTime);
      setActualStartTime(activityToEdit.actualStartTime);
      setCenterId(activityToEdit.centerId);
      setTopic(activityToEdit.topic);
      setFacilitator(activityToEdit.facilitator);
      setGeneralNotes(activityToEdit.generalNotes || '');
      setAttendees(activityToEdit.attendees);
    }
  }, [activityToEdit]);

  // Manejo de asistentes
  const handleAddAttendeeRow = () => {
    setAttendees([
      ...attendees,
      {
        id: `att-${Date.now()}-${Math.random()}`,
        employeeCode: '',
        name: '',
        cargo: 'Auxiliar de reparto',
        status: 'Asistió',
        arrivalTime: actualStartTime || '06:00',
        observations: '',
      },
    ]);
  };

  const handleRemoveAttendeeRow = (id: string) => {
    if (attendees.length <= 1) {
      setErrorMessage('Debe haber al menos un asistente en la lista.');
      return;
    }
    setAttendees(attendees.filter((a) => a.id !== id));
  };

  const handleUpdateAttendee = (id: string, field: keyof Attendee, value: any) => {
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        // Si se cambia el código de empleado, intentar autocompletar con la base de datos
        if (field === 'employeeCode') {
          const match = employees.find(
            (e) => e.employeeCode.trim() === String(value).trim()
          );
          if (match) {
            return {
              ...a,
              employeeCode: value,
              name: match.name,
              cargo: match.cargo,
            };
          }
        }

        return { ...a, [field]: value };
      })
    );
  };

  // Carga masiva de la nómina del CD seleccionado
  const handleLoadRosterFromCenter = () => {
    const centerEmployees = employees.filter((e) => e.centerId === centerId && e.active);
    if (centerEmployees.length === 0) {
      setErrorMessage(
        'No hay colaboradores registrados para este Centro de Distribución en el sistema.'
      );
      return;
    }

    const currentCodes = new Set(attendees.map((a) => a.employeeCode.trim()).filter(Boolean));
    const newAttendees: Attendee[] = [...attendees.filter((a) => a.name.trim() !== '')];

    centerEmployees.forEach((emp) => {
      if (!currentCodes.has(emp.employeeCode.trim())) {
        newAttendees.push({
          id: `att-${Date.now()}-${emp.id}`,
          employeeCode: emp.employeeCode,
          name: emp.name,
          cargo: emp.cargo,
          status: 'Asistió',
          arrivalTime: actualStartTime || '06:00',
          observations: '',
        });
      }
    });

    setAttendees(newAttendees);
    setSuccessMessage(`Se cargaron ${centerEmployees.length} colaboradores del CD exitosamente.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Marcar todos como Asistió
  const handleMarkAllAttended = () => {
    setAttendees((prev) =>
      prev.map((a) => ({
        ...a,
        status: 'Asistió',
        arrivalTime: a.arrivalTime || actualStartTime || '06:00',
      }))
    );
  };

  // Validación y Guardado
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isReadOnly) {
      setErrorMessage(
        'Tu rol actual (Solo Consulta) no tiene permisos para crear o modificar actividades.'
      );
      return;
    }

    // 1. Validaciones campos obligatorios de la actividad
    if (!date) {
      setErrorMessage('La fecha de la actividad es obligatoria.');
      return;
    }
    if (!scheduledStartTime || !actualStartTime) {
      setErrorMessage('Las horas programada y real de inicio son obligatorias.');
      return;
    }
    if (!centerId) {
      setErrorMessage('Debes seleccionar un Centro de Distribución.');
      return;
    }
    if (!topic.trim()) {
      setErrorMessage('El tema tratado es obligatorio.');
      return;
    }
    if (!facilitator.trim()) {
      setErrorMessage('El nombre del facilitador o responsable es obligatorio.');
      return;
    }

    // 2. Validaciones de asistentes
    if (attendees.length === 0) {
      setErrorMessage('Debes registrar al menos un asistente.');
      return;
    }

    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i];
      if (!att.name.trim()) {
        setErrorMessage(`El asistente #${i + 1} no tiene nombre completo.`);
        return;
      }
      if (!att.employeeCode.trim()) {
        setErrorMessage(`El asistente #${i + 1} (${att.name}) requiere identificación o código.`);
        return;
      }
      if (att.status === 'Asistió' && !att.arrivalTime) {
        // Asignar hora por defecto si asistió
        att.arrivalTime = actualStartTime || '06:00';
      }
    }

    // 3. Validación de duplicados de empleados en la misma actividad
    const seenCodes = new Set<string>();
    for (const att of attendees) {
      const code = att.employeeCode.trim();
      if (seenCodes.has(code)) {
        setErrorMessage(
          `El empleado con identificación "${code}" (${att.name}) está duplicado en la lista. No se permiten registros duplicados.`
        );
        return;
      }
      seenCodes.add(code);
    }

    const activityData: Activity = {
      id: activityToEdit?.id || `act-${Date.now()}`,
      date,
      scheduledStartTime,
      actualStartTime,
      centerId,
      activityType: 'Matinal',
      topic: topic.trim(),
      facilitator: facilitator.trim(),
      generalNotes: generalNotes.trim(),
      attendees,
      createdBy: activityToEdit?.createdBy || currentUser.name,
      createdAt: activityToEdit?.createdAt || new Date().toISOString(),
      updatedBy: activityToEdit ? currentUser.name : undefined,
      updatedAt: activityToEdit ? new Date().toISOString() : undefined,
    };

    onSaveSuccess(activityData);
  };

  // Cálculo rápido de asistencia en el formulario
  const totalAtt = attendees.length;
  const countAsistio = attendees.filter((a) => a.status === 'Asistió').length;
  const countAusente = attendees.filter((a) => a.status === 'Ausente').length;
  const countJustificado = attendees.filter((a) => a.status === 'Justificado').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado del Formulario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
                FORMULARIO OPERATIVO DPO
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">Bavaria Distribución</span>
            </div>
            <h2 className="text-xl font-bold text-[#0B2D4A]">
              {activityToEdit ? 'Editar Registro de Actividad' : 'Registrar Matinal o Capacitación'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-bold text-[#0B2D4A] bg-[#CDA323] hover:bg-[#b8911d] rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Registro
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Solo Lectura */}
      {isReadOnly && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center gap-3 text-xs">
          <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Modo Consulta Activo:</strong> Estás explorando el formulario con un perfil de solo lectura. Para guardar o modificar registros, cambia al rol de <em>Administrador</em> o <em>Responsable de Registro</em> en el encabezado.
          </span>
        </div>
      )}

      {/* Alertas de error y éxito */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-semibold">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="font-semibold">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: Información de la actividad */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-[#CDA323]" />
            <h3 className="text-sm font-bold text-[#0B2D4A] uppercase tracking-wide">
              1. Información de la Actividad
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de la actividad <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isReadOnly}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Formato Colombia: {formatDateColombia(date)}
              </span>
            </div>

            {/* Horas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hora programada de inicio <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                disabled={isReadOnly}
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hora real de inicio <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                disabled={isReadOnly}
                value={actualStartTime}
                onChange={(e) => setActualStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              />
            </div>

            {/* Centro de Distribución */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Centro de Distribución (CD) <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={isReadOnly}
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Tipo de Actividad (Fijo en Matinal) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de actividad
              </label>
              <div className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-bold text-[#0B2D4A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CDA323]" />
                <span>Matinal Diaria DPO</span>
              </div>
            </div>

            {/* Facilitador */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Facilitador o Responsable <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={facilitator}
                onChange={(e) => setFacilitator(e.target.value)}
                placeholder="Ej: Ing. Carlos Restrepo"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              />
            </div>

            {/* Tema tratado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tema tratado <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Estándar DPO de estiba segura y cero rotura"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Observaciones generales */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones generales y acuerdos establecidos
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Detalle de desviaciones tratadas, acuerdos del equipo o notas de seguridad..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0B2D4A] focus:outline-none focus:ring-1 focus:ring-[#0B2D4A] disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* SECCIÓN 2: Información de los Asistentes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#CDA323]" />
              <div>
                <h3 className="text-sm font-bold text-[#0B2D4A] uppercase tracking-wide">
                  2. Lista de Asistentes Convocados
                </h3>
                <p className="text-[11px] text-slate-500">
                  Control individual: Conductores, Responsables de Ruta (RR) y Auxiliares
                </p>
              </div>
            </div>

            {/* Acciones Rápidas de Nómina */}
            {!isReadOnly && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadRosterFromCenter}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#0B2D4A] bg-[#173F60]/10 hover:bg-[#173F60]/20 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Cargar colaboradores registrados en este Centro"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#CDA323]" />
                  Cargar Nómina del CD
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllAttended}
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Marcar Todos Presentes
                </button>
                <button
                  type="button"
                  onClick={handleAddAttendeeRow}
                  className="px-3 py-1.5 text-xs font-bold text-[#0B2D4A] bg-[#CDA323] hover:bg-[#b8911d] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Asistente
                </button>
              </div>
            )}
          </div>

          {/* Resumen rápido de conteo */}
          <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-700">Total: {totalAtt}</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">{countAsistio} Asistieron</span>
            <span className="text-slate-300">·</span>
            <span className="text-rose-700 font-semibold">{countAusente} Ausentes</span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-700 font-semibold">{countJustificado} Justificados</span>
          </div>

          {/* Tabla de Asistentes */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[140px]">
                    Identificación / Código <span className="text-rose-500">*</span>
                  </th>
                  <th className="py-2.5 px-3 min-w-[200px]">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </th>
                  <th className="py-2.5 px-3 min-w-[150px]">Cargo</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Asistencia</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Llegada</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Observación</th>
                  {!isReadOnly && <th className="py-2.5 px-2 w-10 text-center"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {attendees.map((att, idx) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Cédula */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={att.employeeCode}
                        onChange={(e) =>
                          handleUpdateAttendee(att.id, 'employeeCode', e.target.value)
                        }
                        placeholder="Ej: 1144023941"
                        className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:border-[#0B2D4A] focus:outline-none font-mono"
                      />
                    </td>

                    {/* Nombre */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={att.name}
                        onChange={(e) =>
                          handleUpdateAttendee(att.id, 'name', e.target.value)
                        }
                        placeholder="Nombre y Apellidos"
                        className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:border-[#0B2D4A] focus:outline-none"
                      />
                    </td>

                    {/* Cargo */}
                    <td className="py-2 px-3">
                      <select
                        disabled={isReadOnly}
                        value={att.cargo}
                        onChange={(e) =>
                          handleUpdateAttendee(att.id, 'cargo', e.target.value as Cargo)
                        }
                        className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:border-[#0B2D4A] focus:outline-none"
                      >
                        <option value="Conductor">Conductor</option>
                        <option value="Responsable de Ruta (RR)">Responsable de Ruta (RR)</option>
                        <option value="Auxiliar de reparto">Auxiliar de reparto</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </td>

                    {/* Estado Asistencia */}
                    <td className="py-2 px-3">
                      <select
                        disabled={isReadOnly}
                        value={att.status}
                        onChange={(e) =>
                          handleUpdateAttendee(
                            att.id,
                            'status',
                            e.target.value as AttendanceStatus
                          )
                        }
                        className={`w-full text-xs px-2 py-1.5 rounded border font-semibold focus:outline-none ${
                          att.status === 'Asistió'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : att.status === 'Ausente'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Asistió">Asistió</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Justificado">Justificado</option>
                      </select>
                    </td>

                    {/* Hora Llegada */}
                    <td className="py-2 px-3">
                      <input
                        type="time"
                        disabled={isReadOnly || att.status !== 'Asistió'}
                        value={att.arrivalTime}
                        onChange={(e) =>
                          handleUpdateAttendee(att.id, 'arrivalTime', e.target.value)
                        }
                        className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:border-[#0B2D4A] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                      />
                    </td>

                    {/* Observación */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={att.observations || ''}
                        onChange={(e) =>
                          handleUpdateAttendee(att.id, 'observations', e.target.value)
                        }
                        placeholder="Opcional..."
                        className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:border-[#0B2D4A] focus:outline-none"
                      />
                    </td>

                    {/* Eliminar Fila */}
                    {!isReadOnly && (
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendeeRow(att.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar asistente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isReadOnly && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddAttendeeRow}
                className="w-full py-2.5 border border-dashed border-slate-300 hover:border-[#0B2D4A] text-slate-600 hover:text-[#0B2D4A] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-slate-50/50 hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar otro participante a la actividad
              </button>
            </div>
          )}
        </div>


        {/* Botones Inferiores de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-[#0B2D4A] bg-[#CDA323] hover:bg-[#b8911d] rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Actividad y Asistencias
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
