package org.vedruna.barberia.modules.notifications.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.notifications.entity.CanalNotificacion;
import org.vedruna.barberia.modules.notifications.entity.TipoNotificacion;

/**
 * DTO de salida de notificaciones de usuario.
 */
@Getter
@Setter
public class NotificacionDto {

    /** Id de notificacion. */
    private Long id;

    /** Reserva asociada opcional. */
    private Long reservaId;

    /** Tipo funcional de notificacion. */
    private TipoNotificacion tipo;

    /** Canal de entrega. */
    private CanalNotificacion canal;

    /** Mensaje del evento. */
    private String mensaje;

    /** Fecha de programacion. */
    private LocalDateTime fechaProgramada;

    /** Indicador de ya procesada. */
    private Boolean enviada;

    /** Fecha de procesamiento real. */
    private LocalDateTime enviadaEn;
}
