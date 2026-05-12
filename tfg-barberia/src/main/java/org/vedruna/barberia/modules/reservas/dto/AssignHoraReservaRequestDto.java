package org.vedruna.barberia.modules.reservas.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para asignar hora a una cita pendiente.
 */
@Getter
@Setter
public class AssignHoraReservaRequestDto {

    /** Hora de inicio elegida. */
    @NotNull
    private LocalTime horaInicio;

    /** Hora de fin calculada para el servicio. */
    @NotNull
    private LocalTime horaFin;
}
