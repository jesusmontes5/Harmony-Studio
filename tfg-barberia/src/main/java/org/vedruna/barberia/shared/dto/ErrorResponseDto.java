package org.vedruna.barberia.shared.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * DTO de error comun para respuestas de excepcion.
 */
@Getter
@Builder
public class ErrorResponseDto {

    /** Codigo funcional del error. */
    private final String code;

    /** Mensaje legible del error. */
    private final String message;
}
