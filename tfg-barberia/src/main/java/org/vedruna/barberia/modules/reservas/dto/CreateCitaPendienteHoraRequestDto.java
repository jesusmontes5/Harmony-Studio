package org.vedruna.barberia.modules.reservas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para que el barbero programe una cita futura sin hora.
 */
@Getter
@Setter
public class CreateCitaPendienteHoraRequestDto {

    /** Cliente al que se le programa la cita. */
    @NotNull
    private Long clienteId;

    /** Fecha de la cita pendiente. */
    @NotNull
    private LocalDate fecha;

    /** Servicio elegido para la cita. */
    @NotNull
    private Long servicioId;

    /** Notas opcionales del barbero/cliente. */
    @Size(max = 255)
    private String observacionesCliente;
}
