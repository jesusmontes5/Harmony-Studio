package org.vedruna.barberia.modules.reservas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de item de servicio para creacion de reserva.
 */
@Getter
@Setter
public class ReservaServicioInputDto {

    /** Identificador del servicio elegido. */
    @NotNull
    private Long servicioId;
}
