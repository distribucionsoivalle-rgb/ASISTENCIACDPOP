import React, { useState } from 'react';
import { User } from '../../types';
import { DEFAULT_USERS } from '../../services/storage';
import { BavariaLogo } from '../common/BavariaLogo';
import { Lock, Mail, Key, AlertCircle, X, Shield, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('distribucionsoivalle@gmail.com');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const user = DEFAULT_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      setError('Credenciales inválidas. Verifica el correo institucional.');
      return;
    }

    // Acepta password de prueba o cualquier contraseña de al menos 4 caracteres para facilitar acceso
    if (!password || password.length < 4) {
      setError('Por favor ingresa tu contraseña institucional (mínimo 4 caracteres).');
      return;
    }

    onLoginSuccess(user);
    onClose();
  };

  const handleQuickLoginAs = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Encabezado Corporativo Bavaria */}
        <div className="bg-[#0B2D4A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BavariaLogo className="h-8" allowEdit={false} />
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-[#173F60] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          <div className="text-center pb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#CDA323] mx-auto flex items-center justify-center mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#0B2D4A]">
              Acceso Administrativo DPO
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa tus credenciales para acceder al Dashboard, Historial y Reportes.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@bavaria.co"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B2D4A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0B2D4A] hover:bg-[#173F60] text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Iniciar Sesión Administrativa</span>
              <ArrowRight className="w-4 h-4 text-[#CDA323]" />
            </button>
          </form>

          {/* Accesos Rápidos de Prueba */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Perfiles pre-configurados para demostración:
            </span>
            <div className="space-y-1.5">
              {DEFAULT_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLoginAs(u)}
                  className="w-full p-2 rounded-lg border border-slate-200 hover:border-[#0B2D4A] bg-slate-50 hover:bg-white text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{u.email}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0B2D4A] bg-[#CDA323]/20 px-2 py-0.5 rounded shrink-0">
                    {u.role === 'admin' ? 'Admin' : u.role === 'registrador' ? 'Supervisor' : 'Consulta'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
