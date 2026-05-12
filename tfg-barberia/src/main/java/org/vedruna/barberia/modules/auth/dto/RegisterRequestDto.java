package org.vedruna.barberia.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de peticion para registro de cliente.
 */
@Getter
@Setter
public class RegisterRequestDto {

    /** Nombre del cliente. */
    @NotBlank
    @Size(min = 2, max = 100)
    private String nombre;

    /** Email unico del cliente. */
    @NotBlank
    @Email
    @Pattern(regexp = "(?i)^[a-z0-9._%+-]+@gmail\\.com$", message = "email: debe ser Gmail valido")
    @Size(max = 150)
    private String email;

    /** Telefono obligatorio del cliente (7 a 20 digitos). */
    @NotBlank(message = "telefono: obligatorio")
    @Pattern(regexp = "^[0-9]{7,20}$", message = "telefono: formato invalido")
    private String telefono;

    /** Password en claro (se convierte a hash). */
    @NotBlank
    @Size(min = 8, max = 64)
    private String password;
}
