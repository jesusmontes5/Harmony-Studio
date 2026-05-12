package org.vedruna.barberia.modules.availability.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO de respuesta de disponibilidad diaria.
 */
@Getter
@AllArgsConstructor
public class AvailabilityResponseDto {

    /** Id de barbero consultado. */
    private Long barberoId;

    /** Fecha consultada. */
    private LocalDate fecha;

    /** Duracion total evaluada en minutos. */
    private int duracionMinutos;

    /** Slots evaluados cada 30 minutos. */
    private List<AvailabilitySlotDto> slots;
}
