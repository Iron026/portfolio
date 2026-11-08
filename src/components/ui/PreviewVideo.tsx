import { useUi } from '@/i18n/ui';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { useMotion, usePageVisible } from '@/hooks/useMotion';
import { cn } from '@/utils/cn';

/**
 * Prévias em vídeo dos projetos, com reprodução controlada:
 * - o arquivo só é baixado quando o cartão chega perto da tela (preload="none");
 * - toca no máximo UM vídeo por vez: o mais visível na tela;
 * - para fora da tela, com a aba em segundo plano, com "Pausar animações",
 *   com "reduzir movimento" e quando o navegador pede economia de dados;
 * - a captura estática fica sempre por baixo (é a imagem alternativa).
 * Cada cartão tem um botão para pausar ou reproduzir a sua prévia.
 */

type Entry = { id: number; ratio: number; eligible: boolean; boost: boolean; setElected: (v: boolean) => void };
const entries = new Map<number, Entry>();
let nextId = 1;
let current: number | null = null;

function elect() {
  let best: Entry | null = null;
  // O cartão mais visível "ocupa a vez"; quem a pessoa mandou reproduzir tem prioridade.
  // Se o cartão da vez estiver pausado, nenhum outro começa a tocar no lugar dele.
  const score = (e: Entry) => (e.boost ? 10 : 0) + e.ratio;
  for (const e of entries.values()) {
    if (e.ratio < (e.boost ? 0.15 : 0.45)) continue;
    if (!best || score(e) > score(best)) best = e;
  }
  if (best && !best.eligible) best = null;
  const id = best ? best.id : null;
  if (id === current) return;
  if (current !== null) entries.get(current)?.setElected(false);
  current = id;
  best?.setElected(true);
}

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!c?.saveData;
};

export function usePreviewVideo(src: string | undefined) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const { paused: motionPaused } = useMotion();
  const pageVisible = usePageVisible();
  /** escolha manual neste cartão: null = automático */
  const [manual, setManual] = useState<'play' | 'pause' | null>(null);
  const [elected, setElected] = useState(false);
  const [playing, setPlaying] = useState(false);
  /** as fontes do vídeo só entram no HTML na primeira vez que ele vai tocar */
  const [armed, setArmed] = useState(false);
  const idRef = useRef(0);

  const auto = !motionPaused && !saveData();

  // "Pausar animações" vale também para quem tinha mandado reproduzir uma prévia
  useEffect(() => {
    if (motionPaused) setManual((m) => (m === 'play' ? null : m));
  }, [motionPaused]);
  const eligible = !!src && pageVisible && (manual === 'play' || (manual === null && auto));

  // registro no coordenador (apenas um vídeo toca por vez)
  useEffect(() => {
    if (!src) return;
    const id = nextId++;
    idRef.current = id;
    entries.set(id, { id, ratio: 0, eligible: false, boost: false, setElected });
    return () => {
      entries.delete(id);
      if (current === id) current = null;
      elect();
    };
  }, [src]);

  useEffect(() => {
    const e = entries.get(idRef.current);
    if (!e) return;
    e.eligible = eligible;
    e.boost = manual === 'play';
    elect();
  }, [eligible, manual]);

  // visibilidade: quanto do cartão está na tela
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !src || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const e = entries.get(idRef.current);
        if (e) e.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        elect();
      },
      { threshold: [0, 0.25, 0.45, 0.6, 0.8, 1], rootMargin: '200px 0px 200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  const shouldPlay = elected && eligible;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (shouldPlay) {
      if (!armed) {
        setArmed(true); // renderiza os <source>; o efeito roda de novo em seguida
        return;
      }
      if (v.readyState === 0 && v.networkState === 0) v.load();
      v.play().catch(() => setPlaying(false));
    } else if (!v.paused) {
      v.pause();
    }
  }, [shouldPlay, src, armed]);

  const toggle = useCallback(() => {
    setManual(playing ? 'pause' : 'play');
  }, [playing]);

  return {
    src,
    armed,
    boxRef,
    videoRef,
    playing,
    setPlaying,
    /** o botão mostra "Pausar" enquanto a prévia estiver em reprodução */
    showsPause: playing,
    toggle,
  };
}

/** Camada do vídeo, posicionada sobre a captura (que continua por baixo). */
export function PreviewVideoLayer({ preview, label }: { preview: ReturnType<typeof usePreviewVideo>; label: string }) {
  return (
    <video
      ref={preview.videoRef}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      title={label}
      onPlaying={() => preview.setPlaying(true)}
      onPause={() => preview.setPlaying(false)}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500',
        preview.playing ? 'opacity-100' : 'opacity-0',
      )}
    >
      {preview.armed && preview.src && (
        <>
          <source src={`${preview.src}.webm`} type="video/webm" />
          <source src={`${preview.src}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}

/** Botão de pausar/reproduzir a prévia de um projeto. */
export function PreviewVideoButton({ preview, name, className }: { preview: ReturnType<typeof usePreviewVideo>; name: string; className?: string }): ReactNode {
  const ui = useUi();
  const label = preview.showsPause ? ui.video.pauseFor(name) : ui.video.playFor(name);
  // Nome acessível = texto visível + de qual projeto é a prévia (WCAG 2.5.3)
  return (
    <button
      type="button"
      onClick={preview.toggle}
      title={label}
      data-preview-toggle
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full bg-night/80 px-3 text-[0.8rem] font-medium text-white ring-1 ring-white/20 backdrop-blur transition-[background-color,transform] hover:bg-night active:scale-[0.96]',
        className,
      )}
    >
      {preview.showsPause ? <Pause aria-hidden="true" className="h-3.5 w-3.5 text-tide" /> : <Play aria-hidden="true" className="h-3.5 w-3.5 text-tide" />}
      <span>{preview.showsPause ? ui.video.pause : ui.video.play}</span>
      <span className="sr-only"> {ui.video.previewOf(name)}</span>
    </button>
  );
}
