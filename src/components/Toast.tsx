/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Portal from './Portal';
import type { Tone } from '../internal/tone';

export type ToastTone = Exclude<Tone, 'accent' | 'purple'>;

export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss; `0` keeps the toast until dismissed. */
  duration?: number;
}

export interface ToastApi {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a ToastProvider');
  return api;
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    if (duration <= 0) return;
    const timer = setTimeout(() => dismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  return (
    <div className={`ui-toast ui-toast--${toast.tone ?? 'info'}`} role="status">
      <div className="ui-toast-content">
        {toast.title && <div className="ui-toast-title">{toast.title}</div>}
        {toast.description && <div className="ui-toast-description">{toast.description}</div>}
      </div>
      <button type="button" className="ui-toast-close" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 4,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${++counter.current}`;
      const limit = Math.max(1, maxToasts);
      setToasts((current) => [...current, { ...options, id }].slice(-limit));
      return id;
    },
    [maxToasts],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <Portal>
        <div
          className={`ui-toast-viewport ui-toast-viewport--${position}`}
          aria-live="polite"
          aria-label="Notifications"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
