package org.vedruna.barberia.modules.tablon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de alta de mensaje en tablon.
 */
@Getter
@Setter
public class CreateTablonMensajeRequestDto {

    /** Titulo del aviso. */
    @NotBlank
    @Size(max = 140)
    private String titulo;

    /** Texto principal del aviso. */
    @NotBlank
    @Size(max = 2000)
    private String mensaje;
}
