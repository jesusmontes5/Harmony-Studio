package org.vedruna.barberia.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de peticion para autenticacion con Google.
 */
@Getter
@Setter
public class GoogleAuthRequestDto {

    /** ID token recibido desde Google en frontend. */
    @NotBlank
    private String token;
}
