package org.vedruna.barberia.modules.users.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.vedruna.barberia.modules.users.entity.RolUsuario;

/**
 * DTO para parcheo administrativo de usuario.
 */
@Getter
@Setter
public class UpdateUsuarioRequestDto {

    /** Nombre actualizado opcional. */
    @Size(min = 2, max = 100)
    private String nombre;

    /** Telefono actualizado opcional (si se informa, debe tener 7 a 20 digitos). */
    @Pattern(regexp = "^$|^[0-9]{7,20}$", message = "telefono: formato invalido")
    private String telefono;

    /** Rol actualizado opcional. */
    private RolUsuario rol;

    /** Avatar actualizado opcional. */
    @Size(max = 500)
    private String avatarUrl;

    /** Estado activo/inactivo opcional. */
    private Boolean activo;
}
