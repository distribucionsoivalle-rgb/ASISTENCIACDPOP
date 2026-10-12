import React, { useState, useMemo } from 'react';
import {
  Activity,
  DistributionCenter,
  EmployeeRoster,
  SystemSettings,
  User,
} from './types';
import { storage } from './services/storage';

// Componentes
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ActivityFormView } from './components/activity/ActivityFormView';
import { HistoryView } from './components/history/HistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminView } from './components/admin/AdminView';
import { PublicAttendancePortal } from './components/public/PublicAttendancePortal';
import { LoginModal } from './components/auth/LoginModal';
import { PrintTemplate } from './components/common/PrintTemplate';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Estado de Autenticación:
  // Por defecto es FALSE para que los colaboradores vean DIRECTAMENTE la página de auto-registro
  // donde ingresan su cédula, eligen su cargo y la hora se registra automáticamente.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Datos principales
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [centers, setCenters] = useState<DistributionCenter[]>(() => storage.getCenters());
  const [activities, setActivities] = useState<Activity[]>(() => storage.getActivities());
  const [employees, setEmployees] = useState<EmployeeRoster[]>(() => storage.getEmployees());
  const [settings, setSettings] = useState<SystemSettings>(() => storage.getSettings());

  // Navegación administrativa
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Estados de edición e impresión
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToPrint, setActivityToPrint] = useState<Activity | null>(null);

  // Notificación global
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Recargar datos desde storage
  const refreshAllData = () => {
    setActivities(storage.getActivities());
    setEmployees(storage.getEmployees());
    setCenters(storage.getCenters());
    setSettings(storage.getSettings());
  };

  // Filtrado de actividades según el Centro seleccionado en la barra superior (si no es 'todos')
  const displayedActivities = useMemo(() => {
    if (selectedCenterId === 'todos') return activities;
    return activities.filter((a) => a.centerId === selectedCenterId);
  }, [activities, selectedCenterId]);

  // Manejo de guardado de matinal desde panel administrativo
  const handleSaveActivitySuccess = (savedActivity: Activity) => {
    const res = storage.saveActivity(savedActivity);
    if (res.success) {
      refreshAllData();
      showToast('success', 'Matinal y lista de asistencias guardadas exitosamente.');
      setActivityToEdit(null);
      setCurrentTab('history');
    } else {
      showToast('error', res.message);
    }
  };

  // Manejo de edición
  const handleEditActivity = (activity: Activity) => {
    setActivityToEdit(activity);
    setCurrentTab('new-activity');
  };

  // Manejo de eliminación
  const handleDeleteActivity = (id: string) => {
    storage.deleteActivity(id);
    refreshAllData();
    showToast('success', 'Matinal eliminada correctamente.');
  };

  // Cambio de usuario / rol
  const handleUserChange = (newUser: User) => {
    storage.setCurrentUser(newUser);
    setCurrentUser(newUser);
    showToast('success', `Perfil cambiado a: ${newUser.name} (${newUser.roleTitle})`);
  };

  // Manejo de inicio de sesión exitoso
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
    showToast('success', `Sesión iniciada como: ${user.name} (${user.roleTitle})`);
  };

  // Manejo de cierre de sesión: regresa a la pantalla de auto-registro del colaborador
  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('success', 'Sesión cerrada. Regresando a la pantalla de auto-registro de colaboradores.');
  };

  // =========================================================================
  // VISTA 1 (PÁGINA PÚBLICA / POR DEFECTO): Auto-registro de Colaboradores
  // Cédula, Cargo y Hora registrada automáticamente en tiempo real.
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <>
        {/* Toast Flotante */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Portal de Auto-registro para Colaboradores */}
        <PublicAttendancePortal
          centers={centers}
          employees={employees}
          activities={activities}
          onAttendanceRegistered={() => {
            refreshAllData();
            showToast('success', '¡Asistencia a la matinal registrada exitosamente!');
          }}
          onOpenLogin={() => setLoginModalOpen(true)}
        />

        {/* Modal de Inicio de Sesión Administrativo */}
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // =========================================================================
  // VISTA 2: Consola Administrativa (Solo visible tras iniciar sesión)
  // El administrador NO puede entrar a la vista de auto-registro aquí.
  // Solo con el botón "Cerrar Sesión" regresa al portal de colaboradores.
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F3F5F7] flex flex-col font-sans">
      {/* Encabezado Superior Bavaria con Cierre de Sesión */}
      <Navbar
        currentUser={currentUser}
        onUserChange={handleUserChange}
        centers={centers}
        selectedCenterId={selectedCenterId}
        onCenterChange={setSelectedCenterId}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onLogout={handleLogout}
      />

      {/* Toast Flotante */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Cuerpo Principal con Sidebar y Área de Contenido */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab === 'new-activity') setActivityToEdit(null);
            setCurrentTab(tab);
          }}
          userRole={currentUser.role}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Viewport Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              activities={displayedActivities}
              centers={centers}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                storage.saveSettings(newSettings);
                setSettings(newSettings);
              }}
              onNavigateToNewActivity={() => {
                setActivityToEdit(null);
                setCurrentTab('new-activity');
              }}
              onViewActivityDetail={() => {
                setActivityToEdit(null);
                setCurrentTab('history');
              }}
            />
          )}

          {currentTab === 'new-activity' && (
            <ActivityFormView
              activityToEdit={activityToEdit}
              currentUser={currentUser}
              centers={centers}
              employees={employees}
              onSaveSuccess={handleSaveActivitySuccess}
              onCancel={() => {
                setActivityToEdit(null);
                setCurrentTab('history');
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              activities={displayedActivities}
              centers={centers}
              currentUser={currentUser}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
              onNavigateToNew={() => {
                setActivityToEdit(null);
                setCurrentTab('new-activity');
              }}
              onPrintActivity={(act) => setActivityToPrint(act)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              activities={displayedActivities}
              commitments={[]}
              centers={centers}
              settings={settings}
              currentUser={currentUser}
              onPrintActivity={(act) => setActivityToPrint(act)}
            />
          )}

          {currentTab === 'admin' && (
            <AdminView
              currentUser={currentUser}
              centers={centers}
              employees={employees}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                storage.saveSettings(newSettings);
                setSettings(newSettings);
              }}
              onRefreshData={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Modal / Vista de Impresión Oficial DPO */}
      {activityToPrint && (
        <PrintTemplate
          activity={activityToPrint}
          centers={centers}
          settings={settings}
          onClose={() => setActivityToPrint(null)}
        />
      )}
    </div>
  );
}
