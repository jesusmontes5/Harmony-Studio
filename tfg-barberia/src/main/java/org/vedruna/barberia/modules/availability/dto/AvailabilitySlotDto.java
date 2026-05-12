package org.vedruna.barberia.modules.availability.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO de slot de disponibilidad para reserva.
 */
@Getter
@AllArgsConstructor
public class AvailabilitySlotDto {

    /** Fecha/hora de inicio del slot. */
    private LocalDateTime start;

    /** Fecha/hora de fin del slot para la duracion consultada. */
    private LocalDateTime end;

    /** Indica si el slot esta disponible. */
    private boolean available;
}
