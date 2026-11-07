/**
 * Ilustrações locais (SVG) dos produtos fictícios da Arena Store.
 * Não são fotos de produtos reais nem de marcas existentes.
 */
import type { ReactElement } from 'react';
import type { ArtKind } from './store-data';

export function ProductArt({ kind, color, className, label }: { kind: ArtKind; color: string; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 240 180"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="240" height="180" fill="#eceee8" />
      <ellipse cx="120" cy="150" rx="78" ry="9" fill="#d9dcd3" />
      {ART[kind](color)}
    </svg>
  );
}

const ART: Record<ArtKind, (c: string) => ReactElement> = {
  tenis: (c) => (
    <g>
      <path d="M38 128 C58 128 74 112 84 96 L104 104 C122 112 150 116 186 118 C200 119 208 128 204 140 L38 140 Z" fill={c} />
      <path d="M38 140 H204 V148 H44 Z" fill="#ffffff" stroke="#c9ccc4" />
      <path d="M92 104 l10 -8 M104 108 l10 -8 M116 111 l10 -8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 122 q20 -2 40 4" stroke="#ff6b2c" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  ),
  chuteira: (c) => (
    <g>
      <path d="M40 126 C60 126 74 110 84 96 L104 102 C124 110 152 114 188 116 C202 117 208 126 204 136 L40 136 Z" fill={c} />
      <path d="M40 136 H204 V140 H40 Z" fill="#15191c" />
      {[56, 82, 108, 134, 160, 186].map((x) => (
        <rect key={x} x={x} y="140" width="8" height="8" rx="2" fill="#15191c" />
      ))}
      <path d="M96 102 l9 -7 M108 105 l9 -7" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  camisa: (c) => (
    <g>
      <path d="M86 34 L104 26 C108 36 132 36 136 26 L154 34 L182 58 L166 76 L156 66 L156 146 L84 146 L84 66 L74 76 L58 58 Z" fill={c} />
      <path d="M104 26 C108 36 132 36 136 26" fill="none" stroke="#15191c" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M84 98 H156" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="6" />
    </g>
  ),
  bermuda: (c) => (
    <g>
      <path d="M72 40 H168 L180 140 H128 L120 84 L112 140 H60 Z" fill={c} />
      <rect x="72" y="40" width="96" height="12" fill="#15191c" opacity="0.35" />
      <path d="M116 52 v18 M124 52 v18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M64 128 H110 M130 128 H176" stroke="#ff6b2c" strokeWidth="4" />
    </g>
  ),
  jaqueta: (c) => (
    <g>
      <path d="M92 30 C100 22 140 22 148 30 L174 48 L190 112 L170 116 L160 78 L160 150 L80 150 L80 78 L70 116 L50 112 L66 48 Z" fill={c} />
      <path d="M100 30 C106 46 134 46 140 30" fill="#15191c" opacity="0.25" />
      <path d="M120 40 V150" stroke="#15191c" strokeWidth="3" />
      <rect x="88" y="104" width="22" height="4" rx="2" fill="#15191c" opacity="0.4" />
      <rect x="130" y="104" width="22" height="4" rx="2" fill="#15191c" opacity="0.4" />
    </g>
  ),
  bola: (c) => (
    <g>
      <circle cx="120" cy="88" r="56" fill="#ffffff" stroke={c} strokeWidth="4" />
      <polygon points="120,66 141,81 133,106 107,106 99,81" fill={c} />
      <path d="M120 66 V36 M141 81 L170 70 M133 106 L150 132 M107 106 L90 132 M99 81 L70 70" stroke={c} strokeWidth="3" />
    </g>
  ),
  garrafa: (c) => (
    <g>
      <rect x="104" y="22" width="32" height="16" rx="4" fill="#15191c" />
      <path d="M128 26 q22 0 22 16" stroke="#15191c" strokeWidth="4" fill="none" />
      <rect x="94" y="38" width="52" height="108" rx="16" fill={c} />
      <rect x="94" y="72" width="52" height="22" fill="#ff6b2c" />
      <rect x="104" y="46" width="6" height="88" rx="3" fill="#ffffff" opacity="0.25" />
    </g>
  ),
  mochila: (c) => (
    <g>
      <path d="M96 34 q24 -18 48 0" stroke="#15191c" strokeWidth="6" fill="none" />
      <rect x="74" y="34" width="92" height="114" rx="22" fill={c} />
      <rect x="88" y="92" width="64" height="40" rx="10" fill="#15191c" opacity="0.25" />
      <path d="M88 108 H152" stroke="#ff6b2c" strokeWidth="4" />
      <rect x="112" y="56" width="16" height="6" rx="3" fill="#ffffff" opacity="0.6" />
    </g>
  ),
};
