// OI LOGO COMPONENT
// Outbound Impact logo with customizable size and style

import React from 'react';

export default function OILogo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-sm', spacing: 'gap-2' },
    md: { container: 'w-10 h-10', text: 'text-lg', spacing: 'gap-2' },
    lg: { container: 'w-16 h-16', text: 'text-2xl', spacing: 'gap-3' },
    xl: { container: 'w-24 h-24', text: 'text-4xl', spacing: 'gap-4' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center ${sizeConfig.spacing} ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeConfig.container} bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group`}>
        {/* Animated wave effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* OI Text */}
        <span className={`${sizeConfig.text} font-black text-white relative z-10`}>
          OI
        </span>

        {/* Outbound arrow accent */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-white/30"></div>
      </div>

      {/* Company Name */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-slate-900 leading-none`}>Outbound Impact</span>
        </div>
      )}
    </div>
  );
}

// Alternative logo versions for different use cases
export function OILogoCompact({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <span className={`${sizes[size].split(' ')[2]} font-black text-white relative z-10`}>
        OI
      </span>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-white/30"></div>
    </div>
  );
}

// Icon-only circular version
export function OILogoIcon({ size = 'md', className = '' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-20 h-20', text: 'text-3xl' },
    xl: { container: 'w-32 h-32', text: 'text-5xl' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`${sizeConfig.container} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Hexagonal shape */}
        <path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill="url(#logoGradient)"
          filter="url(#shadow)"
        />

        {/* OI Text */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="white"
          fontSize="36"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          OI
        </text>

        {/* Outbound arrow decoration */}
        <path
          d="M70 75 L80 75 L75 82 Z"
          fill="white"
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
}
