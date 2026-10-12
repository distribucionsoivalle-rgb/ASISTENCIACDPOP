import React from 'react';

interface BavariaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

export const BavariaLogo: React.FC<BavariaLogoProps> = ({ className = 'h-9', variant = 'color' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblema Corporativo Bavaria - Corona heráldica y lúpulo de tradición cervecera */}
      <svg
        viewBox="0 0 48 48"
        className="w-9 h-9 shrink-0 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="8" fill="#0B2D4A" />
        <path
          d="M24 8L27.5 15.5L35.5 16.5L30 22.5L31.5 30.5L24 26.5L16.5 30.5L18 22.5L12.5 16.5L20.5 15.5L24 8Z"
          fill="#CDA323"
        />
        <circle cx="24" cy="24" r="5" fill="#0B2D4A" />
        <path
          d="M24 21V27M21 24H27"
          stroke="#CDA323"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="14" y="34" width="20" height="3" rx="1.5" fill="#CDA323" />
      </svg>
      <div className="flex flex-col">
        <span className="font-extrabold tracking-wider text-lg leading-tight text-white font-sans">
          BAVARIA
        </span>
        <span className="text-[10px] tracking-widest text-[#CDA323] uppercase font-semibold">
          DPO LOGÍSTICA & DISTRIBUCIÓN
        </span>
      </div>
    </div>
  );
};
