import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { NotificationContext } from "./NotificationContextObject";

const DEFAULT_DURATION = {
  success: 5200,
  info: 6500,
  warning: 8000,
  error: 9000,
};

/**
 * Normaliza tonos equivalentes para que el sistema use una escala unica.
 */
function normalizeTone(tone) {
  if (tone === "danger") return "error";
  return tone || "info";
}

/**
 * Renderiza la pila flotante de notificaciones activas.
 */
function NotificationViewport({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-24 z-[80] flex flex-col items-center gap-3 px-md sm:items-end sm:px-lg"
    >
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          tone={notification.tone}
          onClose={() => onDismiss(notification.id)}
          className="pointer-events-auto w-full max-w-[min(28rem,calc(100vw-2rem))] rounded-[1.35rem] border-white/80 bg-[#fffaf2]/96 shadow-[0_26px_70px_-42px_rgba(17,24,39,0.7),0_14px_34px_-28px_rgba(201,151,62,0.45)] backdrop-blur-xl animate-slide-down"
        >
          <div className="min-w-0">
            {notification.title ? (
              <p className="mb-1 text-sm font-extrabold text-primary">{notification.title}</p>
            ) : null}
            <p className="break-words text-sm font-medium leading-relaxed text-neutral-text">
              {notification.message}
            </p>
          </div>
        </Alert>
      ))}
    </div>
  );
}

/**
 * Proveedor global que permite mostrar y cerrar notificaciones desde cualquier pagina.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ message, tone = "info", title = "", duration } = {}) => {
      const text = String(message || "").trim();
      if (!text) return null;

      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const normalizedTone = normalizeTone(tone);
      const nextNotification = {
        id,
        tone: normalizedTone,
        title,
        message: text,
      };

      setNotifications((current) => [...current.slice(-2), nextNotification]);

      const timeout = duration ?? DEFAULT_DURATION[normalizedTone] ?? DEFAULT_DURATION.info;
      if (timeout > 0) {
        const timer = setTimeout(() => dismiss(id), timeout);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}
