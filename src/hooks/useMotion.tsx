import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

/**
 * Controle global das animações decorativas do portfólio.
 *
 * - Respeita "reduzir movimento" do sistema: nesse caso tudo começa pausado.
 * - O botão "Pausar animações" (MotionToggle) grava a escolha no navegador.
 * - O estado vai para <html data-motion="on|paused">: o CSS pausa as animações
 *   decorativas e os componentes com JavaScript (prévias em vídeo, ilustrações)
 *   param seus temporizadores.
 *
 * Funcionalidades (formulário, bancada, demonstrações) nunca dependem disto.
 */

const KEY = 'altocode-movimento';

interface MotionState {
  /** true quando as animações decorativas devem ficar paradas. */
  paused: boolean;
  /** Preferência do sistema por menos movimento. */
  reduced: boolean;
  toggle: () => void;
}

const MotionContext = createContext<MotionState>({ paused: false, reduced: false, toggle: () => {} });

function readStored(): 'on' | 'paused' | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'on' || v === 'paused' ? v : null;
  } catch {
    return null;
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [query] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null));
  const [reduced, setReduced] = useState(() => !!query?.matches);
  const [choice, setChoice] = useState<'on' | 'paused' | null>(() => (typeof window !== 'undefined' ? readStored() : null));

  useEffect(() => {
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [query]);

  const paused = choice ? choice === 'paused' : reduced;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = paused ? 'paused' : 'on';
    // Fora do portfólio (demonstrações) o atributo sai e vale só a preferência do sistema
    return () => {
      delete root.dataset.motion;
    };
  }, [paused]);

  const toggle = useCallback(() => {
    const next = paused ? 'on' : 'paused';
    setChoice(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* navegação privada: vale só para esta visita */
    }
  }, [paused]);

  const value = useMemo(() => ({ paused, reduced, toggle }), [paused, reduced, toggle]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);

/** true enquanto o elemento estiver (perto de estar) visível na tela. */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = '120px 0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** true enquanto a aba estiver em primeiro plano. */
export function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

/**
 * Região com animação decorativa: devolve a ref e se ela deve se mover agora
 * (visível na tela, aba em primeiro plano e animações não pausadas).
 * Use `data-motion-off` no elemento para o CSS pausar as animações de dentro.
 */
export function useMotionRegion<T extends Element>(rootMargin?: string) {
  const ref = useRef<T | null>(null);
  const inView = useInView(ref, rootMargin);
  const visible = usePageVisible();
  const { paused } = useMotion();
  return { ref, active: inView && visible && !paused, inView };
}

/** Chama `tick` a cada `ms` enquanto `active` for verdadeiro. */
export function useTicker(active: boolean, ms: number, tick: () => void) {
  const saved = useRef(tick);
  saved.current = tick;
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => saved.current(), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}
