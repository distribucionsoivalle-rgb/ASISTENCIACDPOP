import React, { useState } from 'react';
import {
  DistributionCenter,
  EmployeeRoster,
  SystemSettings,
  User,
  Cargo,
} from '../../types';
import { storage } from '../../services/storage';
import {
  Settings,
  Users,
  Building,
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Shield,
  HelpCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { LogoModal } from '../common/LogoModal';
import { BavariaLogo } from '../common/BavariaLogo';
import { SupabaseSettingsCard } from './SupabaseSettingsCard';

interface AdminViewProps {
  currentUser: User;
  centers: DistributionCenter[];
  employees: EmployeeRoster[];
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  centers,
  employees,
  settings,
  onUpdateSettings,
  onRefreshData,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Tabs de administración
  const [activeTab, setActiveTab] = useState<'employees' | 'settings' | 'backup'>('employees');

  // Estado formulario Empleado
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeRoster | null>(null);
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [empCargo, setEmpCargo] = useState<Cargo>('Conductor');
  const [empCenterId, setEmpCenterId] = useState(centers[0]?.id || '');
  const [empPhone, setEmpPhone] = useState('');
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  // Notificaciones
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Guardar empleado
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('error', 'Solo el Administrador tiene permisos para modificar la nómina.');
      return;
    }

    const employeeData: EmployeeRoster = {
      id: editingEmp ? editingEmp.id : `emp-${Date.now()}`,
      employeeCode: empCode.trim(),
      name: empName.trim(),
      cargo: empCargo,
      centerId: empCenterId,
      active: true,
      phone: empPhone.trim() || undefined,
    };

    const res = storage.saveEmployee(employeeData);
    if (res.success) {
      showNotification('success', res.message);
      setEmpModalOpen(false);
      onRefreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleEditEmployee = (emp: EmployeeRoster) => {
    setEditingEmp(emp);
    setEmpCode(emp.employeeCode);
    setEmpName(emp.name);
    setEmpCargo(emp.cargo);
    setEmpCenterId(emp.centerId);
    setEmpPhone(emp.phone || '');
    setEmpModalOpen(true);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`¿Deseas eliminar al colaborador ${name} del maestro de tripulaciones?`)) {
      storage.deleteEmployee(id);
      showNotification('success', 'Colaborador eliminado del sistema.');
      onRefreshData();
    }
  };

  // Guardar configuración de metodología
  const handleToggleExcludeJustified = (exclude: boolean) => {
    if (!isAdmin) return;
    const newSettings = { ...settings, excludeJustifiedFromPercentage: exclude };
    storage.saveSettings(newSettings);
    onUpdateSettings(newSettings);
    showNotification('success', 'Metodología de asistencia actualizada.');
  };

  // Respaldo
  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_DPO_Bavaria_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Archivo de respaldo JSON exportado con éxito.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storage.importBackupJson(content);
        if (res.success) {
          showNotification('success', res.message);
          onRefreshData();
        } else {
          showNotification('error', res.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (window.confirm('¿Deseas restaurar los datos de demostración de Bavaria CD? Se recuperarán los registros iniciales de matinales, compromisos y tripulaciones.')) {
      storage.resetToDemoData();
      onRefreshData();
      showNotification('success', 'Datos restablecidos con el catálogo operativo oficial.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
              ADMINISTRACIÓN DEL SISTEMA
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria DPO</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2D4A]">
            Configuración y Gestión de Recursos
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Gestión de tripulaciones, metodología de cálculo DPO y respaldos de la base de datos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#CDA323]" />
            Rol: {currentUser.roleTitle}
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Acceso Restringido:</strong> Estás navegando con el rol de <em>{currentUser.roleTitle}</em>. Algunas funciones de edición y borrado están reservadas exclusivamente para el Administrador DPO. Puedes cambiar tu rol en el menú superior para probar los permisos completos.
          </span>
        </div>
      )}

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          {notification.text}
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'bg-[#0B2D4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Maestro de Tripulación y Colaboradores ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[#0B2D4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Parámetros DPO y Metodología
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-[#0B2D4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Base de Datos y Respaldos
        </button>
      </div>

      {/* PESTAÑA 1: Maestro de Colaboradores */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2D4A]">
                Nómina Oficial para Matinales
              </h3>
              <p className="text-xs text-slate-500">
                Conductores, Responsables de Ruta (RR) y Auxiliares para carga rápida en formularios.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingEmp(null);
                  setEmpCode('');
                  setEmpName('');
                  setEmpCargo('Conductor');
                  setEmpCenterId(centers[0]?.id || '');
                  setEmpPhone('');
                  setEmpModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Registrar Colaborador
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Cédula / Código</th>
                  <th className="py-2.5 px-3">Nombre Completo</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Centro de Distribución</th>
                  <th className="py-2.5 px-3">Teléfono</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const centerName = centers.find((c) => c.id === emp.centerId)?.name || emp.centerId;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {emp.employeeCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {emp.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {emp.cargo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{centerName}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{emp.phone || '-'}</td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditEmployee(emp)}
                              className="p-1 rounded text-slate-500 hover:text-[#0B2D4A] hover:bg-slate-100 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: Configuración y Metodología */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#0B2D4A] mb-1">
              Directriz y Metodología de Cálculo de Asistencia
            </h3>
            <p className="text-xs text-slate-500">
              Regulación del indicador del pilar DPO Gente y Distribución.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900">
                  Fórmula Oficial de Cálculo
                </h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Porcentaje de asistencia</strong> = Asistentes ÷ Total de personas convocadas × 100.
                </p>
                <p className="text-slate-500 mt-1">
                  Por norma general de auditoría DPO, los colaboradores con ausencia justificada (incapacidades, permisos) forman parte del universo de convocados, a menos que se configure explícitamente su exclusión.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800">
                  ¿Excluir ausencias justificadas del denominador?
                </span>
                <p className="text-[11px] text-slate-500">
                  {settings.excludeJustifiedFromPercentage
                    ? 'Activo: Base = Total Convocados - Justificados'
                    : 'Inactivo: Base = Total Convocados (Estándar DPO Oficial)'}
                </p>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleExcludeJustified(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      !settings.excludeJustifiedFromPercentage
                        ? 'bg-[#0B2D4A] text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Incluir en Denominador (Oficial)
                  </button>
                  <button
                    onClick={() => handleToggleExcludeJustified(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      settings.excludeJustifiedFromPercentage
                        ? 'bg-[#CDA323] text-[#0B2D4A]'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Excluir Justificadas
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  Configurable solo por Administrador
                </span>
              )}
            </div>
          </div>

          {/* Información corporativa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Razón Social de la Operación
              </label>
              <input
                type="text"
                disabled
                value={settings.companyName}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Área Responsable
              </label>
              <input
                type="text"
                disabled
                value={settings.departmentName}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Identidad de Marca y Logo Bavaria */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <BavariaLogo showSubtitle={false} allowEdit={false} variant="dark" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B2D4A] text-sm flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#EE2722]" />
                    Logotipo Oficial Bavaria
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cambia la imagen del logo cargando tu archivo (PNG, JPG, SVG) o usando el logo oficial vectorial.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLogoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EE2722] hover:bg-[#D51E28] text-white font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Cambiar / Subir Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: Base de Datos y Respaldos */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <SupabaseSettingsCard onNotification={showNotification} />

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-bold text-[#0B2D4A] mb-1">
                Persistencia y Copias de Seguridad
              </h3>
              <p className="text-slate-500">
                Exporta los registros completos para salvaguarda de auditoría o restaura un respaldo en cualquier momento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Exportar JSON */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#0B2D4A] mb-1 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#CDA323]" />
                  Descargar Copia de Seguridad
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Guarda un archivo JSON con todas las actividades, asistentes, compromisos y colaboradores.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                className="mt-4 w-full py-2 bg-[#0B2D4A] hover:bg-[#173F60] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Exportar Respaldo JSON
              </button>
            </div>

            {/* Importar JSON */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#0B2D4A] mb-1 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Restaurar desde Archivo
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Carga un respaldo previamente exportado para recuperar datos en este navegador o dispositivo.
                </p>
              </div>

              <div className="mt-4">
                <label className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Seleccionar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Restaurar Demo */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-[#CDA323]" />
                  Cargar Datos de Demostración
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Restablece el catálogo con 5 actividades reales, 15 colaboradores y compromisos DPO iniciales.
                </p>
              </div>

              <button
                onClick={handleResetDemoData}
                className="mt-4 w-full py-2 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Restaurar Catálogo Demo
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal Crear / Editar Colaborador */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-[#0B2D4A] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingEmp ? 'Editar Colaborador' : 'Registrar Colaborador en Nómina'}
              </h3>
              <button
                onClick={() => setEmpModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cédula / Identificación / Código SAP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  placeholder="Ej: 1144023941"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Nombre y Apellidos"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cargo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empCargo}
                    onChange={(e) => setEmpCargo(e.target.value as Cargo)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                  >
                    <option value="Conductor">Conductor</option>
                    <option value="Responsable de Ruta (RR)">Responsable de Ruta (RR)</option>
                    <option value="Auxiliar de reparto">Auxiliar de reparto</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Centro (CD) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empCenterId}
                    onChange={(e) => setEmpCenterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teléfono / Celular (Opcional)
                </label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="Ej: 3104529811"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#CDA323] hover:bg-[#b8911d] font-bold text-[#0B2D4A]"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Personalizar / Cargar Logo */}
      <LogoModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        currentLogo={storage.getCustomLogo()}
        onLogoChanged={() => onRefreshData()}
      />
    </div>
  );
};
