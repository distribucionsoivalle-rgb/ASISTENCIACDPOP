import React, { useState } from 'react';
import { Shield, ChevronDown, Check, UserCheck, Menu, X, Building2, IdCard, LogOut } from 'lucide-react';
import { BavariaLogo } from '../common/BavariaLogo';
import { DEFAULT_USERS } from '../../services/storage';
import { Role, User, DistributionCenter } from '../../types';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  centers: DistributionCenter[];
  selectedCenterId: string;
  onCenterChange: (centerId: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  centers,
  selectedCenterId,
  onCenterChange,
  mobileMenuOpen,
  onToggleMobileMenu,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador DPO', bg: 'bg-[#CDA323]/20 text-[#CDA323] border-[#CDA323]/40' };
      case 'registrador':
        return { label: 'Responsable de Registro', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'consulta':
        return { label: 'Solo Consulta', bg: 'bg-sky-500/20 text-sky-200 border-sky-400/30' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-[#0B2D4A] border-b border-[#173F60] text-white sticky top-0 z-40 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Izquierda: Menú móvil toggle + Logo Bavaria + Título Oficial */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-md hover:bg-[#173F60] text-slate-200 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <BavariaLogo className="shrink-0" />

          <div className="hidden sm:block h-8 w-px bg-[#173F60]" />

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white uppercase whitespace-nowrap truncate">
              CONTROL DE ASISTENCIA – DPO
            </h1>
            <p className="hidden md:block text-xs text-slate-300 truncate">
              Sistema Operativo de Matinales, Capacitaciones y Seguimiento de Compromisos
            </p>
          </div>
        </div>

        {/* Derecha: Selector de CD + Selector de Rol / Usuario */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Selector de Centro de Distribución activo */}
          <div className="hidden xl:flex items-center gap-2 bg-[#173F60]/70 px-3 py-1.5 rounded-lg border border-[#173F60]">
            <Building2 className="w-4 h-4 text-[#CDA323]" />
            <span className="text-xs text-slate-300">CD Actual:</span>
            <select
              value={selectedCenterId}
              onChange={(e) => onCenterChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="todos" className="bg-[#0B2D4A] text-white">Todos los CD</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0B2D4A] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Menú de Usuario / Cambio de Rol Rápido */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#173F60] hover:bg-[#1e4e76] transition-colors border border-[#1e4e76] text-left"
              title="Cambiar rol o usuario para pruebas de permisos"
            >
              <div className="w-7 h-7 rounded-full bg-[#CDA323] text-[#0B2D4A] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  {badge.label}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Usuario Activo
                  </p>
                  <p className="text-xs font-bold text-[#0B2D4A] truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    <Shield className="w-3 h-3 text-[#CDA323]" />
                    {badge.label}
                  </div>
                </div>

                <div className="py-1">
                  <p className="px-3.5 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cambiar Perfil de Usuario (Demostración de Permisos)
                  </p>
                  {DEFAULT_USERS.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserChange(u);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left flex items-start justify-between gap-2 text-xs transition-colors hover:bg-slate-50 ${
                          isSelected ? 'bg-amber-50/70 text-[#0B2D4A]' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.roleTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#CDA323] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Auditoría DPO: Las acciones registradas se asocian al usuario seleccionado.
                </div>

                <div className="pt-2 px-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 text-left rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-between transition-colors"
                  >
                    <span>Cerrar Sesión Administrativa</span>
                    <LogOut className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón Salir Directo */}
          <button
            onClick={onLogout}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-400/20 text-xs font-semibold transition-colors"
            title="Cerrar sesión y volver a la pantalla pública de asistencia de colaboradores"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
