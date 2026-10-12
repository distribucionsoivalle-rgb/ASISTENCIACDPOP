import React from 'react';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { Role } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'new-activity'
  | 'history'
  | 'reports'
  | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: Role;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userRole,
  mobileOpen,
  onCloseMobile,
}) => {
  const isReadOnly = userRole === 'consulta';

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Inicio / Dashboard',
      icon: LayoutDashboard,
      badge: null,
      disabled: false,
    },
    {
      id: 'new-activity' as NavTab,
      label: 'Registrar Matinal',
      icon: CalendarPlus,
      badge: isReadOnly ? 'Lectura' : null,
      disabled: false,
    },
    {
      id: 'history' as NavTab,
      label: 'Historial de Matinales',
      icon: History,
      badge: null,
      disabled: false,
    },
    {
      id: 'reports' as NavTab,
      label: 'Reportes y exportaciones',
      icon: FileSpreadsheet,
      badge: null,
      disabled: false,
    },
    {
      id: 'admin' as NavTab,
      label: 'Administración',
      icon: Settings,
      badge: userRole !== 'admin' ? 'Admin' : null,
      disabled: false,
    },
  ];

  const handleItemClick = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-18 z-30 h-[calc(100vh-4.5rem)] w-68 bg-[#0B2D4A] border-r border-[#173F60] text-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-[#CDA323] uppercase tracking-wider">
            Módulos del Sistema
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#CDA323] text-[#0B2D4A] font-bold shadow-md'
                      : 'text-slate-300 hover:bg-[#173F60] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#0B2D4A]'
                          : 'text-slate-300 group-hover:text-[#CDA323]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 tabular-nums ${
                        isActive
                          ? 'bg-[#0B2D4A]/20 text-[#0B2D4A]'
                          : 'bg-[#173F60] text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer lateral con información del pilar DPO */}
        <div className="p-3 border-t border-[#173F60] bg-[#071f33] text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#CDA323]" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">
              PILAR GENTE & DPO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Disciplina Operativa: Asistencia diaria 100% registrada antes de salida a ruta.
          </p>
        </div>
      </aside>
    </>
  );
};
