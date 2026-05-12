package org.vedruna.barberia.modules.notifications.entity;

/**
 * Tipos funcionales de notificacion almacenada.
 */
public enum TipoNotificacion {
    /** Recordatorio con 24h de antelacion. */
    RECORDATORIO_24H,
    /** Recordatorio el mismo dia. */
    RECORDATORIO_DIA,
    /** Aviso de cancelacion. */
    CANCELACION,
    /** Notificacion informativa generica. */
    INFORMACION
}
