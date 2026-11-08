/**
 * Estado do carrinho da Arena Store, compartilhado por todas as telas da loja.
 * Persiste apenas no localStorage deste navegador. Ao carregar, os dados
 * salvos passam por `restoreCart`, que descarta o que for inválido.
 */
import { useLocale } from '@/i18n/useLocale';
import { restoreNotice } from './store-i18n';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  STORAGE_KEY, addToCart, removeLine, restoreCart, serializeCart, setLineQty,
  type AddResult, type CartLine,
} from './store-data';

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // armazenamento bloqueado (navegação privada etc.)
  }
}
function writeStorage(value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}


interface CartContextValue {
  lines: CartLine[];
  add: (productId: string, size: string | null, qty: number) => AddResult;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  notice: string;
  dismissNotice: () => void;
  storageAvailable: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const initial = useRef<ReturnType<typeof restoreCart> | null>(null);
  if (initial.current === null) initial.current = restoreCart(readStorage());
  const [lines, setLines] = useState<CartLine[]>(initial.current.lines);
  // O aviso é montado no idioma da página (e muda junto se a pessoa trocar o idioma)
  const { locale } = useLocale();
  const [showNotice, setShowNotice] = useState(true);
  const notice = showNotice ? restoreNotice(initial.current, locale) : '';
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Salva a cada mudança (somente produto, tamanho e quantidade).
  useEffect(() => {
    setStorageAvailable(writeStorage(lines.length ? serializeCart(lines) : null));
  }, [lines]);

  // Mantém abas abertas da loja sincronizadas.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setLines(restoreCart(e.newValue).lines);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Referência ao estado mais recente: `add` calcula na hora e devolve o resultado
  // (quantas unidades entraram) para a tela de produto mostrar a mensagem certa.
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const add = useCallback((productId: string, size: string | null, qty: number) => {
    const result = addToCart(linesRef.current, productId, size, qty);
    if (result.added > 0) {
      linesRef.current = result.lines;
      setLines(result.lines);
    }
    return result;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      setQty: (key, qty) => setLines((c) => setLineQty(c, key, qty)),
      remove: (key) => setLines((c) => removeLine(c, key)),
      clear: () => setLines([]),
      notice,
      dismissNotice: () => setShowNotice(false),
      storageAvailable,
    }),
    [lines, add, notice, storageAvailable],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
