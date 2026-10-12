export type Role = 'admin' | 'registrador' | 'consulta';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  centerId: string;
}

export type ActivityType =
  | 'Matinal'
  | 'Capacitación'
  | 'Reunión DPO'
  | 'Seguridad'
  | 'Refuerzo operativo'
  | 'Otra';

export type Cargo =
  | 'Conductor'
  | 'Responsable de Ruta (RR)'
  | 'Auxiliar de reparto'
  | 'Administrativo'
  | 'Otro';

export type AttendanceStatus = 'Asistió' | 'Ausente' | 'Justificado';

export interface Attendee {
  id: string;
  employeeCode: string; // Cédula o SAP ID
  name: string;
  cargo: Cargo;
  status: AttendanceStatus;
  arrivalTime: string; // HH:MM
  observations?: string;
}

export type CommitmentStatus = 'Pendiente' | 'En proceso' | 'Cerrado';

export interface DPOCommitment {
  id: string;
  activityId?: string;
  topic: string; // Tema o desviación identificada
  action: string; // Acción correctiva o compromiso
  responsible: string;
  centerId: string;
  deadline: string; // YYYY-MM-DD
  status: CommitmentStatus;
  closureEvidence?: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  scheduledStartTime: string; // HH:MM
  actualStartTime: string; // HH:MM
  centerId: string;
  activityType: ActivityType;
  topic: string;
  facilitator: string;
  generalNotes?: string;
  attendees: Attendee[];
  commitments?: DPOCommitment[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface DistributionCenter {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
}

export interface EmployeeRoster {
  id: string;
  employeeCode: string;
  name: string;
  cargo: Cargo;
  centerId: string;
  active: boolean;
  phone?: string;
}

export interface SystemSettings {
  excludeJustifiedFromPercentage: boolean;
  defaultCenterId: string;
  companyName: string;
  departmentName: string;
}

export interface AttendanceMetrics {
  totalActivities: number;
  totalCapacitaciones: number;
  totalConvocados: number;
  totalAsistieron: number;
  totalAusentes: number;
  totalJustificados: number;
  attendanceRate: number;
  calculationMethodology: string;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  centerId: string;
  activityType: string;
  cargo: string;
  searchTerm: string;
}
