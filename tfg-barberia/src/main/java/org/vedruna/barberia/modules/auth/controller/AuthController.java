package org.vedruna.barberia.modules.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.vedruna.barberia.modules.auth.dto.AuthResponseDto;
import org.vedruna.barberia.modules.auth.dto.GoogleAuthRequestDto;
import org.vedruna.barberia.modules.auth.dto.LoginRequestDto;
import org.vedruna.barberia.modules.auth.dto.RegisterRequestDto;
import org.vedruna.barberia.modules.auth.service.AuthService;
import org.vedruna.barberia.modules.registration.dto.RegisterResponseDto;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.dto.ErrorResponseDto;

/**
 * Controlador de autenticacion publica.
 * Gestiona registro, login, autenticacion con Google y consulta de perfil.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticación", description = "Endpoints de autenticación: registro, login, OAuth de Google")
public class AuthController {

    /** Servicio de autenticacion. */
    private final AuthService authService;

    /**
     * Registra una solicitud de cliente pendiente de aprobación por admin.
     * El usuario debe quedar pendiente hasta que un admin apruebe la solicitud.
     * 
     * @param dto Datos de registro (nombre, email, teléfono, contraseña)
     * @return ResponseEntity con datos de la solicitud registrada
     */
    @PostMapping("/register")
    @Operation(
        summary = "Registrar nuevo cliente",
        description = "Crea una solicitud de registro pendiente de aprobación por administrador"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "409", description = "Email o teléfono ya registrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        log.info("POST /auth/register");
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
    }

    /**
     * Autentica usuario con email y contraseña.
     * Retorna JWT token para peticiones autenticadas posteriores.
     * 
     * @param dto Email y contraseña del usuario
     * @return Token JWT y datos del usuario
     */
    @PostMapping("/login")
    @Operation(
        summary = "Login de usuario",
        description = "Autentica usuario con email y contraseña, retorna JWT token"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login exitoso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "429", description = "Demasiados intentos fallidos. Espere antes de reintentar",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        log.info("POST /auth/login");
        return ResponseEntity.ok(authService.login(dto));
    }

    /**
     * Autentica con Google OAuth una cuenta ya aprobada.
     * Si el email no existe, el usuario debe registrarse primero.
     *
     * @param dto Token de Google del cliente
     * @return Token JWT y datos del usuario
     */
    @PostMapping("/google")
    @Operation(
        summary = "OAuth con Google",
        description = "Login con token de Google para usuarios ya registrados y aprobados."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Token de Google inválido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "No se puede verificar token de Google",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<AuthResponseDto> googleLogin(@Valid @RequestBody GoogleAuthRequestDto dto) {
        log.info("POST /auth/google");
        return ResponseEntity.ok(authService.googleLogin(dto));
    }

    /**
     * Retorna datos del usuario actualmente autenticado.
     * Requiere token JWT válido en header Authorization.
     * 
     * @param usuario Usuario extraído del JWT
     * @return Datos públicos del usuario autenticado
     */
    @GetMapping("/me")
    @Operation(
        summary = "Obtener perfil del usuario autenticado",
        description = "Retorna los datos públicos del usuario actualmente autenticado"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos obtenidos exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioPublicDto.class))),
        @ApiResponse(responseCode = "401", description = "Token no válido o expirado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<UsuarioPublicDto> me(@AuthenticationPrincipal Usuario usuario) {
        log.info("GET /auth/me for userId={}", usuario != null ? usuario.getId() : null);
        return ResponseEntity.ok(authService.me(usuario));
    }
}
