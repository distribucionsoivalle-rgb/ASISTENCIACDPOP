import * as XLSX from 'xlsx';
import { Activity, DPOCommitment, DistributionCenter, SystemSettings } from '../types';
import { calculateAttendanceMetrics, formatDateColombia } from './formatters';

export function exportActivitiesToExcel(
  activities: Activity[],
  commitments: DPOCommitment[],
  centers: DistributionCenter[],
  settings: SystemSettings,
  fileNamePrefix: string = 'Reporte_Asistencia_DPO_Bavaria'
) {
  const getCenterName = (id: string) => centers.find(c => c.id === id)?.name || id;

  // 1. Resumen de Actividades
  const summaryData = activities.map(act => {
    const total = act.attendees.length;
    const asistieron = act.attendees.filter(a => a.status === 'Asistió').length;
    const ausentes = act.attendees.filter(a => a.status === 'Ausente').length;
    const justificados = act.attendees.filter(a => a.status === 'Justificado').length;

    let denom = total;
    if (settings.excludeJustifiedFromPercentage) {
      denom = Math.max(0, total - justificados);
    }
    const rate = denom > 0 ? Math.round((asistieron / denom) * 1000) / 10 : 0;

    return {
      'Fecha (DD/MM/AAAA)': formatDateColombia(act.date),
      'Hora Programada': act.scheduledStartTime,
      'Hora Real': act.actualStartTime,
      'Centro de Distribución': getCenterName(act.centerId),
      'Tipo de Actividad': act.activityType,
      'Tema Tratado': act.topic,
      'Facilitador': act.facilitator,
      'Total Convocados': total,
      'Asistieron': asistieron,
      'Ausentes': ausentes,
      'Justificados': justificados,
      '% Cumplimiento Asistencia': `${rate}%`,
      'Observaciones Generales': act.generalNotes || '',
      'Registrado Por': act.createdBy,
      'Fecha Registro': act.createdAt ? new Date(act.createdAt).toLocaleString('es-CO') : '',
    };
  });

  // 2. Detalle de Asistentes
  const attendeesData: any[] = [];
  activities.forEach(act => {
    act.attendees.forEach(att => {
      attendeesData.push({
        'Fecha Actividad': formatDateColombia(act.date),
        'Centro de Distribución': getCenterName(act.centerId),
        'Tipo Actividad': act.activityType,
        'Tema Actividad': act.topic,
        'Facilitador': act.facilitator,
        'Identificación / Cédula': att.employeeCode,
        'Nombre del Asistente': att.name,
        'Cargo': att.cargo,
        'Estado de Asistencia': att.status,
        'Hora de Llegada': att.arrivalTime || '-',
        'Observación Individual': att.observations || '',
      });
    });
  });

  // 3. Compromisos DPO
  const commitmentsData = commitments.map(com => ({
    'Tema o Desviación Identificada': com.topic,
    'Acción Correctiva / Compromiso': com.action,
    'Responsable': com.responsible,
    'Centro de Distribución': getCenterName(com.centerId),
    'Fecha Límite (DD/MM/AAAA)': formatDateColombia(com.deadline),
    'Estado': com.status,
    'Evidencia o Comentario de Cierre': com.closureEvidence || '-',
    'Fecha Cierre': com.closedAt ? new Date(com.closedAt).toLocaleDateString('es-CO') : '-',
    'Cerrado Por': com.closedBy || '-',
    'Registrado Por': com.createdBy,
  }));

  // Crear Workbook
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Actividades');

  // Hoja 2: Detalle Asistentes
  const wsAttendees = XLSX.utils.json_to_sheet(attendeesData);
  XLSX.utils.book_append_sheet(wb, wsAttendees, 'Detalle Asistentes');

  // Hoja 3: Compromisos DPO
  const wsCommitments = XLSX.utils.json_to_sheet(commitmentsData);
  XLSX.utils.book_append_sheet(wb, wsCommitments, 'Compromisos DPO');

  // Guardar archivo
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportSingleActivityToExcel(
  activity: Activity,
  centerName: string
) {
  const summary = [
    { Parámetro: 'Empresa', Valor: 'Bavaria & CIA S.C.A. - Control DPO' },
    { Parámetro: 'Centro de Distribución', Valor: centerName },
    { Parámetro: 'Fecha', Valor: formatDateColombia(activity.date) },
    { Parámetro: 'Tipo de Actividad', Valor: activity.activityType },
    { Parámetro: 'Hora Programada', Valor: activity.scheduledStartTime },
    { Parámetro: 'Hora Real Inicio', Valor: activity.actualStartTime },
    { Parámetro: 'Facilitador', Valor: activity.facilitator },
    { Parámetro: 'Tema', Valor: activity.topic },
    { Parámetro: 'Observaciones', Valor: activity.generalNotes || 'Ninguna' },
    { Parámetro: 'Registrado Por', Valor: activity.createdBy },
  ];

  const attendees = activity.attendees.map((att, idx) => ({
    'N°': idx + 1,
    'Identificación / Cédula': att.employeeCode,
    'Nombre Completo': att.name,
    'Cargo': att.cargo,
    'Asistencia': att.status,
    'Hora de Llegada': att.arrivalTime || '-',
    'Observaciones': att.observations || '',
  }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  const wsAttendees = XLSX.utils.json_to_sheet(attendees);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Datos Actividad');
  XLSX.utils.book_append_sheet(wb, wsAttendees, 'Lista de Asistencia');

  const filename = `Asistencia_DPO_${activity.date}_${activity.activityType.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
