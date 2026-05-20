package org.vedruna.barberia.modules.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para cambiar la contrasena del usuario autenticado.
 */
@Getter
@Setter
public class ChangePasswordRequestDto {

    /** Contrasena actual del usuario. */
    @NotBlank
    private String currentPassword;

    /** Nueva contrasena en claro. */
    @NotBlank
    @Size(min = 8, max = 64)
    private String newPassword;

    /** Confirmacion de la nueva contrasena. */
    @NotBlank
    @Size(min = 8, max = 64)
    private String confirmPassword;
}
