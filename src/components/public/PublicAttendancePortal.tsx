import React, { useState, useEffect, useMemo } from 'react';
import {
  DistributionCenter,
  EmployeeRoster,
  Activity,
  Cargo,
  Attendee,
} from '../../types';
import { storage } from '../../services/storage';
import { formatDateColombia, getTodayDateString } from '../../utils/formatters';
import { BavariaLogo } from '../common/BavariaLogo';
import {
  CheckCircle2,
  Clock,
  IdCard,
  Truck,
  ClipboardList,
  PackageCheck,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Building,
  UserCheck,
  Lock,
  QrCode,
  X,
} from 'lucide-react';

interface PublicAttendancePortalProps {
  centers: DistributionCenter[];
  employees: EmployeeRoster[];
  activities: Activity[];
  onAttendanceRegistered: (updatedActivity: Activity) => void;
  onOpenLogin: () => void;
}

export const PublicAttendancePortal: React.FC<PublicAttendancePortalProps> = ({
  centers,
  employees,
  activities,
  onAttendanceRegistered,
  onOpenLogin,
}) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    centers[0]?.id || 'cd-valle'
  );

  // Form State
  const [cedula, setCedula] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [cargo, setCargo] = useState<Cargo>('Conductor');
  const [observation, setObservation] = useState<string>('');

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');

  // Feedback State
  const [resultState, setResultState] = useState<{
    type: 'success' | 'duplicate' | 'error';
    message: string;
    attendee?: Attendee;
    recordedTime?: string;
  } | null>(null);

  const [countdown, setCountdown] = useState<number>(5);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  // Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s}`);

      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const dayName = dayNames[now.getDay()];
      const dayNum = now.getDate();
      const monthName = monthNames[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDateString(`${dayName}, ${dayNum} de ${monthName} de ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Temporizador de reinicio tras registro exitoso
  useEffect(() => {
    if (resultState && resultState.type === 'success') {
      setCountdown(6);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleResetForm();
            return 6;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resultState]);

  // Reconocimiento automático del colaborador al escribir la cédula
  const matchedEmployee = useMemo(() => {
    const clean = cedula.trim();
    if (!clean || clean.length < 5) return null;
    return employees.find((e) => e.employeeCode.trim() === clean);
  }, [cedula, employees]);

  useEffect(() => {
    if (matchedEmployee) {
      setFullName(matchedEmployee.name);
      setCargo(matchedEmployee.cargo);
    }
  }, [matchedEmployee]);

  // Actividad de hoy para el centro
  const today = getTodayDateString();
  const todayActivity = useMemo(() => {
    return activities.find(
      (a) => a.date === today && a.centerId === selectedCenterId
    );
  }, [activities, today, selectedCenterId]);

  // Últimos colaboradores registrados hoy
  const recentAttendees = useMemo(() => {
    if (!todayActivity || !todayActivity.attendees) return [];
    return [...todayActivity.attendees].reverse().slice(0, 6);
  }, [todayActivity]);

  const handleResetForm = () => {
    setCedula('');
    setFullName('');
    setObservation('');
    setResultState(null);
  };

  const handleQuickKeypad = (digit: string) => {
    if (digit === 'DEL') {
      setCedula((prev) => prev.slice(0, -1));
    } else if (digit === 'CLR') {
      setCedula('');
      setFullName('');
    } else {
      if (cedula.length < 12) {
        setCedula((prev) => prev + digit);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cedula.trim()) {
      setResultState({
        type: 'error',
        message: 'Por favor ingresa tu número de cédula o código.',
      });
      return;
    }

    const res = storage.registerSelfAttendance({
      employeeCode: cedula.trim(),
      cargo,
      centerId: selectedCenterId,
      fullName: fullName.trim() || undefined,
      observation: observation.trim() || undefined,
    });

    if (res.success && res.activity) {
      setResultState({
        type: 'success',
        message: res.message,
        attendee: res.attendee,
        recordedTime: res.recordedTime,
      });
      onAttendanceRegistered(res.activity);
    } else if (res.isDuplicate) {
      setResultState({
        type: 'duplicate',
        message: res.message,
        attendee: res.attendee,
        recordedTime: res.recordedTime,
      });
    } else {
      setResultState({
        type: 'error',
        message: res.message,
      });
    }
  };

  const selectedCenter = centers.find((c) => c.id === selectedCenterId) || centers[0];

  const cargoOptions: { value: Cargo; label: string; icon: any }[] = [
    { value: 'Conductor', label: 'Conductor', icon: Truck },
    { value: 'Responsable de Ruta (RR)', label: 'Responsable de Ruta (RR)', icon: ClipboardList },
    { value: 'Auxiliar de reparto', label: 'Auxiliar de Reparto', icon: PackageCheck },
    { value: 'Administrativo', label: 'Administrativo', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex flex-col justify-between font-sans">
      {/* Encabezado Corporativo Oficial */}
      <header className="bg-[#0B2D4A] border-b border-[#173F60] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <BavariaLogo className="shrink-0" />
            <div className="hidden sm:block h-8 w-px bg-[#173F60]" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase whitespace-nowrap truncate">
                CONTROL DE ASISTENCIA – DPO
              </h1>
              <p className="text-[11px] text-[#CDA323] font-semibold truncate">
                Registro Oficial de Asistencia a la Matinal Diaria DPO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Reloj en el encabezado */}
            <div className="hidden md:flex items-center gap-2 bg-[#173F60] px-3 py-1.5 rounded-lg border border-[#24537a]">
              <Clock className="w-3.5 h-3.5 text-[#CDA323]" />
              <span className="text-xs font-mono font-bold text-white tabular-nums">
                {currentTime || '06:00:00'}
              </span>
            </div>

            {/* Botón de Acceso para Administrador / Iniciar Sesión */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold text-xs transition-colors shadow-sm"
              title="Iniciar sesión para acceder al panel de administración y reportes"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso Administrativo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal: Formulario de Asistencia */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Banner Informativo con CD y Reloj en Vivo */}
        <div className="bg-[#0B2D4A] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-[#173F60] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#CDA323] tracking-widest uppercase">
                  BIENVENIDO A LA MATINAL
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-300 font-medium">Operaciones Bavaria</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Registra tu Asistencia de Hoy
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Ingresa tu número de cédula y selecciona tu cargo. La hora se registrará automáticamente.
              </p>
            </div>

            {/* Reloj Digital Grande */}
            <div className="bg-[#173F60] px-4 py-3 rounded-xl border border-[#24537a] text-center sm:text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-[#CDA323] tabular-nums font-mono tracking-wider">
                {currentTime || '06:00:00'}
              </div>
              <div className="text-[11px] text-slate-300 font-medium capitalize mt-0.5">
                {currentDateString}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#173F60] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#CDA323]" />
              <span className="text-slate-300">Centro de Distribución:</span>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="bg-[#173F60] text-white font-bold px-2 py-1 rounded border border-[#2a5982] focus:outline-none cursor-pointer"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setQrModalOpen(true)}
              className="text-xs text-[#CDA323] hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              Código QR para Celulares
            </button>
          </div>
        </div>

        {/* ESTADO 1: Confirmación Exitosa */}
        {resultState && resultState.type === 'success' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-400 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                    REGISTRO COMPLETADO
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    ¡Asistencia Registrada Exitosamente!
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Siguiente en:</span>
                <span className="text-xl font-black text-[#0B2D4A] tabular-nums font-mono">
                  {countdown}s
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Colaborador</span>
                <strong className="text-sm font-bold text-[#0B2D4A] block truncate">
                  {resultState.attendee?.name}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cédula</span>
                <strong className="text-sm font-bold text-slate-800 font-mono block">
                  {resultState.attendee?.employeeCode}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cargo</span>
                <strong className="text-sm font-bold text-slate-800 block">
                  {resultState.attendee?.cargo}
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Hora Registrada</span>
                <strong className="text-sm font-black text-emerald-700 tabular-nums font-mono block">
                  {resultState.recordedTime} (Automática)
                </strong>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Recomendación DPO:</strong> Realiza el chequeo pre-operacional de tu vehículo, utiliza tus elementos de protección personal (EPP) y recuerda: Cero Alcohol y conducción a la defensiva. ¡Que tengas un excelente turno!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 bg-[#0B2D4A] hover:bg-[#173F60] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Registrar Siguiente Colaborador →
              </button>
            </div>
          </div>
        )}

        {/* ESTADO 2: Notificación de Duplicado */}
        {resultState && resultState.type === 'duplicate' && (
          <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl shadow-lg space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  ¡Ya te encuentras registrado para la matinal de hoy!
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {resultState.message}
                </p>
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  No es necesario registrarte de nuevo. Tu asistencia ya está guardada en la base de datos oficial.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 bg-[#0B2D4A] text-white text-xs font-bold rounded-lg hover:bg-[#173F60] transition-colors"
              >
                Entendido / Siguiente Colaborador
              </button>
            </div>
          </div>
        )}

        {/* ESTADO 3: Error */}
        {resultState && resultState.type === 'error' && (
          <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {resultState.message}
            </div>
            <button
              onClick={() => setResultState(null)}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* FORMULARIO PRINCIPAL */}
        {(!resultState || resultState.type === 'error') && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#0B2D4A]">
                1. Digita tu Número de Cédula
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Al ingresar tu documento, el sistema reconocerá tu nombre automáticamente si estás en la base de {selectedCenter.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Cédula y Teclado Numérico */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Número de Cédula de Ciudadanía <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IdCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      autoFocus
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 1144023941"
                      className="w-full pl-11 pr-4 py-3 text-lg font-bold font-mono rounded-xl border-2 border-slate-300 focus:border-[#0B2D4A] focus:outline-none tracking-wide text-slate-900 bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Reconocimiento Inteligente de Nómina */}
                {matchedEmployee ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Colaborador Identificado
                      </span>
                      <strong className="text-sm font-black text-emerald-950">
                        {matchedEmployee.name}
                      </strong>
                      <div className="text-emerald-700 text-[11px] mt-0.5">
                        Cargo en sistema: {matchedEmployee.cargo}
                      </div>
                    </div>
                    <UserCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                ) : cedula.length >= 6 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      ¿Primera vez registrándote con esta cédula? Digita tu nombre:
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu Nombre y Apellidos completos"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#0B2D4A]"
                    />
                  </div>
                ) : null}

                {/* Teclado numérico táctil */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Teclado táctil:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleQuickKeypad(k)}
                        className={`py-3 rounded-lg font-bold text-sm transition-colors ${
                          k === 'DEL' || k === 'CLR'
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono shadow-2xs'
                        }`}
                      >
                        {k === 'DEL' ? 'Borrar' : k === 'CLR' ? 'Limpiar' : k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selección de Cargo y Botón de Envío */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    2. Selecciona tu Cargo <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {cargoOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = cargo === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCargo(opt.value)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-[#0B2D4A] text-white border-[#0B2D4A] shadow-md ring-2 ring-[#CDA323]/50'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#CDA323] text-[#0B2D4A]' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botón de Envío con Estampado Automático de Hora */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 px-4 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-black text-sm rounded-xl shadow-lg transition-all transform active:scale-98 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      REGISTRAR MI ASISTENCIA
                    </span>
                    <span className="text-[11px] font-semibold text-[#0B2D4A]/80 font-mono">
                      Hora automática del reloj: {currentTime || 'Ahora'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Monitor de Últimas Llegadas Registradas Hoy */}
        {recentAttendees.length > 0 && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-[#0B2D4A] uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Últimas Asistencias Registradas en {selectedCenter.name}
              </h4>
              <span className="text-[11px] text-slate-400">
                Total hoy: {todayActivity?.attendees.length || 0} colaboradores
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {recentAttendees.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 truncate">{att.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {att.cargo} · <span className="font-mono">{att.employeeCode}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 font-mono tabular-nums block">
                      {att.arrivalTime}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase">
                      Presente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Bavaria & CIA S.C.A. · Programa de Excelencia DPO</span>
          <span>Disciplina Operativa en Centros de Distribución y Rutas de Reparto</span>
        </div>
      </footer>

      {/* Modal QR para celular */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#CDA323] uppercase">Acceso Móvil</span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-[#0B2D4A]">
              Escanea desde tu Celular
            </h3>
            <p className="text-xs text-slate-500">
              Abre la cámara de tu teléfono móvil para registrar tu asistencia en patio de maniobras.
            </p>

            <div className="w-48 h-48 mx-auto bg-slate-50 border-2 border-slate-200 p-3 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="5" y="5" width="28" height="28" fill="#0B2D4A" rx="4" />
                <rect x="11" y="11" width="16" height="16" fill="white" />
                <rect x="15" y="15" width="8" height="8" fill="#CDA323" />

                <rect x="67" y="5" width="28" height="28" fill="#0B2D4A" rx="4" />
                <rect x="73" y="11" width="16" height="16" fill="white" />
                <rect x="77" y="15" width="8" height="8" fill="#CDA323" />

                <rect x="5" y="67" width="28" height="28" fill="#0B2D4A" rx="4" />
                <rect x="11" y="73" width="16" height="16" fill="white" />
                <rect x="15" y="77" width="8" height="8" fill="#CDA323" />

                <rect x="38" y="10" width="6" height="6" fill="#0B2D4A" />
                <rect x="48" y="10" width="6" height="6" fill="#0B2D4A" />
                <rect x="38" y="24" width="6" height="6" fill="#0B2D4A" />
                <rect x="48" y="32" width="6" height="6" fill="#CDA323" />
                <rect x="10" y="45" width="6" height="6" fill="#0B2D4A" />
                <rect x="25" y="45" width="6" height="6" fill="#0B2D4A" />
                <rect x="40" y="45" width="6" height="6" fill="#0B2D4A" />
                <rect x="55" y="45" width="6" height="6" fill="#CDA323" />
                <rect x="70" y="45" width="6" height="6" fill="#0B2D4A" />
                <rect x="85" y="45" width="6" height="6" fill="#0B2D4A" />
                <rect x="40" y="60" width="6" height="6" fill="#0B2D4A" />
                <rect x="55" y="60" width="6" height="6" fill="#0B2D4A" />
                <rect x="70" y="60" width="6" height="6" fill="#CDA323" />
                <rect x="85" y="75" width="6" height="6" fill="#0B2D4A" />
                <rect x="40" y="80" width="6" height="6" fill="#CDA323" />
                <rect x="55" y="80" width="6" height="6" fill="#0B2D4A" />
              </svg>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 bg-[#0B2D4A] text-white text-xs font-bold rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
