package org.vedruna.barberia.modules.registration.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para rechazar una solicitud de registro.
 */
@Getter
@Setter
public class RejectSolicitudRequestDto {

    /** Motivo de rechazo opcional. */
    @Size(max = 255)
    private String motivo;
}
