package org.vedruna.barberia.modules.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para actualizar el nombre del usuario autenticado.
 */
@Getter
@Setter
public class UpdateMyNameRequestDto {

    /** Nuevo nombre del usuario autenticado. */
    @NotBlank
    @Size(min = 2, max = 100)
    private String nombre;

    /** URL publica opcional del avatar. Puede enviarse vacia para limpiar. */
    @Size(max = 500)
    private String avatarUrl;

    /** Telefono opcional para completar perfil o actualizar contacto. */
    @Pattern(regexp = "^[0-9]{7,20}$", message = "telefono: formato invalido")
    private String telefono;
}
