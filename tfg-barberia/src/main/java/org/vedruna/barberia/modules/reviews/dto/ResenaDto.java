package org.vedruna.barberia.modules.reviews.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de salida de reseñas.
 */
@Getter
@Setter
public class ResenaDto {

    /** Id reseña. */
    private Long id;

    /** Id de reserva reseñada. */
    private Long reservaId;

    /** Id del cliente autor. */
    private Long clienteId;

    /** Nombre del cliente autor. */
    private String clienteNombre;

    /** Id del barbero reseñado. */
    private Long barberoId;

    /** Puntuacion otorgada. */
    private Integer puntuacion;

    /** Comentario de reseña. */
    private String comentario;

    /** Fecha de creacion. */
    private LocalDateTime creadaEn;
}
