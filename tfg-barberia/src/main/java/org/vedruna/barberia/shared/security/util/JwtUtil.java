package org.vedruna.barberia.shared.security.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Utilidad para generacion y validacion de JWT.
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {

    /** Secreto base64 usado para firma HMAC. */
    @Value("${security.jwt.secret}")
    private String jwtSecret;

    /** Minutos de expiracion del access token. */
    @Value("${security.jwt.expiration-minutes}")
    private long expirationMinutes;

    /**
     * Genera token de acceso para un usuario.
     *
     * @param usuario usuario autenticado.
     * @return token firmado.
     */
    public String generateAccessToken(Usuario usuario) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .subject(usuario.getEmail())
            .claim("uid", usuario.getId())
            .claim("rol", usuario.getRol().name())
            .issuedAt(new Date(now))
            .expiration(new Date(now + expirationMinutes * 60_000))
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Obtiene subject (email) de token valido.
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Obtiene expiracion del token en epoch ms.
     */
    public long extractExpirationEpochMillis(String token) {
        return extractAllClaims(token).getExpiration().getTime();
    }

    /**
     * Valida token comparando usuario y expiracion.
     */
    public boolean isTokenValid(String token, Usuario usuario) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equals(usuario.getEmail()) && claims.getExpiration().after(new Date());
    }

    /**
     * @return segundos de vida util configurados para el token.
     */
    public long getExpiresInSeconds() {
        return expirationMinutes * 60;
    }

    /**
     * Parsea claims tras verificar firma.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    /**
     * Construye clave HMAC desde secreto base64.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
