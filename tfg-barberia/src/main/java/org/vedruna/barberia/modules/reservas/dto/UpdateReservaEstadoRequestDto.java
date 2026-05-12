package org.vedruna.barberia.modules.reservas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;

/**
 * DTO de cambio de estado de reserva.
 */
@Getter
@Setter
public class UpdateReservaEstadoRequestDto {

    /** Estado destino solicitado. */
    @NotNull
    private EstadoReserva estado;

    /** Motivo de cancelacion opcional. */
    @Size(max = 255)
    private String motivoCancelacion;

    /** Observacion interna opcional del barbero/admin. */
    private String observacionesBarbero;
}
