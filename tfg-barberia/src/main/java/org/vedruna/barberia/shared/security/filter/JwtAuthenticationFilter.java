package org.vedruna.barberia.shared.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.security.adapter.UsuarioUserDetailsAdapter;
import org.vedruna.barberia.shared.security.util.JwtUtil;

/**
 * Filtro JWT para autenticar peticiones con header Authorization Bearer.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /** Respuesta uniforme para tokens de usuarios bloqueados. */
    private static final String INACTIVE_USER_RESPONSE =
        "{\"title\":\"INACTIVE_USER\",\"detail\":\"Tu cuenta esta bloqueada. Contacta con tu barbero para revisar tu caso.\"}";

    /** Utilidad de parseo y validacion JWT. */
    private final JwtUtil jwtUtil;

    /** Servicio para cargar usuario desde email del token. */
    private final UserDetailsService userDetailsService;

    /**
     * Intercepta peticiones y configura el contexto de seguridad si el token es valido.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Extraer Usuario del adaptador UsuarioUserDetailsAdapter
                Usuario usuario = null;
                if (userDetails instanceof UsuarioUserDetailsAdapter) {
                    usuario = ((UsuarioUserDetailsAdapter) userDetails).getUsuario();
                }

                if (usuario != null && jwtUtil.isTokenValid(token, usuario)) {
                    if (!userDetails.isEnabled()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setCharacterEncoding("UTF-8");
                        response.setContentType("application/problem+json");
                        response.getWriter().write(INACTIVE_USER_RESPONSE);
                        return;
                    }

                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        userDetails.getAuthorities()
                    );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    log.debug("JWT authenticated userId={}", usuario.getId());
                }
            }
        } catch (Exception ex) {
            log.warn("JWT processing failed: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
