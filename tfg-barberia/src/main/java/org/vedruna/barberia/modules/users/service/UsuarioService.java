package org.vedruna.barberia.modules.users.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.notifications.repository.NotificacionRepository;
import org.vedruna.barberia.modules.registration.repository.SolicitudRegistroRepository;
import org.vedruna.barberia.modules.reviews.repository.ResenaRepository;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.vedruna.barberia.modules.schedule.repository.HorarioBarberoRepository;
import org.vedruna.barberia.modules.tablon.repository.TablonMensajeRepository;
import org.vedruna.barberia.modules.users.converter.UsuarioConverter;
import org.vedruna.barberia.modules.users.dto.ChangePasswordRequestDto;
import org.vedruna.barberia.modules.users.dto.UpdateMyNameRequestDto;
import org.vedruna.barberia.modules.users.dto.UpdateUsuarioRequestDto;
import org.vedruna.barberia.modules.users.dto.UsuarioPublicDto;
import org.vedruna.barberia.modules.users.entity.AuthProvider;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.shared.exception.ConflictException;
import org.vedruna.barberia.shared.exception.ForbiddenException;
import org.vedruna.barberia.shared.exception.NotFoundException;
import org.vedruna.barberia.shared.exception.UnauthorizedException;
import org.vedruna.barberia.shared.exception.ValidationException;
import org.vedruna.barberia.shared.validation.PasswordStrengthValidator;

/**
 * Servicio de gestión de usuarios para endpoints administrativos.
 * Permite búsqueda, filtrado y manipulación de datos de usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    /** Repositorio de usuarios. */
    private final UsuarioRepository usuarioRepository;

    /** Converter de usuarios a DTO publico. */
    private final UsuarioConverter usuarioConverter;

    /** Repositorio de notificaciones. */
    private final NotificacionRepository notificacionRepository;

    /** Repositorio de reseñas. */
    private final ResenaRepository resenaRepository;

    /** Repositorio de mensajes del tablón. */
    private final TablonMensajeRepository tablonMensajeRepository;

    /** Repositorio de reservas. */
    private final ReservaRepository reservaRepository;

    /** Repositorio de horarios de barbero. */
    private final HorarioBarberoRepository horarioBarberoRepository;

    /** Repositorio de solicitudes de registro. */
    private final SolicitudRegistroRepository solicitudRegistroRepository;

    /** Encoder BCrypt de contrasenas. */
    private final PasswordEncoder passwordEncoder;

    /** Validador de fortaleza de contrasenas. */
    private final PasswordStrengthValidator passwordStrengthValidator;

    /**
     * Busca usuarios con filtros opcionales.
     * 
     * @param rol Filtro opcional por rol (CLIENTE, BARBERO, ADMIN)
     * @param activo Filtro opcional por estado (true=activo, false=inactivo)
     * @param q Término de búsqueda en nombre o email
     * @return Lista de usuarios que coinciden con los filtros
     */
    @Transactional(readOnly = true)
    public List<UsuarioPublicDto> search(RolUsuario rol, Boolean activo, String q) {
        log.info("Searching users role={}, activo={}, q={}", rol, activo, q);
        return usuarioRepository.search(rol, activo, q).stream()
            .map(usuarioConverter::toPublicDto)
            .toList();
    }

    /**
     * Retorna lista de todos los barberos activos.
     * Utilizado para mostrar opciones de reserva a clientes.
     * 
     * @return Lista de barberos activos como DTOs públicos
     */
    @Transactional(readOnly = true)
    public List<UsuarioPublicDto> listBarberos() {
        return usuarioRepository.search(RolUsuario.BARBERO, true, null).stream()
            .map(usuarioConverter::toPublicDto)
            .toList();
    }

    /**
     * Actualiza parcialmente datos administrativos de un usuario.
     * Solo admin puede actualizar otros usuarios.
     * 
     * @param id ID del usuario a actualizar
     * @param dto Campos a actualizar (nombre, teléfono, rol, avatar, activo)
     * @return Usuario actualizado como DTO público
     * @throws NotFoundException Si el usuario no existe
     * @throws ConflictException Si el teléfono ya está en uso
     */
    @Transactional
    public UsuarioPublicDto patch(Long id, UpdateUsuarioRequestDto dto) {
        log.info("Patching user id={}", id);
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Usuario no encontrado"));

        if (dto.getNombre() != null) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getTelefono() != null) {
            String normalizedPhone = normalizePhone(dto.getTelefono());
            if (normalizedPhone != null) {
                usuarioRepository.findByTelefono(normalizedPhone)
                    .filter(existing -> !existing.getId().equals(usuario.getId()))
                    .ifPresent(existing -> {
                        throw new ConflictException("PHONE_ALREADY_EXISTS", "El telefono ya esta en uso");
                    });
            }
            usuario.setTelefono(normalizedPhone);
        }
        if (dto.getRol() != null) {
            usuario.setRol(dto.getRol());
        }
        if (dto.getAvatarUrl() != null) {
            usuario.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        Usuario saved = usuarioRepository.save(usuario);
        return usuarioConverter.toPublicDto(saved);
    }

    /**
     * Obtiene un usuario por ID para validaciones internas.
     * 
     * @param id ID del usuario
     * @return Entidad Usuario
     * @throws NotFoundException Si el usuario no existe
     */
    @Transactional(readOnly = true)
    public Usuario getRequiredEntity(Long id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Usuario no encontrado"));
    }

    /**
     * Lista clientes con filtro de estado activo opcional y busqueda.
     */
    @Transactional(readOnly = true)
    public List<UsuarioPublicDto> listClientes(Boolean activo, String q) {
        log.info("Listing clients activo={}, q={}", activo, q);
        return usuarioRepository.search(RolUsuario.CLIENTE, activo, q).stream()
            .map(usuarioConverter::toPublicDto)
            .toList();
    }

    /**
     * Bloquea un cliente (activo=false) por parte de barbero o admin.
     */
    @Transactional
    public UsuarioPublicDto blockClient(Usuario actor, Long clientId) {
        assertReviewerRole(actor);
        Usuario client = getClientEntity(clientId);
        if (!Boolean.TRUE.equals(client.getActivo())) {
            return usuarioConverter.toPublicDto(client);
        }
        client.setActivo(false);
        Usuario saved = usuarioRepository.save(client);
        return usuarioConverter.toPublicDto(saved);
    }

    /**
     * Desbloquea un cliente (activo=true) por parte de barbero o admin.
     */
    @Transactional
    public UsuarioPublicDto unblockClient(Usuario actor, Long clientId) {
        assertReviewerRole(actor);
        Usuario client = getClientEntity(clientId);
        if (Boolean.TRUE.equals(client.getActivo())) {
            return usuarioConverter.toPublicDto(client);
        }
        client.setActivo(true);
        Usuario saved = usuarioRepository.save(client);
        return usuarioConverter.toPublicDto(saved);
    }

    /**
     * Actualiza nombre del usuario autenticado.
     */
    @Transactional
    public UsuarioPublicDto updateMyName(Usuario actor, UpdateMyNameRequestDto dto) {
        log.info("Updating own name for userId={}", actor.getId());
        actor.setNombre(dto.getNombre());
        if (dto.getTelefono() != null) {
            String normalizedPhone = normalizePhone(dto.getTelefono());
            if (normalizedPhone != null) {
                usuarioRepository.findByTelefono(normalizedPhone)
                    .filter(existing -> !existing.getId().equals(actor.getId()))
                    .ifPresent(existing -> {
                        throw new ConflictException("PHONE_ALREADY_EXISTS", "El telefono ya esta en uso");
                    });
            }
            actor.setTelefono(normalizedPhone);
        }
        if (dto.getAvatarUrl() != null) {
            actor.setAvatarUrl(normalizeAvatarUrl(dto.getAvatarUrl()));
        }
        Usuario saved = usuarioRepository.save(actor);
        return usuarioConverter.toPublicDto(saved);
    }

    /**
     * Cambia la contrasena del usuario autenticado validando la contrasena actual.
     */
    @Transactional
    public void changeMyPassword(Usuario actor, ChangePasswordRequestDto dto) {
        log.info("Changing own password for userId={}", actor.getId());

        String currentHash = actor.getPasswordHash();
        if (currentHash == null || currentHash.isBlank()
            || !passwordEncoder.matches(dto.getCurrentPassword(), currentHash)) {
            throw new UnauthorizedException("CURRENT_PASSWORD_INVALID", "La contrasena actual no es correcta");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationException("PASSWORD_CONFIRMATION_MISMATCH", "Las contrasenas no coinciden");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), currentHash)) {
            throw new ValidationException("PASSWORD_REUSED", "La nueva contrasena debe ser distinta a la actual");
        }

        passwordStrengthValidator.validate(dto.getNewPassword());
        actor.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        usuarioRepository.save(actor);
    }

    /**
     * Normaliza telefono vacio a null.
     */
    private String normalizePhone(String telefono) {
        String trimmed = telefono == null ? null : telefono.trim();
        return (trimmed == null || trimmed.isEmpty()) ? null : trimmed;
    }

    /**
     * Normaliza avatar URL vacio a null.
     */
    private String normalizeAvatarUrl(String avatarUrl) {
        String trimmed = avatarUrl == null ? null : avatarUrl.trim();
        return (trimmed == null || trimmed.isEmpty()) ? null : trimmed;
    }

    /**
     * Verifica rol permitido para gestionar clientes.
     */
    private void assertReviewerRole(Usuario actor) {
        if (actor.getRol() == RolUsuario.BARBERO || actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        throw new ForbiddenException("FORBIDDEN_CLIENT_MANAGEMENT", "No tienes permiso para gestionar clientes");
    }

    /**
     * Obtiene cliente por id y valida rol CLIENTE.
     */
    private Usuario getClientEntity(Long clientId) {
        Usuario client = usuarioRepository.findById(clientId)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Usuario no encontrado"));

        if (client.getRol() != RolUsuario.CLIENTE) {
            throw new ValidationException("USER_IS_NOT_CLIENT", "Solo se puede operar sobre usuarios con rol CLIENTE");
        }
        return client;
    }

    /**
     * Elimina la cuenta del usuario autenticado y todos sus datos asociados.
     * Respeta el orden de FK constraints para evitar violaciones de integridad.
     *
     * <p>Para clientes: las resenas escritas se conservan anonimizadas,
     * reasignando el autor al usuario tecnico "Usuario eliminado".
     * Para barberos: las resenas recibidas se eliminan porque el profesional ya no existe.</p>
     */
    @Transactional
    public void deleteMyAccount(Usuario usuario) {
        log.info("Deleting account for userId={}", usuario.getId());
        Long userId = usuario.getId();
        String email = usuario.getEmail();
        String telefono = usuario.getTelefono();

        if (isDeletedUser(usuario)) {
            log.warn("Attempted to delete the system deleted-user account, userId={}", userId);
            throw new ValidationException("CANNOT_DELETE_SYSTEM_USER", "No se puede eliminar la cuenta del sistema");
        }

        Usuario deletedUser = getOrCreateDeletedUser();
        Long deletedUserId = deletedUser.getId();

        // Orden de borrado segun FK constraints
        notificacionRepository.deleteByUsuarioId(userId);

        // Resenas escritas por el usuario (como cliente): se anonimizan para
        // preservar la reputacion de los barberos.
        resenaRepository.anonymizeCliente(userId, deletedUserId);

        // Resenas recibidas por el usuario (como barbero): se eliminan porque
        // el profesional reseñado ya no existe.
        resenaRepository.deleteByBarberoId(userId);

        tablonMensajeRepository.deleteByAutorId(userId);
        reservaRepository.deleteByClienteId(userId);
        reservaRepository.deleteByBarberoId(userId);
        horarioBarberoRepository.deleteByBarberoId(userId);
        solicitudRegistroRepository.deleteByEmailOrTelefono(email, telefono);

        usuarioRepository.delete(usuario);
        log.info("Account deleted for userId={}", userId);
    }

    /**
     * Constante del email del usuario tecnico para resenas anonimizadas.
     */
    private static final String DELETED_USER_EMAIL = "deleted-user@system.local";

    /**
     * Obtiene o crea el usuario tecnico para resenas anonimizadas.
     */
    private Usuario getOrCreateDeletedUser() {
        return usuarioRepository.findByEmail(DELETED_USER_EMAIL)
            .orElseGet(this::createDeletedUser);
    }

    /**
     * Crea el usuario tecnico en base de datos.
     */
    private Usuario createDeletedUser() {
        log.info("Creating system deleted-user for anonymized reviews");
        Usuario deletedUser = new Usuario();
        deletedUser.setNombre("Usuario eliminado");
        deletedUser.setEmail(DELETED_USER_EMAIL);
        deletedUser.setTelefono(null);
        deletedUser.setPasswordHash("deleted");
        deletedUser.setProvider(AuthProvider.LOCAL);
        deletedUser.setRol(RolUsuario.CLIENTE);
        deletedUser.setAvatarUrl(null);
        deletedUser.setActivo(false);
        return usuarioRepository.save(deletedUser);
    }

    /**
     * Verifica si un usuario es la cuenta tecnica del sistema.
     */
    private boolean isDeletedUser(Usuario usuario) {
        return DELETED_USER_EMAIL.equals(usuario.getEmail());
    }
}
