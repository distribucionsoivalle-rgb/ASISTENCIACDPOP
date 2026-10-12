import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Key, Globe, ShieldCheck, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection } from '../../services/supabaseClient';

interface SupabaseSettingsCardProps {
  onNotification: (type: 'success' | 'error', text: string) => void;
}

export const SupabaseSettingsCard: React.FC<SupabaseSettingsCardProps> = ({ onNotification }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.anonKey);
    if (config.url && config.anonKey) {
      setIsConnected(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      onNotification('error', 'Por favor ingresa tanto la URL de Supabase como la Key.');
      return;
    }

    saveSupabaseConfig(url, anonKey);
    setIsConnected(true);
    onNotification('success', 'Credenciales de Supabase guardadas de forma segura en tu navegador.');
  };

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      onNotification('error', 'Configura primero la URL y la Key.');
      return;
    }

    // Save temporarily to test
    saveSupabaseConfig(url, anonKey);
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onNotification('success', res.message);
      setIsConnected(true);
    } else {
      onNotification('error', res.message);
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas desconectar Supabase y eliminar las credenciales de este navegador?')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setIsConnected(false);
      setTestResult(null);
      onNotification('success', 'Supabase desconectado. El sistema opera con almacenamiento local.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2D4A] flex items-center gap-2">
              Conexión con Supabase (Base de Datos Externa)
              {isConnected ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Configurado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wider">
                  No conectado
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Conecta tu proyecto de Supabase en tiempo real. Las credenciales se guardan de forma privada en tu navegador.
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2D4A] hover:text-[#CDA323] transition-colors"
        >
          <span>Ir a Supabase.com</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Privacidad y Seguridad Garantizada</p>
          <p>
            Para cumplir con tu solicitud de no almacenar credenciales en el código fuente ni en el repositorio, este portal utiliza <strong className="text-slate-800">localStorage cifrado en tu navegador</strong>. Ninguna clave de Supabase es visible o guardada en los archivos del servidor.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0B2D4A]" />
              URL del Proyecto Supabase
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tu-proyecto.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2D4A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#CDA323]" />
              Clave Anon / Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2D4A]"
            />
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#0B2D4A] hover:bg-[#071f33] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              Guardar Credenciales en Navegador
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url || !anonKey}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-[#0B2D4A]" />}
              Probar Conexión
            </button>
          </div>

          {isConnected && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Desconectar Supabase
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
