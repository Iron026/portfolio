/**
 * Ilustrações locais (SVG) dos imóveis fictícios. Não são fotos de imóveis
 * reais: cada cena é desenhada em código e varia de cor conforme `hue`.
 */
import type { SceneKind } from './imoveis-data';

const PALETTES = [
  { sky: '#d6e6ee', wall: '#f2ede4', trim: '#2f4a3f', accent: '#c9a24a', floor: '#c7a77f', plant: '#7fa58a' },
  { sky: '#dfe5ef', wall: '#e9edf2', trim: '#28344a', accent: '#d8b468', floor: '#b8957a', plant: '#86a98f' },
  { sky: '#dcebe4', wall: '#f5f1ea', trim: '#3b5548', accent: '#b7863c', floor: '#cfae86', plant: '#6f9b7c' },
  { sky: '#e6e3ee', wall: '#efeae3', trim: '#41385a', accent: '#c99a54', floor: '#bf9c80', plant: '#7ea48b' },
  { sky: '#d9e8e2', wall: '#f3eee6', trim: '#244236', accent: '#dcae5b', floor: '#c4a07a', plant: '#6c9877' },
  { sky: '#d3e3ef', wall: '#eef0f2', trim: '#1f3a4d', accent: '#c59a45', floor: '#b39478', plant: '#79a28a' },
];

export function Scene({ kind, hue, className }: { kind: SceneKind; hue: number; className?: string }) {
  const c = PALETTES[hue % PALETTES.length];
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {kind.startsWith('fachada') || kind === 'externa' || kind === 'piscina' ? <Outdoor kind={kind} c={c} /> : <Indoor kind={kind} c={c} />}
    </svg>
  );
}

type Palette = (typeof PALETTES)[number];

function Tree({ x, y, s = 1, c }: { x: number; y: number; s?: number; c: Palette }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="0" width="6" height="26" fill="#8a6a4d" />
      <circle cx="0" cy="-6" r="20" fill={c.plant} />
      <circle cx="-12" cy="4" r="13" fill={c.plant} opacity="0.85" />
      <circle cx="12" cy="2" r="14" fill={c.plant} opacity="0.9" />
    </g>
  );
}

function Outdoor({ kind, c }: { kind: SceneKind; c: Palette }) {
  const ground = <rect y="206" width="400" height="54" fill="#b9cbb1" />;
  const sky = (
    <>
      <rect width="400" height="260" fill={c.sky} />
      <circle cx="330" cy="52" r="22" fill="#fff6dc" />
    </>
  );
  if (kind === 'fachada-predio') {
    return (
      <g>
        {sky}
        {ground}
        <rect x="120" y="34" width="160" height="176" fill={c.wall} />
        <rect x="120" y="34" width="160" height="8" fill={c.trim} />
        {Array.from({ length: 6 }, (_, r) =>
          [0, 1, 2, 3].map((col) => (
            <g key={`${r}-${col}`}>
              <rect x={134 + col * 36} y={52 + r * 24} width="24" height="15" fill={c.trim} opacity="0.85" />
              <rect x={134 + col * 36} y={67 + r * 24} width="24" height="3" fill={c.accent} />
            </g>
          )),
        )}
        <rect x="183" y="186" width="34" height="24" fill={c.trim} />
        <Tree x={78} y={180} c={c} />
        <Tree x={326} y={184} s={0.85} c={c} />
      </g>
    );
  }
  if (kind === 'fachada-comercial') {
    return (
      <g>
        {sky}
        <rect y="206" width="400" height="54" fill="#c9cdd3" />
        <rect x="70" y="70" width="260" height="140" fill={c.wall} />
        <rect x="70" y="62" width="260" height="14" fill={c.trim} />
        <rect x="90" y="96" width="150" height="96" fill="#cfe1ea" stroke={c.trim} strokeWidth="5" />
        <path d="M100 110 L160 170 M130 104 L200 176" stroke="#ffffff" strokeWidth="5" opacity="0.6" />
        <rect x="256" y="112" width="52" height="98" fill={c.trim} />
        <circle cx="298" cy="162" r="3" fill={c.accent} />
        <rect x="104" y="82" width="122" height="10" rx="2" fill={c.accent} />
      </g>
    );
  }
  if (kind === 'piscina') {
    return (
      <g>
        {sky}
        <rect y="150" width="400" height="110" fill="#e9e2d6" />
        <path d="M60 172 H340 L372 244 H28 Z" fill="#5fb4c9" />
        <path d="M90 190 q20 -6 40 0 t40 0 M200 210 q20 -6 40 0 t40 0 M110 226 q20 -6 40 0" stroke="#d9f1f6" strokeWidth="3" fill="none" />
        <rect x="20" y="150" width="360" height="6" fill={c.trim} opacity="0.3" />
        <rect x="300" y="120" width="70" height="30" rx="3" fill={c.accent} />
        <rect x="306" y="98" width="4" height="52" fill={c.trim} />
        <path d="M268 100 h80 l-40 -26 z" fill={c.trim} />
        <Tree x={44} y={128} s={0.9} c={c} />
      </g>
    );
  }
  if (kind === 'externa') {
    return (
      <g>
        {sky}
        <rect y="168" width="400" height="92" fill="#9fbf8f" />
        <rect x="236" y="96" width="132" height="80" fill={c.wall} />
        <path d="M228 98 h148 l-74 -40 z" fill={c.trim} />
        <rect x="258" y="118" width="34" height="58" fill={c.trim} />
        <rect x="312" y="120" width="38" height="26" fill="#cfe1ea" stroke={c.trim} strokeWidth="3" />
        <rect x="60" y="140" width="80" height="36" rx="3" fill="#a8846a" />
        <rect x="72" y="118" width="56" height="24" fill="#8f6f58" />
        <rect x="90" y="96" width="20" height="24" fill="#6e5544" />
        <Tree x={180} y={150} c={c} />
        <path d="M0 214 h400" stroke="#86a877" strokeWidth="4" />
      </g>
    );
  }
  // casas e sobrados
  const tall = kind === 'fachada-sobrado';
  const top = tall ? 64 : 112;
  return (
    <g>
      {sky}
      {ground}
      <rect x="110" y={top} width="180" height={206 - top} fill={c.wall} />
      <path d={`M96 ${top + 2} L200 ${top - 54} L304 ${top + 2} Z`} fill={c.trim} />
      {tall && (
        <>
          <rect x="132" y="84" width="44" height="34" fill="#cfe1ea" stroke={c.trim} strokeWidth="4" />
          <rect x="224" y="84" width="44" height="34" fill="#cfe1ea" stroke={c.trim} strokeWidth="4" />
          <rect x="110" y="128" width="180" height="6" fill={c.accent} />
        </>
      )}
      <rect x="182" y="156" width="36" height="50" fill={c.trim} />
      <circle cx="210" cy="182" r="2.5" fill={c.accent} />
      <rect x="128" y="150" width="40" height="30" fill="#cfe1ea" stroke={c.trim} strokeWidth="4" />
      <rect x="232" y="150" width="40" height="30" fill="#cfe1ea" stroke={c.trim} strokeWidth="4" />
      <rect x="300" y="166" width="72" height="40" fill={c.wall} opacity="0.85" />
      <rect x="306" y="174" width="60" height="32" fill={c.trim} opacity="0.4" />
      <Tree x={62} y={182} c={c} />
    </g>
  );
}

function Indoor({ kind, c }: { kind: SceneKind; c: Palette }) {
  const room = (
    <>
      <rect width="400" height="260" fill={c.wall} />
      <rect y="196" width="400" height="64" fill={c.floor} />
      <rect y="194" width="400" height="4" fill={c.trim} opacity="0.25" />
    </>
  );
  const windowAt = (x: number) => (
    <g>
      <rect x={x} y="40" width="110" height="90" fill={c.sky} stroke="#ffffff" strokeWidth="6" />
      <path d={`M${x + 55} 40 v90 M${x} 85 h110`} stroke="#ffffff" strokeWidth="4" />
    </g>
  );
  if (kind === 'sala') {
    return (
      <g>
        {room}
        {windowAt(250)}
        <rect x="40" y="56" width="70" height="50" fill={c.accent} opacity="0.75" />
        <rect x="48" y="64" width="54" height="34" fill={c.sky} opacity="0.8" />
        <rect x="40" y="150" width="190" height="52" rx="10" fill={c.trim} />
        <rect x="52" y="132" width="166" height="32" rx="10" fill={c.trim} opacity="0.85" />
        <rect x="64" y="140" width="40" height="24" rx="6" fill={c.accent} />
        <rect x="250" y="190" width="90" height="10" rx="3" fill="#8a6a4d" />
        <rect x="262" y="160" width="10" height="34" fill={c.plant} />
        <circle cx="267" cy="152" r="16" fill={c.plant} />
        <ellipse cx="140" cy="226" rx="110" ry="16" fill="#ffffff" opacity="0.35" />
      </g>
    );
  }
  if (kind === 'cozinha') {
    return (
      <g>
        {room}
        {windowAt(146)}
        <rect x="20" y="138" width="360" height="62" fill={c.trim} />
        <rect x="20" y="130" width="360" height="10" fill="#e8e3da" />
        {[40, 120, 280, 330].map((x) => (
          <rect key={x} x={x} y="148" width="40" height="44" fill="#ffffff" opacity="0.12" />
        ))}
        <rect x="20" y="40" width="110" height="56" fill={c.trim} opacity="0.9" />
        <rect x="270" y="40" width="110" height="56" fill={c.trim} opacity="0.9" />
        <circle cx="210" cy="124" r="7" fill={c.accent} />
        <rect x="186" y="118" width="16" height="12" rx="2" fill={c.accent} />
      </g>
    );
  }
  if (kind === 'quarto') {
    return (
      <g>
        {room}
        {windowAt(40)}
        <rect x="200" y="88" width="170" height="70" rx="8" fill={c.trim} />
        <rect x="190" y="150" width="190" height="52" rx="6" fill="#ffffff" />
        <rect x="190" y="168" width="190" height="34" rx="6" fill={c.accent} opacity="0.8" />
        <rect x="210" y="132" width="60" height="22" rx="8" fill="#f7f4ee" />
        <rect x="292" y="132" width="60" height="22" rx="8" fill="#f7f4ee" />
        <rect x="160" y="160" width="26" height="40" fill="#8a6a4d" />
        <rect x="168" y="138" width="10" height="22" fill={c.accent} />
      </g>
    );
  }
  // banheiro
  return (
    <g>
      <rect width="400" height="260" fill="#eef1f2" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${i * 48} 0 v200`} stroke="#d8dee2" strokeWidth="2" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M0 ${i * 48} h400`} stroke="#d8dee2" strokeWidth="2" />
      ))}
      <rect y="200" width="400" height="60" fill="#c9d1d6" />
      <rect x="60" y="130" width="120" height="70" fill={c.trim} />
      <rect x="54" y="122" width="132" height="12" fill="#ffffff" />
      <rect x="84" y="40" width="72" height="70" rx="36" fill={c.sky} stroke={c.accent} strokeWidth="4" />
      <rect x="240" y="50" width="120" height="150" fill="#dbe9ee" stroke="#ffffff" strokeWidth="5" opacity="0.9" />
      <circle cx="330" cy="76" r="10" fill={c.accent} />
    </g>
  );
}
