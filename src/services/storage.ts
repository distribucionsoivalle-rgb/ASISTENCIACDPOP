import {
  Activity,
  DPOCommitment,
  DistributionCenter,
  EmployeeRoster,
  SystemSettings,
  User,
} from '../types';

const STORAGE_KEYS = {
  ACTIVITIES: 'bavaria_dpo_activities_v1',
  COMMITMENTS: 'bavaria_dpo_commitments_v1',
  EMPLOYEES: 'bavaria_dpo_employees_v1',
  CENTERS: 'bavaria_dpo_centers_v1',
  SETTINGS: 'bavaria_dpo_settings_v1',
  CURRENT_USER: 'bavaria_dpo_current_user_v1',
};

export const DEFAULT_CENTERS: DistributionCenter[] = [
  { id: 'cd-valle', code: 'CD-VAL', name: 'CD Valle (Yumbo)', city: 'Cali / Yumbo', address: 'Zona Industrial Acopi, Cl 15 #30-40' },
  { id: 'cd-tocancipa', code: 'CD-TOC', name: 'CD Tocancipá', city: 'Tocancipá', address: 'Autopista Norte Km 28' },
  { id: 'cd-bucaramanga', code: 'CD-BUC', name: 'CD Bucaramanga', city: 'Bucaramanga', address: 'Vía Girón Km 7' },
  { id: 'cd-barranquilla', code: 'CD-BAQ', name: 'CD Barranquilla', city: 'Barranquilla', address: 'Vía 40 # 85-200' },
  { id: 'cd-medellin', code: 'CD-MED', name: 'CD Medellín (Itagüí)', city: 'Itagüí / Medellín', address: 'Cra 42 # 54A-120' },
  { id: 'cd-bogota-fon', code: 'CD-BOG', name: 'CD Fontibón (Bogotá)', city: 'Bogotá D.C.', address: 'Av. El Dorado # 106-25' },
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Ing. Carlos Restrepo',
    email: 'distribucionsoivalle@gmail.com',
    role: 'admin',
    roleTitle: 'Administrador DPO / Jefe de Distribución',
    centerId: 'cd-valle',
  },
  {
    id: 'user-registrador',
    name: 'Fabián Murillo',
    email: 'operaciones.valle@bavaria.co',
    role: 'registrador',
    roleTitle: 'Supervisor de Rutas / Facilitador Matinal',
    centerId: 'cd-valle',
  },
  {
    id: 'user-consulta',
    name: 'Dra. Paola Andrea Gil',
    email: 'auditor.dpo@bavaria.co',
    role: 'consulta',
    roleTitle: 'Auditor Corporativo DPO (Solo Consulta)',
    centerId: 'cd-valle',
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  excludeJustifiedFromPercentage: false, // Por defecto se incluye en el denominador según regla oficial
  defaultCenterId: 'cd-valle',
  companyName: 'Bavaria & CIA S.C.A.',
  departmentName: 'Gerencia de Distribución y Logística - Pilar DPO',
};

export const INITIAL_EMPLOYEES: EmployeeRoster[] = [
  { id: 'emp-1', employeeCode: '1144023941', name: 'Carlos Alberto Mendoza', cargo: 'Conductor', centerId: 'cd-valle', active: true, phone: '3104529811' },
  { id: 'emp-2', employeeCode: '1130654210', name: 'Andrés Felipe Rincón', cargo: 'Responsable de Ruta (RR)', centerId: 'cd-valle', active: true, phone: '3128904422' },
  { id: 'emp-3', employeeCode: '1144189320', name: 'Jhonatan Valencia Hurtado', cargo: 'Auxiliar de reparto', centerId: 'cd-valle', active: true, phone: '3157210943' },
  { id: 'emp-4', employeeCode: '1113645892', name: 'Brayan Stiven Ortiz', cargo: 'Conductor', centerId: 'cd-valle', active: true, phone: '3168923011' },
  { id: 'emp-5', employeeCode: '1143890214', name: 'Héctor Fabio Caicedo', cargo: 'Responsable de Ruta (RR)', centerId: 'cd-valle', active: true, phone: '3206649102' },
  { id: 'emp-6', employeeCode: '1144567801', name: 'Luis Fernando Mosquera', cargo: 'Auxiliar de reparto', centerId: 'cd-valle', active: true, phone: '3189901234' },
  { id: 'emp-7', employeeCode: '1152438901', name: 'Mateo Zuluaga Echeverry', cargo: 'Auxiliar de reparto', centerId: 'cd-valle', active: true, phone: '3113459800' },
  { id: 'emp-8', employeeCode: '31985472', name: 'Diana Marcela Gómez', cargo: 'Administrativo', centerId: 'cd-valle', active: true, phone: '3145672311' },
  { id: 'emp-9', employeeCode: '1112456789', name: 'Víctor Manuel Quintero', cargo: 'Conductor', centerId: 'cd-valle', active: true, phone: '3174561234' },
  { id: 'emp-10', employeeCode: '1144321980', name: 'José Daniel Palacios', cargo: 'Responsable de Ruta (RR)', centerId: 'cd-valle', active: true, phone: '3187654321' },
  { id: 'emp-11', employeeCode: '1098765432', name: 'Jorge Iván Cárdenas', cargo: 'Conductor', centerId: 'cd-bucaramanga', active: true, phone: '3001234567' },
  { id: 'emp-12', employeeCode: '1098654321', name: 'Sandra Milena Villamizar', cargo: 'Administrativo', centerId: 'cd-bucaramanga', active: true, phone: '3012345678' },
  { id: 'emp-13', employeeCode: '1020304050', name: 'Yeison Alirio Parra', cargo: 'Responsable de Ruta (RR)', centerId: 'cd-tocancipa', active: true, phone: '3119876543' },
  { id: 'emp-14', employeeCode: '1030405060', name: 'Wilson David Beltrán', cargo: 'Conductor', centerId: 'cd-tocancipa', active: true, phone: '3128765432' },
  { id: 'emp-15', employeeCode: '1129543210', name: 'Gabriel Enrique Charry', cargo: 'Auxiliar de reparto', centerId: 'cd-barranquilla', active: true, phone: '3023456789' },
];

export const INITIAL_COMMITMENTS: DPOCommitment[] = [
  {
    id: 'com-1',
    activityId: 'act-1',
    topic: 'Desviación en el uso de calzado dieléctrico y guantes anticorte en bahía 3',
    action: 'Inspección previa 100% en salida de patio y reemplazo inmediato de EPP desgastados',
    responsible: 'Fabián Murillo (Supervisor de Rutas)',
    centerId: 'cd-valle',
    deadline: '2026-10-14',
    status: 'En proceso',
    createdAt: '2026-10-10T06:30:00Z',
    createdBy: 'Fabián Murillo',
  },
  {
    id: 'com-2',
    activityId: 'act-2',
    topic: 'Demora de 15 minutos en el inicio de cargue de camiones T2 y T3',
    action: 'Sincronizar liberación de órdenes en SAP con el equipo de montacargas a las 05:30 am',
    responsible: 'Diana Marcela Gómez (Despachos)',
    centerId: 'cd-valle',
    deadline: '2026-10-09',
    status: 'Pendiente', // Vencido para probar alertas
    createdAt: '2026-10-06T06:15:00Z',
    createdBy: 'Ing. Carlos Restrepo',
  },
  {
    id: 'com-3',
    activityId: 'act-3',
    topic: 'Alineación de protocolo DPO de Cero Alcohol y prueba de alcohosensor aleatoria',
    action: 'Realizar calibración mensual del equipo de alcoholemia y archivar certificados de trazabilidad',
    responsible: 'Seguridad y Salud en el Trabajo (SST)',
    centerId: 'cd-valle',
    deadline: '2026-10-05',
    status: 'Cerrado',
    closureEvidence: 'Certificado de calibración N° 4589 recibido de metrología. Equipo operativo al 100%.',
    closedAt: '2026-10-05T14:00:00Z',
    closedBy: 'Ing. Carlos Restrepo',
    createdAt: '2026-10-01T07:00:00Z',
    createdBy: 'Fabián Murillo',
  },
  {
    id: 'com-4',
    activityId: 'act-4',
    topic: 'Actualización obligatoria en manejo defensivo y puntos ciegos en vehículos pesados',
    action: 'Programar sesión práctica en pista para los 8 conductores con alertas de telemetría',
    responsible: 'Carlos Alberto Mendoza (Capacitador Flota)',
    centerId: 'cd-valle',
    deadline: '2026-10-18',
    status: 'Pendiente',
    createdAt: '2026-10-11T08:00:00Z',
    createdBy: 'Ing. Carlos Restrepo',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    date: '2026-10-12',
    scheduledStartTime: '06:00',
    actualStartTime: '06:05',
    centerId: 'cd-valle',
    activityType: 'Matinal',
    topic: 'Matinal Operativa DPO: Indicadores de Rotura en Ruta y Seguridad Vial',
    facilitator: 'Fabián Murillo',
    generalNotes: 'Se revisó la meta semanal de rotura (<0.08%). Buen compromiso de las tripulaciones de reparto zona norte.',
    createdBy: 'Fabián Murillo',
    createdAt: '2026-10-12T06:25:00Z',
    attendees: [
      { id: 'att-1-1', employeeCode: '1144023941', name: 'Carlos Alberto Mendoza', cargo: 'Conductor', status: 'Asistió', arrivalTime: '05:55', observations: 'Puntual' },
      { id: 'att-1-2', employeeCode: '1130654210', name: 'Andrés Felipe Rincón', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '05:58', observations: 'Llegada con checklist listo' },
      { id: 'att-1-3', employeeCode: '1144189320', name: 'Jhonatan Valencia Hurtado', cargo: 'Auxiliar de reparto', status: 'Asistió', arrivalTime: '06:02', observations: 'Sin novedad' },
      { id: 'att-1-4', employeeCode: '1113645892', name: 'Brayan Stiven Ortiz', cargo: 'Conductor', status: 'Asistió', arrivalTime: '05:50', observations: 'Inspección de vehículo OK' },
      { id: 'att-1-5', employeeCode: '1143890214', name: 'Héctor Fabio Caicedo', cargo: 'Responsable de Ruta (RR)', status: 'Ausente', arrivalTime: '', observations: 'Sin aviso previo a supervisor' },
      { id: 'att-1-6', employeeCode: '1144567801', name: 'Luis Fernando Mosquera', cargo: 'Auxiliar de reparto', status: 'Justificado', arrivalTime: '', observations: 'Incapacidad médica EPS radicada' },
      { id: 'att-1-7', employeeCode: '1152438901', name: 'Mateo Zuluaga Echeverry', cargo: 'Auxiliar de reparto', status: 'Asistió', arrivalTime: '06:04', observations: 'EPP completos' },
      { id: 'att-1-8', employeeCode: '31985472', name: 'Diana Marcela Gómez', cargo: 'Administrativo', status: 'Asistió', arrivalTime: '05:50', observations: 'Acompañamiento DPO' },
    ],
  },
  {
    id: 'act-2',
    date: '2026-10-11',
    scheduledStartTime: '07:30',
    actualStartTime: '07:30',
    centerId: 'cd-valle',
    activityType: 'Capacitación',
    topic: 'Capacitación Técnica: Estándares DPO de Ergonomía y Manipulación de Canastillas',
    facilitator: 'Ing. Carlos Restrepo',
    generalNotes: 'Capacitación teórica y práctica en patio de distribución. Demostración de técnica de levantamiento con 2 personas.',
    createdBy: 'Ing. Carlos Restrepo',
    createdAt: '2026-10-11T09:00:00Z',
    attendees: [
      { id: 'att-2-1', employeeCode: '1144023941', name: 'Carlos Alberto Mendoza', cargo: 'Conductor', status: 'Asistió', arrivalTime: '07:25', observations: 'Aprobó evaluación práctica' },
      { id: 'att-2-2', employeeCode: '1130654210', name: 'Andrés Felipe Rincón', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '07:28', observations: 'Participativo' },
      { id: 'att-2-3', employeeCode: '1144189320', name: 'Jhonatan Valencia Hurtado', cargo: 'Auxiliar de reparto', status: 'Asistió', arrivalTime: '07:30', observations: 'Aprobó evaluación' },
      { id: 'att-2-4', employeeCode: '1113645892', name: 'Brayan Stiven Ortiz', cargo: 'Conductor', status: 'Asistió', arrivalTime: '07:20', observations: 'Excelente técnica ergonómica' },
      { id: 'att-2-5', employeeCode: '1143890214', name: 'Héctor Fabio Caicedo', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '07:29', observations: 'Reintegro de turno' },
      { id: 'att-2-6', employeeCode: '1152438901', name: 'Mateo Zuluaga Echeverry', cargo: 'Auxiliar de reparto', status: 'Asistió', arrivalTime: '07:25', observations: 'Aprobó evaluación' },
      { id: 'att-2-7', employeeCode: '1112456789', name: 'Víctor Manuel Quintero', cargo: 'Conductor', status: 'Ausente', arrivalTime: '', observations: 'Ruta foránea en tránsito' },
    ],
  },
  {
    id: 'act-3',
    date: '2026-10-09',
    scheduledStartTime: '06:00',
    actualStartTime: '06:12',
    centerId: 'cd-valle',
    activityType: 'Reunión DPO',
    topic: 'Comité de Pilar Warehouse y Distribución: Análisis de Pérdidas y Tiempos de Ciclo',
    facilitator: 'Ing. Carlos Restrepo',
    generalNotes: 'Evaluación de los 5 pilares DPO: Seguridad, Calidad, Costos, Servicio y Personas.',
    createdBy: 'Ing. Carlos Restrepo',
    createdAt: '2026-10-09T07:45:00Z',
    attendees: [
      { id: 'att-3-1', employeeCode: '1144023941', name: 'Carlos Alberto Mendoza', cargo: 'Conductor', status: 'Asistió', arrivalTime: '06:00', observations: 'Líder conductor' },
      { id: 'att-3-2', employeeCode: '1130654210', name: 'Andrés Felipe Rincón', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '06:05', observations: 'Líder RR' },
      { id: 'att-3-3', employeeCode: '31985472', name: 'Diana Marcela Gómez', cargo: 'Administrativo', status: 'Asistió', arrivalTime: '05:55', observations: 'Presentación de KPI' },
      { id: 'att-3-4', employeeCode: '1144321980', name: 'José Daniel Palacios', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '06:10', observations: 'Aporte en ruta sur' },
    ],
  },
  {
    id: 'act-4',
    date: '2026-10-08',
    scheduledStartTime: '06:15',
    actualStartTime: '06:15',
    centerId: 'cd-bucaramanga',
    activityType: 'Matinal',
    topic: 'Matinal de Seguridad Vial y Chequeo Pre-operacional de Frenos y Luces',
    facilitator: 'Jorge Iván Cárdenas',
    generalNotes: 'Revisión exhaustiva con supervisor de patio.',
    createdBy: 'Jorge Iván Cárdenas',
    createdAt: '2026-10-08T06:50:00Z',
    attendees: [
      { id: 'att-4-1', employeeCode: '1098765432', name: 'Jorge Iván Cárdenas', cargo: 'Conductor', status: 'Asistió', arrivalTime: '06:10', observations: 'Todo conforme' },
      { id: 'att-4-2', employeeCode: '1098654321', name: 'Sandra Milena Villamizar', cargo: 'Administrativo', status: 'Asistió', arrivalTime: '06:12', observations: 'Registro DPO' },
    ],
  },
  {
    id: 'act-5',
    date: '2026-10-07',
    scheduledStartTime: '14:00',
    actualStartTime: '14:05',
    centerId: 'cd-tocancipa',
    activityType: 'Capacitación',
    topic: 'Capacitación: Manejo de Sustancias Peligrosas y Amoniaco en Planta y CD',
    facilitator: 'Wilson David Beltrán',
    generalNotes: 'Simulacro de evacuación y uso de máscara para amoniaco.',
    createdBy: 'Wilson David Beltrán',
    createdAt: '2026-10-07T15:30:00Z',
    attendees: [
      { id: 'att-5-1', employeeCode: '1030405060', name: 'Wilson David Beltrán', cargo: 'Conductor', status: 'Asistió', arrivalTime: '13:55', observations: 'Práctica OK' },
      { id: 'att-5-2', employeeCode: '1020304050', name: 'Yeison Alirio Parra', cargo: 'Responsable de Ruta (RR)', status: 'Asistió', arrivalTime: '13:58', observations: 'Evaluación 10/10' },
    ],
  },
];

class StorageService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  // Centros de Distribución
  getCenters(): DistributionCenter[] {
    const centers = this.getStorageItem<DistributionCenter[]>(STORAGE_KEYS.CENTERS, []);
    if (!centers || centers.length === 0) {
      this.setStorageItem(STORAGE_KEYS.CENTERS, DEFAULT_CENTERS);
      return DEFAULT_CENTERS;
    }
    return centers;
  }

  saveCenter(center: DistributionCenter): void {
    const centers = this.getCenters();
    const index = centers.findIndex(c => c.id === center.id);
    if (index >= 0) {
      centers[index] = center;
    } else {
      centers.push(center);
    }
    this.setStorageItem(STORAGE_KEYS.CENTERS, centers);
  }

  // Actividades
  getActivities(): Activity[] {
    const activities = this.getStorageItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
    if (!activities || activities.length === 0) {
      this.setStorageItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
      return INITIAL_ACTIVITIES;
    }
    return activities;
  }

  getActivityById(id: string): Activity | undefined {
    return this.getActivities().find(a => a.id === id);
  }

  saveActivity(activity: Activity): { success: boolean; message: string; activity?: Activity } {
    // Validación de duplicados de empleados en la misma actividad
    const employeeIds = new Set<string>();
    for (const att of activity.attendees) {
      const code = att.employeeCode.trim().toLowerCase();
      if (code && employeeIds.has(code)) {
        return {
          success: false,
          message: `El empleado con identificación "${att.employeeCode}" está duplicado en la lista de asistentes. Por favor elimina el registro repetido.`,
        };
      }
      if (code) employeeIds.add(code);
    }

    const activities = this.getActivities();
    const existingIndex = activities.findIndex(a => a.id === activity.id);

    if (existingIndex >= 0) {
      activities[existingIndex] = {
        ...activity,
        updatedAt: new Date().toISOString(),
      };
    } else {
      activities.unshift({
        ...activity,
        id: activity.id || `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, activities);
    return { success: true, message: 'Actividad guardada exitosamente', activity };
  }

  deleteActivity(id: string): boolean {
    const activities = this.getActivities().filter(a => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, activities);
    return true;
  }

  // Empleados / Nómina de Asistentes
  getEmployees(): EmployeeRoster[] {
    const employees = this.getStorageItem<EmployeeRoster[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (!employees || employees.length === 0) {
      this.setStorageItem(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return employees;
  }

  saveEmployee(employee: EmployeeRoster): { success: boolean; message: string } {
    const employees = this.getEmployees();
    // Validar código duplicado
    const duplicate = employees.find(
      e => e.employeeCode === employee.employeeCode && e.id !== employee.id
    );
    if (duplicate) {
      return {
        success: false,
        message: `Ya existe un empleado con la identificación ${employee.employeeCode} (${duplicate.name}).`,
      };
    }

    const index = employees.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      employees[index] = employee;
    } else {
      employees.push({
        ...employee,
        id: employee.id || `emp-${Date.now()}`,
      });
    }
    this.setStorageItem(STORAGE_KEYS.EMPLOYEES, employees);
    return { success: true, message: 'Empleado registrado exitosamente' };
  }

  deleteEmployee(id: string): void {
    const employees = this.getEmployees().filter(e => e.id !== id);
    this.setStorageItem(STORAGE_KEYS.EMPLOYEES, employees);
  }

  // Compromisos DPO
  getCommitments(): DPOCommitment[] {
    const commitments = this.getStorageItem<DPOCommitment[]>(STORAGE_KEYS.COMMITMENTS, []);
    if (!commitments || commitments.length === 0) {
      this.setStorageItem(STORAGE_KEYS.COMMITMENTS, INITIAL_COMMITMENTS);
      return INITIAL_COMMITMENTS;
    }
    return commitments;
  }

  saveCommitment(commitment: DPOCommitment): void {
    const commitments = this.getCommitments();
    const index = commitments.findIndex(c => c.id === commitment.id);
    if (index >= 0) {
      commitments[index] = {
        ...commitment,
        updatedAt: new Date().toISOString(),
      };
    } else {
      commitments.unshift({
        ...commitment,
        id: commitment.id || `com-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }
    this.setStorageItem(STORAGE_KEYS.COMMITMENTS, commitments);
  }

  deleteCommitment(id: string): void {
    const commitments = this.getCommitments().filter(c => c.id !== id);
    this.setStorageItem(STORAGE_KEYS.COMMITMENTS, commitments);
  }

  // Auto-registro de asistencia por colaborador (Kiosco / Móvil)
  registerSelfAttendance(params: {
    employeeCode: string;
    cargo: import('../types').Cargo;
    centerId: string;
    fullName?: string;
    activityId?: string;
    observation?: string;
  }): {
    success: boolean;
    message: string;
    isDuplicate?: boolean;
    attendee?: import('../types').Attendee;
    activity?: Activity;
    recordedTime?: string;
  } {
    const code = params.employeeCode.trim();
    if (!code) {
      return { success: false, message: 'El número de cédula es obligatorio.' };
    }

    // Hora automática en formato HH:mm y HH:mm:ss (hora de Colombia)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const recordedTime = `${hours}:${minutes}`;
    const detailedTime = `${hours}:${minutes}:${seconds}`;

    // Fecha actual YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    // Buscar si existe en nómina
    const employees = this.getEmployees();
    const foundEmp = employees.find(e => e.employeeCode.trim() === code);
    const resolvedName = params.fullName?.trim() || foundEmp?.name || `Colaborador CC ${code}`;

    // Si es nuevo y se suministró nombre, guardarlo en nómina para agilizar futuros registros
    if (!foundEmp && params.fullName?.trim()) {
      this.saveEmployee({
        id: `emp-${Date.now()}`,
        employeeCode: code,
        name: params.fullName.trim(),
        cargo: params.cargo,
        centerId: params.centerId,
        active: true,
      });
    }

    // Buscar actividad activa de hoy para este Centro o la especificada
    const activities = this.getActivities();
    let targetActivity = params.activityId
      ? activities.find(a => a.id === params.activityId)
      : activities.find(a => a.date === todayDate && a.centerId === params.centerId);

    // Si no existe actividad para hoy en ese CD, crear la matinal del día automáticamente
    if (!targetActivity) {
      targetActivity = {
        id: `act-${Date.now()}`,
        date: todayDate,
        scheduledStartTime: '06:00',
        actualStartTime: recordedTime,
        centerId: params.centerId,
        activityType: 'Matinal',
        topic: 'Matinal Operativa Diaria DPO - Despacho y Seguridad',
        facilitator: 'Supervisor de Turno / Auto-registro',
        generalNotes: 'Actividad abierta para auto-registro de tripulaciones y colaboradores.',
        createdBy: 'Auto-registro Kiosco DPO',
        createdAt: new Date().toISOString(),
        attendees: [],
      };
      activities.unshift(targetActivity);
    }

    // Validar duplicado en esta actividad
    const existingAttendee = targetActivity.attendees.find(
      a => a.employeeCode.trim() === code
    );

    if (existingAttendee) {
      return {
        success: false,
        isDuplicate: true,
        message: `¡Hola ${existingAttendee.name}! Ya te encuentras registrado para la actividad de hoy con hora de llegada ${existingAttendee.arrivalTime || 'registrada'}.`,
        attendee: existingAttendee,
        activity: targetActivity,
        recordedTime: existingAttendee.arrivalTime,
      };
    }

    // Registrar nuevo asistente con hora automática del sistema
    const newAttendee: import('../types').Attendee = {
      id: `att-self-${Date.now()}`,
      employeeCode: code,
      name: resolvedName,
      cargo: params.cargo,
      status: 'Asistió',
      arrivalTime: recordedTime,
      observations: params.observation?.trim() || `Auto-registro a las ${detailedTime}`,
    };

    targetActivity.attendees.push(newAttendee);
    targetActivity.updatedAt = new Date().toISOString();
    targetActivity.updatedBy = 'Auto-registro Colaborador';

    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, activities);

    return {
      success: true,
      message: `¡Asistencia registrada con éxito! Bienvenido ${resolvedName}.`,
      attendee: newAttendee,
      activity: targetActivity,
      recordedTime: detailedTime,
    };
  }

  // Configuración
  getSettings(): SystemSettings {
    const settings = this.getStorageItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  saveSettings(settings: SystemSettings): void {
    this.setStorageItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Usuario actual
  getCurrentUser(): User {
    const user = this.getStorageItem<User>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
    return user || DEFAULT_USERS[0];
  }

  setCurrentUser(user: User): void {
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Restaurar demo data
  resetToDemoData(): void {
    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.setStorageItem(STORAGE_KEYS.COMMITMENTS, INITIAL_COMMITMENTS);
    this.setStorageItem(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    this.setStorageItem(STORAGE_KEYS.CENTERS, DEFAULT_CENTERS);
    this.setStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
  }

  // Exportar todo el backup JSON
  exportBackupJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      activities: this.getActivities(),
      commitments: this.getCommitments(),
      employees: this.getEmployees(),
      centers: this.getCenters(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  // Importar backup JSON
  importBackupJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.activities)) this.setStorageItem(STORAGE_KEYS.ACTIVITIES, data.activities);
      if (Array.isArray(data.commitments)) this.setStorageItem(STORAGE_KEYS.COMMITMENTS, data.commitments);
      if (Array.isArray(data.employees)) this.setStorageItem(STORAGE_KEYS.EMPLOYEES, data.employees);
      if (Array.isArray(data.centers)) this.setStorageItem(STORAGE_KEYS.CENTERS, data.centers);
      if (data.settings) this.setStorageItem(STORAGE_KEYS.SETTINGS, data.settings);
      return { success: true, message: 'Datos importados correctamente con éxito.' };
    } catch (e: any) {
      return { success: false, message: `Error al procesar el archivo JSON: ${e.message}` };
    }
  }
}

export const storage = new StorageService();
