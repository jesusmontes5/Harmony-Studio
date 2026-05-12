package org.vedruna.barberia.modules.auth.dto;

import lombok.Builder;
import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;

/**
 * DTO de respuesta de autenticacion.
 */
@Getter
@Builder
public class AuthResponseDto {

    /** Tipo de token, normalmente Bearer. */
    private String tokenType;

    /** Access token JWT. */
    private String accessToken;

    /** Alias simplificado para mantener compatibilidad con clientes. */
    @JsonProperty("token")
    public String getToken() {
        return accessToken;
    }

    /** Expiracion en segundos. */
    private Long expiresIn;

    /** Usuario autenticado sin datos sensibles. */
    private UsuarioPublicDto user;
}
