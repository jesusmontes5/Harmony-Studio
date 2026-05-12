package org.vedruna.barberia.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracion global de OpenAPI para Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    /** Nombre del esquema de seguridad usado por las anotaciones @SecurityRequirement. */
    private static final String BEARER_AUTH = "bearerAuth";

    /**
     * Define la informacion publica del contrato REST y el esquema JWT.
     *
     * @return bean OpenAPI con metadatos, servidor y seguridad.
     */
    @Bean
    public OpenAPI barberiaOpenApi() {
        return new OpenAPI()
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080")
                    .description("Servidor local de desarrollo")
            ))
            .components(new Components()
                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                    .name(BEARER_AUTH)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Introduce el token JWT sin prefijo. Swagger aplicara Bearer automaticamente.")
                )
            )
            .info(new Info()
                .title("Harmony Studio API")
                .version("1.0.0")
                .description("""
                    API REST del proyecto final DAW para la gestion de una barberia.

                    Incluye autenticacion JWT, gestion de reservas, horarios, clientes,
                    servicios, resenas, solicitudes de registro, panel del barbero y notificaciones.
                    """)
                .contact(new Contact()
                    .name("Jesus Montes Jimenez")
                    .email("jesusmontesjimenez05@gmail.com")
                )
                .license(new License()
                    .name("Uso academico - Proyecto DAW")
                ));
    }
}
