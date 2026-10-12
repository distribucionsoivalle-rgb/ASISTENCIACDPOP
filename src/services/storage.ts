import {
  Activity,
  DPOCommitment,
  DistributionCenter,
  EmployeeRoster,
  SystemSettings,
  User,
} from '../types';

const STORAGE_KEYS = {
  ACTIVITIES: 'bavaria_matinal_activities_v2',
  COMMITMENTS: 'bavaria_matinal_commitments_v2',
  EMPLOYEES: 'bavaria_matinal_employees_v2',
  CENTERS: 'bavaria_matinal_centers_v2',
  SETTINGS: 'bavaria_matinal_settings_v2',
  CURRENT_USER: 'bavaria_matinal_current_user_v2',
  CUSTOM_LOGO: 'bavaria_matinal_custom_logo_v2',
};

export const DEFAULT_CENTERS: DistributionCenter[] = [
  { id: 'cd-popayan', code: 'CD-POP', name: 'CD Popayán', city: 'Popayán', address: 'Parque Industrial, Variante Norte' },
  { id: 'cd-cali', code: 'CD-CAL', name: 'CD Cali', city: 'Cali', address: 'Carrera 8 # 52-40, Base Aérea' },
  { id: 'cd-tulua', code: 'CD-TUL', name: 'CD Tuluá', city: 'Tuluá', address: 'Km 2 Vía Tuluá - Riofrío' },
  { id: 'cd-yumbo', code: 'CD-YUM', name: 'CD Yumbo', city: 'Yumbo', address: 'Zona Industrial Acopi, Cl 15 # 30-40' },
];

export const DEFAULT_USERS: User[] = [
  {
    id: '1059237194',
    name: 'Administrador DPO',
    email: '1059237194',
    role: 'admin',
    roleTitle: 'Administrador DPO / Jefe de Distribución',
    centerId: 'cd-cali',
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  excludeJustifiedFromPercentage: false, // Por defecto se incluye en el denominador según regla oficial DPO
  defaultCenterId: 'cd-cali',
  companyName: 'Bavaria & CIA S.C.A.',
  departmentName: 'Gerencia de Distribución y Logística - Pilar DPO',
};

export const INITIAL_EMPLOYEES: EmployeeRoster[] = [];

export const INITIAL_COMMITMENTS: DPOCommitment[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

class StorageService {
  constructor() {
    try {
      const clearedKey = 'bavaria_cleared_v5';
      if (!localStorage.getItem(clearedKey)) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
        localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
        localStorage.removeItem(STORAGE_KEYS.COMMITMENTS);
        localStorage.setItem(clearedKey, 'true');
      }
    } catch (e) {
      // ignore
    }
  }

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
    const validIds = ['cd-popayan', 'cd-cali', 'cd-tulua', 'cd-yumbo'];
    const isValid = Array.isArray(centers) && centers.length === 4 && centers.every(c => validIds.includes(c.id));
    if (!isValid) {
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
    const validIds = new Set(['cd-popayan', 'cd-cali', 'cd-tulua', 'cd-yumbo']);
    const legacyMap: Record<string, string> = {
      'cd-valle': 'cd-yumbo',
      'cd-tocancipa': 'cd-popayan',
      'cd-bucaramanga': 'cd-tulua',
      'cd-barranquilla': 'cd-cali',
      'cd-medellin': 'cd-cali',
      'cd-bogota-fon': 'cd-yumbo',
    };
    let hasChanges = false;
    const normalized = employees.map((emp) => {
      if (!validIds.has(emp.centerId)) {
        hasChanges = true;
        return { ...emp, centerId: legacyMap[emp.centerId] || 'cd-cali' };
      }
      return emp;
    });
    if (hasChanges) {
      this.setStorageItem(STORAGE_KEYS.EMPLOYEES, normalized);
      return normalized;
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

  // Vaciar todos los datos y registros demo
  clearAllData(): void {
    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, []);
    this.setStorageItem(STORAGE_KEYS.COMMITMENTS, []);
  }

  // Logo personalizado
  getCustomLogo(): string | null {
    return this.getStorageItem<string | null>(STORAGE_KEYS.CUSTOM_LOGO, null);
  }

  setCustomLogo(logoDataUrl: string | null): void {
    if (logoDataUrl) {
      this.setStorageItem(STORAGE_KEYS.CUSTOM_LOGO, logoDataUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
    }
    // Disparar evento para sincronizar todos los componentes inmediatamente
    window.dispatchEvent(new CustomEvent('bavaria_logo_updated', { detail: logoDataUrl }));
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
