package org.vedruna.barberia.shared.security.config;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.vedruna.barberia.shared.security.filter.JwtAuthenticationFilter;
import org.vedruna.barberia.shared.security.filter.RateLimitingFilter;

/**
 * Configuracion principal del filtro de seguridad HTTP.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /** Filtro JWT custom. */
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /** Filtro de rate limiting. */
    private final RateLimitingFilter rateLimitingFilter;

    /** Provider de autenticacion. */
    private final AuthenticationProvider authenticationProvider;

    /** Origenes permitidos para frontend en local (separados por comas). */
    @Value("${app.cors.allowed-origins:${app.cors.allowed-origin:http://localhost:5173}}")
    private String allowedOrigins;

    /**
     * Define reglas de acceso, sesiones stateless y registro del filtro JWT.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/auth/google",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                .requestMatchers("/actuator/metrics", "/actuator/metrics/**", "/actuator/prometheus").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/services").permitAll()
                .requestMatchers(HttpMethod.GET, "/board/messages").permitAll()
                .requestMatchers(HttpMethod.GET, "/barbers/*/schedule").permitAll()
                .requestMatchers(HttpMethod.GET, "/barbers/*/reviews").permitAll()
                .requestMatchers(HttpMethod.GET, "/availability").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/barbers").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/users/me").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/users/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/users/clients").hasAnyRole("BARBERO", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/users/clients/*/block").hasAnyRole("BARBERO", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/users/clients/*/unblock").hasAnyRole("BARBERO", "ADMIN")
                .requestMatchers("/registration-requests/**").hasAnyRole("BARBERO", "ADMIN")
                .requestMatchers("/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    /**
     * Configuracion CORS para peticiones del frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> parsedAllowedOrigins = List.of(allowedOrigins.split(","))
            .stream()
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .collect(Collectors.toList());

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(parsedAllowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
