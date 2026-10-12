import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Clipboard,
  Shield,
  Layers,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onLogoChanged: (newLogo: string | null) => void;
}

interface LogoPreset {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  badge: string;
}

const OFFICIAL_PRESETS: LogoPreset[] = [
  {
    id: 'official-modern',
    name: 'Bavaria Oficial (Actual)',
    subtitle: 'Logotipo Corporativo AB InBev con Águila Dorada',
    url: '/bavaria-official.png',
    badge: 'Recomendado',
  },
  {
    id: 'official-crest',
    name: 'Emblema Tradicional (Escudo)',
    subtitle: 'Blasón Clásico con Águila Imperial y Monograma B',
    url: '/bavaria-2022.png',
    badge: 'Histórico',
  },
  {
    id: 'official-abinbev',
    name: 'Bavaria Orgullosamente AB InBev',
    subtitle: 'Versión Horizontal Corporativa Completa',
    url: '/bavaria-abinbev-white.png',
    badge: 'Corporativo',
  },
  {
    id: 'official-vector',
    name: 'Insignia Vectorial Bavaria',
    subtitle: 'Arte Vectorial Limpio de Alta Definición',
    url: '/bavaria-logo.svg',
    badge: 'Vectorial',
  },
];

export const LogoModal: React.FC<LogoModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onLogoChanged,
}) => {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setPreview(currentLogo);
      setError(null);
      setUrlInput('');
      setShowUrlField(false);
    }
  }, [isOpen, currentLogo]);

  // Soporte para pegar imágenes del portapapeles (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG o WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen no debe superar los 8MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
    };
    reader.onerror = () => {
      setError('Error al procesar el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreview(urlInput.trim());
    setUrlInput('');
    setShowUrlField(false);
    setError(null);
  };

  const handleSave = () => {
    storage.setCustomLogo(preview);
    onLogoChanged(preview);
    onClose();
  };

  const handleResetToDefault = () => {
    setPreview(null);
    storage.setCustomLogo(null);
    onLogoChanged(null);
    onClose();
  };

  const activeDisplayLogo = preview || '/bavaria-official.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="bg-[#0B2D4A] px-6 py-4 flex items-center justify-between text-white border-b border-[#173F60] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EE2722] rounded-xl text-white shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Personalizar Logotipo de Bavaria</h3>
              <p className="text-xs text-slate-300">
                Selecciona una versión oficial o sube la imagen exacta de tu archivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Vistas previas en vivo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EE2722]" />
                Previsualización en Vivo del Logotipo
              </span>
              <span className="text-[11px] text-slate-500">
                {preview ? 'Imagen personalizada activa' : 'Logotipo oficial predeterminado'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* En barra oscura (Navbar) */}
              <div className="bg-[#0B2D4A] rounded-xl p-4 border border-[#173F60] text-center flex flex-col items-center justify-center min-h-[110px] shadow-inner">
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                  En barra superior (Fondo oscuro)
                </span>
                <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-white/20 inline-flex items-center justify-center max-w-[200px]">
                  <img
                    src={activeDisplayLogo}
                    alt="Logo preview"
                    className="h-9 w-auto max-w-[170px] object-contain drop-shadow-xs"
                  />
                </div>
              </div>

              {/* En reportes/portal (Fondo claro) */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[110px]">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                  En reportes / portal (Fondo blanco)
                </span>
                <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200 inline-flex items-center justify-center max-w-[200px]">
                  <img
                    src={activeDisplayLogo}
                    alt="Logo preview"
                    className="h-9 w-auto max-w-[170px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Opciones Oficiales Rápidas */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              1. Seleccionar versión oficial de Bavaria
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OFFICIAL_PRESETS.map((preset) => {
                const isSelected = preview === preset.url || (!preview && preset.id === 'official-modern');
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPreview(preset.url);
                      setError(null);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#EE2722] bg-rose-50/50 ring-2 ring-[#EE2722]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-14 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="shrink-0 p-0.5 bg-[#EE2722] text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {preset.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subir imagen personalizada */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. O sube tu imagen personalizada
              </label>
              <button
                type="button"
                onClick={() => setShowUrlField(!showUrlField)}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                {showUrlField ? 'Ocultar URL' : 'Ingresar URL de imagen'}
              </button>
            </div>

            {/* Input oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-[#EE2722] bg-rose-50'
                  : 'border-slate-300 hover:border-[#EE2722] bg-slate-50/70 hover:bg-rose-50/30'
              }`}
            >
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200 text-[#EE2722]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-slate-800">
                  Haz clic para seleccionar tu imagen o arrástrala aquí
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  PNG transparente (recomendado), JPG, SVG o WebP (hasta 8MB)
                </span>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-200/70 text-slate-700 text-[10px] font-semibold rounded-md">
                  💡 También puedes copiar una imagen y presionar Ctrl + V para pegarla aquí
                </span>
              </div>
            </div>

            {/* Campo URL si se despliega */}
            {showUrlField && (
              <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/logo-bavaria.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EE2722]/30 focus:border-[#EE2722]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cargar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pie del modal con acciones */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-slate-600 hover:text-[#EE2722] hover:bg-slate-200/60 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Logo Oficial Predeterminado
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#EE2722] hover:bg-[#D51E28] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar y Aplicar Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
