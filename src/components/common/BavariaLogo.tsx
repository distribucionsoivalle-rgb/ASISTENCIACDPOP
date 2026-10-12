import React, { useState, useEffect } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { storage } from '../../services/storage';
import { LogoModal } from './LogoModal';

interface BavariaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
  allowEdit?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BavariaLogo: React.FC<BavariaLogoProps> = ({
  className = '',
  variant = 'color',
  showSubtitle = false,
  allowEdit = true,
  size = 'md',
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(storage.getCustomLogo());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setCustomLogo(e.detail ?? storage.getCustomLogo());
      setImgError(false);
    };
    window.addEventListener('bavaria_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('bavaria_logo_updated', handleLogoUpdate);
  }, []);

  const isDarkBg = variant !== 'dark';

  // Fuente del logotipo
  const logoSrc = customLogo || '/bavaria-official.png';

  // Alturas según tamaño
  const heightClass =
    size === 'sm'
      ? 'h-6 sm:h-7'
      : size === 'lg'
      ? 'h-10 sm:h-12'
      : 'h-8 sm:h-9';

  return (
    <>
      <div className={`relative inline-flex items-center gap-2.5 select-none ${className}`}>
        {/* Contenedor del Logo con opción interactiva de personalización */}
        <div
          onClick={() => allowEdit && setIsModalOpen(true)}
          className={`group relative shrink-0 flex items-center justify-center transition-all duration-200 ${
            allowEdit ? 'cursor-pointer hover:scale-[1.02]' : ''
          }`}
          title={
            allowEdit
              ? 'Logotipo Bavaria (Haz clic para personalizar o subir tu imagen)'
              : 'Logotipo Oficial Bavaria Colombia'
          }
        >
          {/* Badge con fondo blanco para contraste óptimo y nitidez corporativa */}
          <div
            className={`relative flex items-center justify-center px-2.5 py-1 rounded-xl transition-all duration-200 ${
              isDarkBg
                ? 'bg-white shadow-sm border border-white/20 hover:shadow-md hover:border-white/40'
                : 'bg-transparent'
            }`}
          >
            {!imgError ? (
              <img
                src={logoSrc}
                alt="Logo Bavaria Colombia"
                onError={() => setImgError(true)}
                className={`${heightClass} w-auto max-w-[170px] object-contain transition-transform duration-200`}
                loading="eager"
              />
            ) : (
              /* Respaldo elegante si la imagen no responde */
              <div className="flex items-center gap-1.5 text-[#EE2722] font-black text-sm tracking-tight px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CDA323] inline-block" />
                <span className="font-serif tracking-widest text-base">BAVARIA</span>
              </div>
            )}

            {/* Indicador sutil de edición al pasar el cursor */}
            {allowEdit && (
              <div
                className="absolute -top-1.5 -right-1.5 bg-[#EE2722] text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 border border-white"
                title="Cambiar o subir imagen de logo"
              >
                <Camera className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>

        {/* Subtítulo institucional opcional */}
        {showSubtitle && (
          <div className="hidden sm:flex flex-col justify-center min-w-0 leading-tight">
            <span
              className={`text-[11px] font-black tracking-wider uppercase truncate ${
                isDarkBg ? 'text-[#CDA323]' : 'text-[#8A6C13]'
              }`}
            >
              LOGÍSTICA & DISTRIBUCIÓN
            </span>
            <span
              className={`text-[10px] font-medium truncate ${
                isDarkBg ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Matinal Diaria DPO
            </span>
          </div>
        )}
      </div>

      {/* Modal interactivo para cambiar o subir el logo */}
      {allowEdit && (
        <LogoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentLogo={customLogo}
          onLogoChanged={(newLogo) => {
            setCustomLogo(newLogo);
            setImgError(false);
          }}
        />
      )}
    </>
  );
};
