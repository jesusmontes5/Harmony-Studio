package org.vedruna.barberia.modules.schedule.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de tramo horario por fecha de un barbero.
 */
@Getter
@Setter
public class HorarioBarberoDto {

    /** Identificador de fila de horario. */
    private Long id;

    /** Fecha concreta del tramo. */
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    /** Hora de inicio del tramo. */
    @NotNull
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaInicio;

    /** Hora de fin del tramo. */
    @NotNull
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaFin;

    /** Indica si el tramo contiene reservas pendientes. */
    private Boolean bloqueadoPorReservas;
}
