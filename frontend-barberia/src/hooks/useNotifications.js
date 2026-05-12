import { useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../context/NotificationContextObject";

/**
 * Devuelve la API de notificaciones disponible en el contexto global.
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
}

/**
 * Lanza una notificacion cuando cambia un mensaje externo evitando duplicados.
 */
export function useNotificationMessage(message, tone = "info", title = "", duration) {
  const { notify } = useNotifications();
  const lastMessageRef = useRef("");

  useEffect(() => {
    const text = String(message || "").trim();
    if (!text) {
      lastMessageRef.current = "";
      return;
    }

    const key = `${tone}:${title}:${text}`;
    if (lastMessageRef.current === key) return;

    lastMessageRef.current = key;
    notify({ message: text, tone, title, duration });
  }, [duration, message, notify, title, tone]);
}
