package org.vedruna.barberia.modules.reviews.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * DTO agregado de reseñas de barbero.
 */
@Getter
@AllArgsConstructor
public class BarberoReviewsResponseDto {

    /** Identificador de barbero consultado. */
    private Long barberoId;

    /** Promedio de puntuacion (0 si no hay reseñas). */
    private double promedio;

    /** Listado de reseñas. */
    private List<ResenaDto> reviews;
}
