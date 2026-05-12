package org.vedruna.barberia.modules.reservas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de peticion para crear reserva.
 */
@Getter
@Setter
public class CreateReservaRequestDto {

    /** Id del barbero solicitado. */
    @NotNull
    private Long barberoId;

    /** Id de cliente objetivo (solo admin). */
    private Long clienteId;

    /** Fecha de inicio solicitada. */
    @NotNull
    private LocalDateTime fechaInicio;

    /** Servicios que componen la reserva. */
    @NotEmpty
    @Valid
    private List<ReservaServicioInputDto> servicios;

    /** Observaciones opcionales del cliente. */
    @Size(max = 255)
    private String observacionesCliente;
}
