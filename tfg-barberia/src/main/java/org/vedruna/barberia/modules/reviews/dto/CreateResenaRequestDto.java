package org.vedruna.barberia.modules.reviews.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de peticion para crear reseña.
 */
@Getter
@Setter
public class CreateResenaRequestDto {

    /** Id de la reserva reseñada. */
    @NotNull
    private Long reservaId;

    /** Puntuacion entre 1 y 5. */
    @NotNull
    @Min(1)
    @Max(5)
    private Integer puntuacion;

    /** Comentario opcional. */
    @Size(max = 2000)
    private String comentario;
}
