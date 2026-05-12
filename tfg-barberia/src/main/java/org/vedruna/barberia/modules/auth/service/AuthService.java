package org.vedruna.barberia.modules.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.auth.dto.AuthResponseDto;
import org.vedruna.barberia.modules.auth.dto.GoogleAuthRequestDto;
import org.vedruna.barberia.modules.auth.dto.LoginRequestDto;
import org.vedruna.barberia.modules.auth.dto.RegisterRequestDto;
import org.vedruna.barberia.modules.registration.dto.RegisterResponseDto;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;
import org.vedruna.barberia.modules.registration.entity.SolicitudRegistro;
import org.vedruna.barberia.modules.registration.repository.SolicitudRegistroRepository;
import org.vedruna.barberia.modules.registration.service.SolicitudRegistroService;
import org.vedruna.barberia.modules.users.converter.UsuarioConverter;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.shared.exception.UnauthorizedException;
import org.vedruna.barberia.shared.security.util.JwtUtil;
import org.vedruna.barberia.shared.validation.PasswordStrengthValidator;

/**
 * Servicio de autenticacion y registro.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    /** Mensaje mostrado cuando una cuenta esta bloqueada por la barberia. */
    private static final String BLOCKED_ACCOUNT_MESSAGE =
        "Tu cuenta esta bloqueada. Contacta con tu barbero para revisar tu caso.";

    /** Repositorio de usuarios. */
    private final UsuarioRepository usuarioRepository;

    /** Encoder BCrypt de password. */
    private final PasswordEncoder passwordEncoder;

    /** Utilidad JWT. */
    private final JwtUtil jwtUtil;

    /** Converter de usuario a DTO publico. */
    private final UsuarioConverter usuarioConverter;

    /** Servicio de solicitudes de registro. */
    private final SolicitudRegistroService solicitudRegistroService;

    /** Repositorio de solicitudes para detectar cuentas pendientes en login. */
    private final SolicitudRegistroRepository solicitudRegistroRepository;

    /** Servicio de validacion del token de Google. */
    private final GoogleTokenVerifierService googleTokenVerifierService;

    /** Validador de fortaleza de contraseña. */
    private final PasswordStrengthValidator passwordStrengthValidator;

    /**
     * Crea una solicitud de registro para cliente nuevo.
     * Valida la fortaleza de la contraseña y encoda el hash BCrypt.
     * La cuenta queda en estado PENDIENTE hasta aprobación de admin.
     * 
     * @param dto Datos de registro (nombre, email, teléfono, contraseña)
     * @return RegisterResponseDto con ID de solicitud y estado PENDIENTE
     * @throws ValidationException Si la contraseña no cumple requisitos de fortaleza
     * @throws ConflictException Si email o teléfono ya están registrados
     */
    @Transactional
    public RegisterResponseDto register(RegisterRequestDto dto) {
        log.info("Register request email={}", dto.getEmail());

        // Validar fortaleza de contraseña
        passwordStrengthValidator.validate(dto.getPassword());

        String hash = passwordEncoder.encode(dto.getPassword());
        return solicitudRegistroService.createPending(dto, hash);
    }

    /**
     * Autentica usuario con email y contraseña.
     * Valida que la cuenta esté activa y que las credenciales sean válidas.
     * 
     * @param dto Email y contraseña del usuario
     * @return AuthResponseDto con token JWT y datos del usuario
     * @throws UnauthorizedException Si credenciales son inválidas o cuenta está inactiva
     */
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto dto) {
        log.info("Login attempt email={}", dto.getEmail());
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail()).orElse(null);
        if (usuario == null) {
            validatePendingRegistrationLogin(dto);
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Credenciales invalidas");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("INACTIVE_USER", BLOCKED_ACCOUNT_MESSAGE);
        }

        String hash = usuario.getPasswordHash();
        if (hash == null || !passwordEncoder.matches(dto.getPassword(), hash)) {
            throw new UnauthorizedException("INVALID_PASSWORD", "Contrasena incorrecta");
        }

        return buildAuthResponse(usuario);
    }

    /**
     * Autentica con token de Google.
     * Si usuario existe: sincroniza datos de perfil Google y retorna token.
     * Si usuario no existe: crea solicitud pendiente y lanza excepción.
     * 
     * @param dto Token de identidad de Google verificado
     * @return AuthResponseDto con token JWT y datos del usuario
     * @throws UnauthorizedException Si token no es válido o usuario pendiente/inactivo
     */
    @Transactional
    public AuthResponseDto googleLogin(GoogleAuthRequestDto dto) {
        GoogleIdToken.Payload payload = googleTokenVerifierService.verifyIdToken(dto.getToken());
        String email = payload.getEmail();
        String displayName = resolveDisplayName(payload);

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            if (solicitudRegistroRepository.findByEmailAndEstado(email, EstadoSolicitudRegistro.PENDIENTE).isPresent()) {
                throw new UnauthorizedException(
                    "PENDING_APPROVAL",
                    "Tu cuenta esta a la espera de ser aceptada por el barbero."
                );
            }
            throw new UnauthorizedException(
                "GOOGLE_ACCOUNT_NOT_REGISTERED",
                "Para entrar con Google primero debes registrarte desde la pantalla de registro."
            );
        }

        syncGoogleProfile(usuario, payload, displayName);

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("INACTIVE_USER", BLOCKED_ACCOUNT_MESSAGE);
        }
        return buildAuthResponse(usuario);
    }

    /**
     * Genera respuesta estándar de autenticación con token JWT.
     * 
     * @param usuario Usuario autenticado
     * @return AuthResponseDto con token Bearer, tiempo de expiración y datos públicos
     */
    private AuthResponseDto buildAuthResponse(Usuario usuario) {
        String token = jwtUtil.generateAccessToken(usuario);
        return AuthResponseDto.builder()
            .tokenType("Bearer")
            .accessToken(token)
            .expiresIn(jwtUtil.getExpiresInSeconds())
            .user(usuarioConverter.toPublicDto(usuario))
            .build();
    }

    /**
     * Obtiene nombre visible desde token Google con fallback.
     * Si no existe nombre en el token, usa el email.
     * 
     * @param payload Payload del token JWT de Google
     * @return Nombre a mostrar del usuario
     */
    private String resolveDisplayName(GoogleIdToken.Payload payload) {
        String name = (String) payload.get("name");
        if (name != null && !name.isBlank()) {
            return name;
        }
        return payload.getEmail();
    }

    /**
     * Sincroniza avatar y nombre con datos de perfil Google.
     * Solo actualiza si los datos de Google son más recientes.
     * 
     * @param usuario Usuario a actualizar
     * @param payload Payload del token JWT de Google
     * @param displayName Nombre a mostrar del usuario
     */
    private void syncGoogleProfile(Usuario usuario, GoogleIdToken.Payload payload, String displayName) {
        boolean dirty = false;
        String picture = (String) payload.get("picture");

        if (picture != null && !picture.isBlank() && !picture.equals(usuario.getAvatarUrl())) {
            usuario.setAvatarUrl(picture);
            dirty = true;
        }
        if (displayName != null && !displayName.isBlank() && !displayName.equals(usuario.getNombre())) {
            usuario.setNombre(displayName);
            dirty = true;
        }
        if (dirty) {
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Obtiene informacion publica del usuario autenticado.
     */
    @Transactional(readOnly = true)
    public UsuarioPublicDto me(Usuario usuario) {
        if (usuario == null) {
            throw new UnauthorizedException("UNAUTHORIZED", "Debes iniciar sesion");
        }
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("INACTIVE_USER", BLOCKED_ACCOUNT_MESSAGE);
        }
        return usuarioConverter.toPublicDto(usuario);
    }

    /**
     * Si existe solicitud pendiente, distingue espera de aprobacion y password incorrecta.
     */
    private void validatePendingRegistrationLogin(LoginRequestDto dto) {
        SolicitudRegistro pending = solicitudRegistroRepository
            .findByEmailAndEstado(dto.getEmail(), EstadoSolicitudRegistro.PENDIENTE)
            .orElse(null);

        if (pending == null) {
            return;
        }

        String pendingHash = pending.getPasswordHash();
        if (isBcryptHash(pendingHash) && passwordEncoder.matches(dto.getPassword(), pendingHash)) {
            throw new UnauthorizedException(
                "PENDING_APPROVAL",
                "Tu cuenta esta a la espera de ser aceptada por el barbero."
            );
        }
        throw new UnauthorizedException("INVALID_PASSWORD", "Contrasena incorrecta");
    }

    /**
     * Evita validar marcadores antiguos que no son hashes BCrypt reales.
     */
    private boolean isBcryptHash(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }
}
