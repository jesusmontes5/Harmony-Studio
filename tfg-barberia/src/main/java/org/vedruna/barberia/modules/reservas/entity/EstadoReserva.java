package org.vedruna.barberia.modules.reservas.entity;

/**
 * Estados posibles de una reserva.
 */
public enum EstadoReserva {
    /** Reserva creada por el barbero pendiente de asignar hora. */
    PENDIENTE_HORA,
    /** Reserva creada y pendiente de confirmacion. */
    PENDIENTE,
    /** Reserva cancelada. */
    CANCELADA,
    /** Servicio completado. */
    COMPLETADA,
    /** Cliente no asistio a la cita. */
    NO_PRESENTADO
}
