package org.vedruna.barberia.shared.security.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro de rate limiting para proteger endpoints críticos contra fuerza bruta.
 *
 * <p>Implementa un sistema de "bucket" por dirección IP/email para limitar intentos
 * de login y registro fallidos.</p>
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    /** Número máximo de intentos en la ventana de tiempo. */
    private static final int REQUESTS_PER_MINUTE = 5;

    /** Ventana de tiempo en minutos. */
    private static final Duration WINDOW_DURATION = Duration.ofMinutes(1);

    /** Cache de buckets por clave (IP o email). */
    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    /**
     * Filtra requests POST a /auth/login y /auth/register.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Solo aplicar rate limiting a endpoints críticos
        if (("POST".equals(method) && (path.contains("/auth/login") || path.contains("/auth/register")))
            || ("POST".equals(method) && path.contains("/auth/google"))) {

            String clientIdentifier = getClientIdentifier(request);
            Bucket bucket = resolveBucket(clientIdentifier);

            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for client: {}", clientIdentifier);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"Demasiados intentos. Intenta de nuevo en 1 minuto.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Resuelve el identificador del cliente (IP o parámetro email si está disponible).
     */
    private String getClientIdentifier(HttpServletRequest request) {
        // Intentar obtener IP real (detrás de proxies)
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    /**
     * Resuelve o crea el bucket para la clave dada.
     */
    private Bucket resolveBucket(String key) {
        return bucketCache.computeIfAbsent(key, k -> createNewBucket());
    }

    /**
     * Crea un nuevo bucket con la configuración de rate limiting.
     */
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(REQUESTS_PER_MINUTE, Refill.intervally(REQUESTS_PER_MINUTE, WINDOW_DURATION));
        return Bucket4j.builder().addLimit(limit).build();
    }
}
