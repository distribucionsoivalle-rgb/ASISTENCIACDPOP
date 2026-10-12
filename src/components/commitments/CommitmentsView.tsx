import React, { useState, useMemo } from 'react';
import { DPOCommitment, DistributionCenter, User, CommitmentStatus } from '../../types';
import { formatDateColombia, getTodayDateString, isOverdue } from '../../utils/formatters';
import {
  ClipboardList,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Search,
  Filter,
  Check,
  Edit,
  Trash2,
  X,
  FileCheck,
  Building,
} from 'lucide-react';

interface CommitmentsViewProps {
  commitments: DPOCommitment[];
  centers: DistributionCenter[];
  currentUser: User;
  onSaveCommitment: (commitment: DPOCommitment) => void;
  onDeleteCommitment: (id: string) => void;
}

export const CommitmentsView: React.FC<CommitmentsViewProps> = ({
  commitments,
  centers,
  currentUser,
  onSaveCommitment,
  onDeleteCommitment,
}) => {
  const isReadOnly = currentUser.role === 'consulta';
  const today = getTodayDateString();

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [centerFilter, setCenterFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCommitment, setEditingCommitment] = useState<DPOCommitment | null>(null);

  // Form State
  const [topic, setTopic] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [centerId, setCenterId] = useState<string>(currentUser.centerId || centers[0]?.id || '');
  const [deadline, setDeadline] = useState<string>(today);
  const [status, setStatus] = useState<CommitmentStatus>('Pendiente');
  const [closureEvidence, setClosureEvidence] = useState<string>('');

  // Modal Cierre Rápido
  const [closingModalOpen, setClosingModalOpen] = useState<boolean>(false);
  const [commitmentToClose, setCommitmentToClose] = useState<DPOCommitment | null>(null);
  const [evidenceInput, setEvidenceInput] = useState<string>('');

  // Contadores
  const stats = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let closed = 0;
    let overdue = 0;

    commitments.forEach((c) => {
      if (c.status === 'Cerrado') {
        closed++;
      } else {
        if (isOverdue(c.deadline, c.status)) {
          overdue++;
        }
        if (c.status === 'Pendiente') pending++;
        if (c.status === 'En proceso') inProgress++;
      }
    });

    return { total: commitments.length, pending, inProgress, closed, overdue };
  }, [commitments]);

  // Filtrado
  const filteredCommitments = useMemo(() => {
    return commitments.filter((c) => {
      if (centerFilter !== 'todos' && c.centerId !== centerFilter) return false;

      if (statusFilter === 'vencidos') {
        if (!isOverdue(c.deadline, c.status)) return false;
      } else if (statusFilter !== 'todos') {
        if (c.status !== statusFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = c.topic.toLowerCase().includes(q);
        const matchesAction = c.action.toLowerCase().includes(q);
        const matchesResponsible = c.responsible.toLowerCase().includes(q);
        if (!matchesTopic && !matchesAction && !matchesResponsible) return false;
      }

      return true;
    });
  }, [commitments, centerFilter, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingCommitment(null);
    setTopic('');
    setAction('');
    setResponsible('');
    setCenterId(currentUser.centerId || centers[0]?.id || '');
    setDeadline(today);
    setStatus('Pendiente');
    setClosureEvidence('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: DPOCommitment) => {
    setEditingCommitment(c);
    setTopic(c.topic);
    setAction(c.action);
    setResponsible(c.responsible);
    setCenterId(c.centerId);
    setDeadline(c.deadline);
    setStatus(c.status);
    setClosureEvidence(c.closureEvidence || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const data: DPOCommitment = {
      id: editingCommitment ? editingCommitment.id : `com-${Date.now()}`,
      activityId: editingCommitment?.activityId,
      topic: topic.trim(),
      action: action.trim(),
      responsible: responsible.trim(),
      centerId,
      deadline,
      status,
      closureEvidence: status === 'Cerrado' ? closureEvidence.trim() : undefined,
      closedAt: status === 'Cerrado' ? editingCommitment?.closedAt || new Date().toISOString() : undefined,
      closedBy: status === 'Cerrado' ? editingCommitment?.closedBy || currentUser.name : undefined,
      createdAt: editingCommitment ? editingCommitment.createdAt : new Date().toISOString(),
      createdBy: editingCommitment ? editingCommitment.createdBy : currentUser.name,
      updatedAt: editingCommitment ? new Date().toISOString() : undefined,
      updatedBy: editingCommitment ? currentUser.name : undefined,
    };

    onSaveCommitment(data);
    setModalOpen(false);
  };

  const handleOpenCloseModal = (c: DPOCommitment) => {
    setCommitmentToClose(c);
    setEvidenceInput('');
    setClosingModalOpen(true);
  };

  const handleConfirmClose = () => {
    if (!commitmentToClose || isReadOnly) return;
    if (!evidenceInput.trim()) {
      alert('Por favor describe la evidencia o acción de cierre para trazabilidad DPO.');
      return;
    }

    const updated: DPOCommitment = {
      ...commitmentToClose,
      status: 'Cerrado',
      closureEvidence: evidenceInput.trim(),
      closedAt: new Date().toISOString(),
      closedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    };

    onSaveCommitment(updated);
    setClosingModalOpen(false);
    setCommitmentToClose(null);
  };

  const handleDelete = (id: string) => {
    if (currentUser.role !== 'admin') {
      alert('Solo los administradores pueden eliminar compromisos.');
      return;
    }
    if (window.confirm('¿Seguro que deseas eliminar este compromiso DPO?')) {
      onDeleteCommitment(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CDA323] tracking-wider uppercase">
              GESTIÓN OPERATIVA DPO
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Bavaria Logística</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2D4A]">
            Seguimiento de Compromisos y Planes de Acción
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Control de desviaciones identificadas en matinales, responsables, plazos y evidencias de cierre.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#CDA323] hover:bg-[#b8911d] text-[#0B2D4A] font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Compromiso
          </button>
        )}
      </div>

      {/* Tarjetas Superiores de Estado */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Total */}
        <div
          onClick={() => setStatusFilter('todos')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'todos' ? 'bg-[#0B2D4A] text-white border-[#0B2D4A]' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase ${statusFilter === 'todos' ? 'text-[#CDA323]' : 'text-slate-500'}`}>
            Total
          </span>
          <span className="text-2xl font-extrabold tabular-nums">{stats.total}</span>
        </div>

        {/* Pendientes */}
        <div
          onClick={() => setStatusFilter('Pendiente')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Pendiente' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase ${statusFilter === 'Pendiente' ? 'text-amber-100' : 'text-amber-700'}`}>
            Pendientes
          </span>
          <span className="text-2xl font-extrabold tabular-nums">{stats.pending}</span>
        </div>

        {/* En proceso */}
        <div
          onClick={() => setStatusFilter('En proceso')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'En proceso' ? 'bg-sky-700 text-white border-sky-700' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase ${statusFilter === 'En proceso' ? 'text-sky-100' : 'text-sky-700'}`}>
            En Proceso
          </span>
          <span className="text-2xl font-extrabold tabular-nums">{stats.inProgress}</span>
        </div>

        {/* Cerrados */}
        <div
          onClick={() => setStatusFilter('Cerrado')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Cerrado' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase ${statusFilter === 'Cerrado' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Cerrados
          </span>
          <span className="text-2xl font-extrabold tabular-nums">{stats.closed}</span>
        </div>

        {/* Vencidos */}
        <div
          onClick={() => setStatusFilter('vencidos')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'vencidos' ? 'bg-rose-700 text-white border-rose-700' : 'bg-rose-50 border-rose-200 hover:bg-rose-100/70 text-rose-900'
          }`}
        >
          <span className={`block text-[11px] font-bold uppercase flex items-center gap-1 ${statusFilter === 'vencidos' ? 'text-white' : 'text-rose-700'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Vencidos
          </span>
          <span className="text-2xl font-extrabold tabular-nums">{stats.overdue}</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por desviación, acción o responsable..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0B2D4A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium">CD:</span>
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          >
            <option value="todos">Todos los Centros</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Compromisos */}
      <div className="space-y-3">
        {filteredCommitments.map((com) => {
          const overdue = isOverdue(com.deadline, com.status);
          const centerName = centers.find((c) => c.id === com.centerId)?.name || com.centerId;

          return (
            <div
              key={com.id}
              className={`p-4 rounded-xl border transition-all ${
                com.status === 'Cerrado'
                  ? 'bg-white border-slate-200 opacity-80'
                  : overdue
                  ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Badges de Estado y Vencimiento */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        com.status === 'Cerrado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : com.status === 'En proceso'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {com.status}
                    </span>

                    {overdue && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Compromiso Vencido
                      </span>
                    )}

                    <span className="text-slate-500 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {centerName}
                    </span>
                  </div>

                  {/* Desviación y Acción */}
                  <h4 className="text-sm font-bold text-[#0B2D4A]">
                    {com.topic}
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Acción Correctiva:</strong> {com.action}
                  </p>

                  {/* Evidencia de Cierre si existe */}
                  {com.status === 'Cerrado' && com.closureEvidence && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>Evidencia de Cierre:</strong> {com.closureEvidence}
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        Cerrado por: {com.closedBy || 'Supervisor'} · {com.closedAt ? new Date(com.closedAt).toLocaleDateString('es-CO') : ''}
                      </div>
                    </div>
                  )}

                  {/* Metadata de Responsable y Plazo */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Responsable: <strong className="text-slate-800">{com.responsible}</strong></span>
                    <span>Fecha límite: <strong className={`tabular-nums ${overdue ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>{formatDateColombia(com.deadline)}</strong></span>
                    <span>Registrado por: {com.createdBy}</span>
                  </div>
                </div>

                {/* Acciones del Compromiso */}
                {!isReadOnly && (
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    {com.status !== 'Cerrado' && (
                      <button
                        onClick={() => handleOpenCloseModal(com)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Cerrar con Evidencia
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(com)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B2D4A] hover:bg-slate-100 transition-colors"
                      title="Editar compromiso"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(com.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar compromiso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredCommitments.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No hay compromisos DPO que coincidan con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-[#0B2D4A] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCommitment ? 'Editar Compromiso DPO' : 'Nuevo Compromiso DPO'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Centro de Distribución <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tema o Desviación Identificada <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Falla en amarre de carga camión T-14"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Acción Correctiva o Compromiso <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Ej: Inspección con supervisor de patio y calibración de trinquetes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Responsable <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Nombre o cargo"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha Límite <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estado Actual
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CommitmentStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              {status === 'Cerrado' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Evidencia o Comentario de Cierre <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={closureEvidence}
                    onChange={(e) => setClosureEvidence(e.target.value)}
                    placeholder="Describe la evidencia, fecha y verificación realizada..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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

      {/* Modal de Cierre Rápido con Evidencia */}
      {closingModalOpen && commitmentToClose && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-[#0B2D4A] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#CDA323]" />
                Cierre de Compromiso DPO
              </h3>
              <button
                onClick={() => setClosingModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-slate-500 font-medium">Compromiso a cerrar:</p>
                <p className="font-bold text-[#0B2D4A] mt-0.5">{commitmentToClose.topic}</p>
                <p className="text-[11px] text-slate-600 mt-1">Responsable: {commitmentToClose.responsible}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Evidencia o Comentario de Cierre <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder="Ej: Se realizó reinspección en patio el 12/10 con 100% de cumplimiento. Acta de SST N° 204 archivada..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirmar Cierre DPO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
