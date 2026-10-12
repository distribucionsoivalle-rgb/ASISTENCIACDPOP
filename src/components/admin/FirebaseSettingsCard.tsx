import React, { useState } from 'react';
import { Database, CheckCircle2, ShieldCheck, Globe, Key } from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

interface FirebaseSettingsCardProps {
  onNotification: (type: 'success' | 'error', text: string) => void;
}

export const FirebaseSettingsCard: React.FC<FirebaseSettingsCardProps> = ({ onNotification }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
    setCopied(true);
    onNotification('success', 'Configuración de Firebase copiada al portapapeles.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2D4A] flex items-center gap-2">
              Base de Datos Firebase Firestore (Activa)
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Conectado
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              El sistema está conectado al proyecto de Firebase Firestore en tiempo real.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyConfig}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Key className="w-4 h-4 text-[#0B2D4A]" />}
          <span>{copied ? '¡Copiado!' : 'Ver Configuración'}</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-950">Conexión Segura con Firebase</p>
          <p>
            Tu aplicación está vinculada al proyecto <strong className="font-mono">{firebaseConfig.projectId}</strong> en la región <strong className="font-mono">us-west1</strong>. Todos los registros diarios de asistencia, compromisos y colaboradores se guardan de forma segura e instantánea en la base de datos en la nube.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#0B2D4A]" />
            Project ID
          </label>
          <input
            type="text"
            disabled
            value={firebaseConfig.projectId}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-700"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-bold text-slate-700 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#CDA323]" />
            Database ID
          </label>
          <input
            type="text"
            disabled
            value={firebaseConfig.firestoreDatabaseId || '(default)'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};
