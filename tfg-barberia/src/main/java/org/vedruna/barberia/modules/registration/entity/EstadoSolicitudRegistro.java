package org.vedruna.barberia.modules.registration.entity;

/**
 * Estado de una solicitud de registro.
 */
public enum EstadoSolicitudRegistro {
    /** Solicitud pendiente de revision. */
    PENDIENTE,
    /** Solicitud aceptada y convertida en usuario. */
    APROBADA,
    /** Solicitud rechazada por el barbero/admin. */
    RECHAZADA
}
