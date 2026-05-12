package org.vedruna.barberia.modules.registration.dto;

import lombok.Builder;
import lombok.Getter;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;

/**
 * DTO de respuesta del registro en estado pendiente.
 */
@Getter
@Builder
public class RegisterResponseDto {

    /** Id de solicitud creada. */
    private Long solicitudId;

    /** Estado inicial de la solicitud. */
    private EstadoSolicitudRegistro estado;

    /** Mensaje para frontend. */
    private String message;
}
