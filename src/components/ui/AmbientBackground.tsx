import type { CSSProperties } from 'react';
import { useMotionRegion } from '@/hooks/useMotion';
import { cn } from '@/utils/cn';

/**
 * Fundos animados das seções escuras (sempre atrás do conteúdo, aria-hidden).
 *
 * - "hero": duas grades em profundidades diferentes (a de trás anda mais devagar),
 *   brilhos suaves, e em telas largas "pacotes de dados" que percorrem algumas
 *   linhas da grade até um ponto de conexão, que acende quando o pacote chega.
 *   Uma moldura de seleção (assinatura da marca) aparece e some numa área livre.
 * - "process": grade parada e um brilho lento.
 * - "contact": atmosfera diferente: trama de pontos e brilho lavanda.
 *
 * Só transform e opacity. Fora da tela, com a aba em segundo plano ou com as
 * animações pausadas, tudo congela (data-motion-off / html[data-motion="paused"]).
 * Estilos em src/styles/index.css, seção "FUNDO ANIMADO".
 */

/**
 * Coordenadas em células de 64 px contadas a partir do centro da tela (a grade é
 * centralizada como o conteúdo). Tudo fica nas áreas livres do Hero em telas a
 * partir de 1200 px: à direita do título, nas margens e abaixo da coluna de texto.
 */
type Route = { dir: 'h' | 'v'; c: number; r: number; n: number; d: number; t: number; amber?: boolean };
const ROUTES: Route[] = [
  { dir: 'h', c: 5, r: 3, n: 6, d: 0, t: 9 },
  { dir: 'v', c: 11, r: 1, n: 6, d: 3.2, t: 10 },
  { dir: 'v', c: -10, r: 2, n: 8, d: 1.4, t: 12 },
  { dir: 'h', c: -9, r: 13, n: 6, d: 5.6, t: 11, amber: true },
  { dir: 'v', c: 10, r: 8, n: 5, d: 7.1, t: 13, amber: true },
  { dir: 'h', c: 6, r: 6, n: 4, d: 4.4, t: 10 },
];

const NODES: Array<[col: number, row: number, delay: number]> = [
  [9, 2, 0], [-10, 6, 3.1], [-7, 12, 2.1], [-4, 14, 4.8],
];

const px = (n: number) => `${n * 64}px`;

export function AmbientBackground({ variant = 'hero', className }: { variant?: 'hero' | 'process' | 'contact'; className?: string }) {
  const { ref, active } = useMotionRegion<HTMLDivElement>('0px');
  const hero = variant === 'hero';
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-motion-off={active ? undefined : ''}
      className={cn('ambient motion', `ambient--${variant}`, className)}
    >
      <div className="ambient-parallax">
        {variant === 'contact' ? (
          <div className="ambient-dots" />
        ) : (
          <div className="ambient-grid-wrap">
            {hero && <div className="ambient-grid ambient-grid--far" />}
            <div className="ambient-grid">
              {hero &&
                ROUTES.map((rt) => {
                  // ponto de partida e comprimento do trilho
                  const style = {
                    '--x': `calc(50% - 32px + ${px(rt.c)})`,
                    '--y': px(rt.r),
                    '--len': px(rt.n),
                    '--d': `${rt.d}s`,
                    '--t': `${rt.t}s`,
                  } as CSSProperties;
                  const end = rt.dir === 'h' ? [rt.c + rt.n, rt.r] : [rt.c, rt.r + rt.n];
                  return (
                    <span key={`${rt.dir}${rt.c}${rt.r}`}>
                      <span className={cn('ambient-flow', `ambient-flow--${rt.dir}`, rt.amber && 'is-amber')} style={style}>
                        <i />
                      </span>
                      {/* ponto de conexão no fim do trilho: acende quando o pacote chega */}
                      <span
                        className={cn('ambient-port', rt.amber && 'is-amber')}
                        style={{ '--c': end[0], '--r': end[1], '--d': `${rt.d}s`, '--t': `${rt.t}s` } as CSSProperties}
                      />
                    </span>
                  );
                })}
              {hero &&
                NODES.map(([c, r, d]) => (
                  <span key={`${c}-${r}`} className="ambient-node" style={{ '--c': c, '--r': r, '--d': `${d}s` } as CSSProperties} />
                ))}
              {hero && <span className="ambient-frame" />}
            </div>
            {/* Esmaecimento por cima da grade (mais leve que mask-image numa camada em movimento) */}
            <div className="ambient-fade" />
          </div>
        )}
        <div className="ambient-glow ambient-glow--a" />
        {hero && <div className="ambient-glow ambient-glow--b" />}
      </div>
    </div>
  );
}
