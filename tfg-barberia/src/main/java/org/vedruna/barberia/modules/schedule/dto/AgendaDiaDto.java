package org.vedruna.barberia.modules.schedule.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de agenda diaria del barbero.
 */
@Getter
@Setter
public class AgendaDiaDto {

    /** Identificador de barbero consultado. */
    private Long barberoId;

    /** Fecha de agenda solicitada. */
    private LocalDate fecha;

    /** Tramos de horario laboral del dia. */
    private List<HorarioBarberoDto> horarios;

    /** Reservas del dia para el barbero. */
    private List<AgendaReservaItemDto> reservas;
}

