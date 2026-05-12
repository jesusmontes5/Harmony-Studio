package org.vedruna.barberia.modules.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.vedruna.barberia.shared.exception.UnauthorizedException;

/**
 * Servicio dedicado a validar y parsear ID tokens de Google.
 */
@Service
@Slf4j
public class GoogleTokenVerifierService {

    /** Client ID OAuth de Google configurado para la aplicacion. */
    private final String googleClientId;

    /** Verificador oficial de ID tokens de Google. */
    private final GoogleIdTokenVerifier verifier;

    /**
     * Construye el verificador de Google usando el client ID configurado.
     *
     * @param googleClientId Client ID OAuth esperado en los tokens entrantes.
     */
    public GoogleTokenVerifierService(@Value("${security.google.client-id}") String googleClientId) {
        this.googleClientId = googleClientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();
    }

    /**
     * Verifica la firma y claims principales del token.
     */
    public GoogleIdToken.Payload verifyIdToken(String token) {
        try {
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                throw new UnauthorizedException("INVALID_GOOGLE_TOKEN", "Token de Google invalido");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new UnauthorizedException("GOOGLE_EMAIL_NOT_VERIFIED", "El email de Google no esta verificado");
            }
            return payload;
        } catch (GeneralSecurityException | IOException ex) {
            log.warn("Error validating Google token for clientId={}", googleClientId, ex);
            throw new UnauthorizedException("INVALID_GOOGLE_TOKEN", "No se pudo validar el token de Google");
        }
    }
}
