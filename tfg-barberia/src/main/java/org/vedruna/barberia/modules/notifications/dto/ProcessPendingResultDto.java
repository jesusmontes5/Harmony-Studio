package org.vedruna.barberia.modules.notifications.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO de respuesta para procesamiento masivo de pendientes.
 */
@Getter
@AllArgsConstructor
public class ProcessPendingResultDto {

    /** Cantidad de notificaciones procesadas. */
    private int processed;
}
