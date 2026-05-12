package org.vedruna.barberia.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de peticion para login.
 */
@Getter
@Setter
public class LoginRequestDto {

    /** Email de autenticacion. */
    @NotBlank
    @Email
    @Pattern(regexp = "(?i)^[a-z0-9._%+-]+@gmail\\.com$", message = "email: debe ser Gmail valido")
    private String email;

    /** Password en claro para comparacion BCrypt. */
    @NotBlank
    @Size(min = 8, max = 64)
    private String password;
}
