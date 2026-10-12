import { Activity, AttendanceMetrics, SystemSettings } from '../types';

/**
 * Convierte fecha YYYY-MM-DD a DD/MM/AAAA (Colombia)
 */
export function formatDateColombia(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en hora de Colombia (UTC-5)
 */
export function getTodayDateString(): string {
  const now = new Date();
  // Colombia is UTC-5
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const colDate = new Date(utc - 5 * 3600000);
  const year = colDate.getFullYear();
  const month = String(colDate.getMonth() + 1).padStart(2, '0');
  const day = String(colDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la hora actual en formato HH:MM
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Comprueba si una fecha límite está vencida respecto a hoy
 */
export function isOverdue(deadlineStr: string, status: string): boolean {
  if (status === 'Cerrado') return false;
  if (!deadlineStr) return false;
  const today = getTodayDateString();
  return deadlineStr < today;
}

/**
 * Calcula las métricas de asistencia según la directriz solicitada:
 * Porcentaje de asistencia = asistentes ÷ total de personas convocadas × 100
 * Excluir las ausencias justificadas del denominador únicamente cuando exista una configuración explícita para ello.
 */
export function calculateAttendanceMetrics(
  activities: Activity[],
  settings: SystemSettings
): AttendanceMetrics {
  let totalConvocados = 0;
  let totalAsistieron = 0;
  let totalAusentes = 0;
  let totalJustificados = 0;
  let totalCapacitaciones = 0;

  for (const act of activities) {
    if (act.activityType === 'Capacitación') {
      totalCapacitaciones++;
    }

    for (const att of act.attendees) {
      totalConvocados++;
      if (att.status === 'Asistió') {
        totalAsistieron++;
      } else if (att.status === 'Ausente') {
        totalAusentes++;
      } else if (att.status === 'Justificado') {
        totalJustificados++;
      }
    }
  }

  let denominator = totalConvocados;
  let methodology = 'Estándar DPO: Asistentes ÷ Total Convocados × 100 (incluye ausencias justificadas en base)';

  if (settings.excludeJustifiedFromPercentage) {
    denominator = Math.max(0, totalConvocados - totalJustificados);
    methodology = 'Ajustada: Asistentes ÷ (Total Convocados - Justificados) × 100';
  }

  const attendanceRate = denominator > 0 ? (totalAsistieron / denominator) * 100 : 0;

  return {
    totalActivities: activities.length,
    totalCapacitaciones,
    totalConvocados,
    totalAsistieron,
    totalAusentes,
    totalJustificados,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    calculationMethodology: methodology,
  };
}
