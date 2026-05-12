package org.vedruna.barberia.modules.registration.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.auth.dto.RegisterRequestDto;
import org.vedruna.barberia.modules.notifications.service.NotificacionService;
import org.vedruna.barberia.modules.registration.converter.SolicitudRegistroConverter;
import org.vedruna.barberia.modules.registration.dto.RegisterResponseDto;
import org.vedruna.barberia.modules.registration.dto.SolicitudRegistroDto;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;
import org.vedruna.barberia.modules.registration.entity.SolicitudRegistro;
import org.vedruna.barberia.modules.registration.repository.SolicitudRegistroRepository;
import org.vedruna.barberia.modules.users.entity.AuthProvider;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.shared.exception.ConflictException;
import org.vedruna.barberia.shared.exception.ForbiddenException;
import org.vedruna.barberia.shared.exception.NotFoundException;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio para el ciclo de vida de solicitudes de registro.
 * Maneja creación de solicitudes, aprobación y rechazo de nuevos usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudRegistroService {

    /** Marcador interno para solicitudes de alta por Google sin password local. */
    private static final String GOOGLE_PENDING_PASSWORD_MARKER = "__GOOGLE_PENDING__";

    /** Repositorio de solicitudes. */
    private final SolicitudRegistroRepository solicitudRegistroRepository;

    /** Repositorio de usuarios definitivos. */
    private final UsuarioRepository usuarioRepository;

    /** Converter entidad/DTO. */
    private final SolicitudRegistroConverter solicitudRegistroConverter;

    /** Servicio de notificaciones persistidas/email. */
    private final NotificacionService notificacionService;

    /**
     * Crea una solicitud de registro en estado PENDIENTE para usuario local.
     * Valida que email y teléfono no estén ya registrados.
     * Notifica a los barberos/admin de la nueva solicitud pendiente.
     *
     * @param dto Datos de registro (nombre, email, teléfono)
     * @param passwordHash Hash SHA-256 de la contraseña
     * @return RegisterResponseDto con ID de solicitud y estado PENDIENTE
     * @throws ConflictException Si email/teléfono ya están registrados o en otra solicitud pendiente
     * @throws ValidationException Si los datos no son válidos
     */
    @Transactional
    public RegisterResponseDto createPending(RegisterRequestDto dto, String passwordHash) {
        log.info("Creating register request email={}", dto.getEmail());

        String normalizedPhone = normalizePhone(dto.getTelefono());

        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "El email ya esta registrado");
        }
        if (solicitudRegistroRepository.findByEmailAndEstado(dto.getEmail(), EstadoSolicitudRegistro.PENDIENTE).isPresent()) {
            throw new ConflictException("EMAIL_PENDING_APPROVAL", "Este email ya tiene una solicitud pendiente");
        }

        if (normalizedPhone != null) {
            if (usuarioRepository.findByTelefono(normalizedPhone).isPresent()) {
                throw new ConflictException("PHONE_ALREADY_EXISTS", "El telefono ya esta registrado");
            }
            if (solicitudRegistroRepository.findByTelefonoAndEstado(normalizedPhone, EstadoSolicitudRegistro.PENDIENTE).isPresent()) {
                throw new ConflictException("PHONE_PENDING_APPROVAL", "Este telefono ya tiene una solicitud pendiente");
            }
        }
        deleteFinishedRequestsThatBlockRegistration(dto.getEmail(), normalizedPhone);

        SolicitudRegistro solicitud = new SolicitudRegistro();
        solicitud.setNombre(dto.getNombre());
        solicitud.setEmail(dto.getEmail());
        solicitud.setTelefono(normalizedPhone);
        solicitud.setPasswordHash(passwordHash);
        solicitud.setEstado(EstadoSolicitudRegistro.PENDIENTE);

        SolicitudRegistro saved = solicitudRegistroRepository.save(solicitud);

        String adminMessage = String.format(
            "Nueva solicitud de registro pendiente.\n\nSolicitud ID: %d\nNombre: %s\nEmail: %s\nTelefono: %s\n\nRevisa las solicitudes pendientes en la aplicacion.",
            saved.getId(),
            saved.getNombre(),
            saved.getEmail(),
            saved.getTelefono() == null ? "-" : saved.getTelefono()
        );
        List<Usuario> reviewers = usuarioRepository.findByRolInAndActivoTrue(List.of(RolUsuario.BARBERO));
        for (Usuario reviewer : reviewers) {
            notificacionService.createSystemInfo(reviewer, adminMessage);
        }

        return RegisterResponseDto.builder()
            .solicitudId(saved.getId())
            .estado(saved.getEstado())
            .message("Registro enviado. Espera confirmacion del barbero")
            .build();
    }

    /**
     * Crea (si no existe) una solicitud pendiente para cuentas Google.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createGooglePendingIfNeeded(String nombre, String email, String telefono) {
        log.info("Ensuring Google register request email={}", email);

        if (solicitudRegistroRepository.findByEmailAndEstado(email, EstadoSolicitudRegistro.PENDIENTE).isPresent()) {
            return;
        }

        String normalizedPhone = normalizePhone(telefono);
        if (normalizedPhone != null) {
            solicitudRegistroRepository.findByTelefonoAndEstado(normalizedPhone, EstadoSolicitudRegistro.PENDIENTE)
                .ifPresent(existing -> {
                    throw new ConflictException("PHONE_PENDING_APPROVAL", "Este telefono ya tiene una solicitud pendiente");
                });
        }
        deleteFinishedRequestsThatBlockRegistration(email, normalizedPhone);

        SolicitudRegistro solicitud = new SolicitudRegistro();
        solicitud.setNombre(nombre);
        solicitud.setEmail(email);
        solicitud.setTelefono(normalizedPhone);
        solicitud.setPasswordHash(GOOGLE_PENDING_PASSWORD_MARKER);
        solicitud.setEstado(EstadoSolicitudRegistro.PENDIENTE);

        SolicitudRegistro saved = solicitudRegistroRepository.save(solicitud);

        String adminMessage = String.format(
            "Nueva solicitud de registro con Google pendiente.\n\nSolicitud ID: %d\nNombre: %s\nEmail: %s\nTelefono: %s\n\nRevisa las solicitudes pendientes en la aplicacion.",
            saved.getId(),
            saved.getNombre(),
            saved.getEmail(),
            saved.getTelefono() == null ? "-" : saved.getTelefono()
        );
        List<Usuario> reviewers = usuarioRepository.findByRolInAndActivoTrue(List.of(RolUsuario.BARBERO));
        for (Usuario reviewer : reviewers) {
            notificacionService.createSystemInfo(reviewer, adminMessage);
        }
    }

    /**
     * Lista solicitudes de registro filtradas por estado.
     * Solo barberos y admins pueden acceder.
     *
     * @param actor Usuario autenticado (debe ser barbero o admin)
     * @param estado Filtro opcional de estado (PENDIENTE, APROBADA, RECHAZADA)
     * @return Lista de solicitudes como DTOs
     * @throws ForbiddenException Si actor no es barbero ni admin
     */
    @Transactional(readOnly = true)
    public List<SolicitudRegistroDto> list(Usuario actor, EstadoSolicitudRegistro estado) {
        assertReviewerRole(actor);
        List<SolicitudRegistro> rows = estado == null
            ? solicitudRegistroRepository.findAllByOrderByCreadaEnDesc()
            : solicitudRegistroRepository.findByEstadoOrderByCreadaEnDesc(estado);
        return rows.stream().map(solicitudRegistroConverter::toDto).toList();
    }

    /**
     * Aprueba una solicitud de registro y crea el usuario definitivo.
     * Solo barberos y admins pueden aprobar.
     * Resuelve el rol final basado en permisos del actor.
     *
     * @param actor Usuario autenticado (barbero o admin)
     * @param solicitudId ID de la solicitud a aprobar
     * @param requestedRole Rol solicitado (CLIENTE, BARBERO). ADMIN no es permitido.
     * @return Solicitud actualizada como DTO con estado APROBADA
     * @throws ForbiddenException Si actor no tiene permisos o intenta aprobar como BARBERO sin ser ADMIN
     * @throws NotFoundException Si la solicitud no existe
     * @throws ValidationException Si la solicitud ya fue procesada o datos están inválidos
     * @throws ConflictException Si email/teléfono ya están registrados
     */
    @Transactional
    public SolicitudRegistroDto approve(Usuario actor, Long solicitudId, RolUsuario requestedRole) {
        assertReviewerRole(actor);
        SolicitudRegistro solicitud = getPendingRequest(solicitudId);
        RolUsuario finalRole = resolveApprovedRole(actor, requestedRole);

        Usuario existingByEmail = usuarioRepository.findByEmail(solicitud.getEmail()).orElse(null);

        if (solicitud.getTelefono() != null && !solicitud.getTelefono().isBlank()
            && usuarioRepository.findByTelefono(solicitud.getTelefono()).isPresent()) {
            Usuario existingByPhone = usuarioRepository.findByTelefono(solicitud.getTelefono()).orElse(null);
            if (existingByPhone != null && (existingByEmail == null || !existingByPhone.getId().equals(existingByEmail.getId()))) {
                throw new ConflictException("PHONE_ALREADY_EXISTS", "El telefono ya esta registrado");
            }
        }

        boolean googleSignup = GOOGLE_PENDING_PASSWORD_MARKER.equals(solicitud.getPasswordHash());
        if (googleSignup) {
            throw new ValidationException(
                "GOOGLE_REGISTRATION_REQUIRES_PASSWORD",
                "Esta solicitud antigua de Google no tiene contrasena. Rechazala y pide al cliente que se registre de nuevo con Google anadiendo contrasena."
            );
        }

        Usuario target = existingByEmail;
        if (target == null) {
            target = new Usuario();
            target.setEmail(solicitud.getEmail());
        } else if (Boolean.TRUE.equals(target.getActivo())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "El email ya esta registrado");
        }

        target.setNombre(solicitud.getNombre());
        target.setTelefono(solicitud.getTelefono());
        target.setRol(finalRole);
        target.setActivo(true);
        target.setProvider(googleSignup ? AuthProvider.GOOGLE : AuthProvider.LOCAL);
        target.setPasswordHash(googleSignup ? null : solicitud.getPasswordHash());
        usuarioRepository.save(target);

        solicitud.setEstado(EstadoSolicitudRegistro.APROBADA);
        solicitud.setMotivoRechazo(null);
        solicitud.setRevisadoPor(actor);
        SolicitudRegistro saved = solicitudRegistroRepository.save(solicitud);
        return solicitudRegistroConverter.toDto(saved);
    }

    /**
     * Resuelve el rol final al aprobar una solicitud.
     * Solo ADMIN puede aprobar como BARBERO.
     */
    private RolUsuario resolveApprovedRole(Usuario actor, RolUsuario requestedRole) {
        if (requestedRole == null) {
            return RolUsuario.CLIENTE;
        }
        if (requestedRole == RolUsuario.ADMIN) {
            throw new ValidationException("INVALID_APPROVAL_ROLE", "No se puede aprobar una solicitud como ADMIN");
        }
        if (requestedRole == RolUsuario.BARBERO && actor.getRol() != RolUsuario.ADMIN) {
            throw new ForbiddenException("FORBIDDEN_APPROVAL_ROLE", "Solo un ADMIN puede aprobar como BARBERO");
        }
        return requestedRole;
    }

    /**
     * Rechaza una solicitud de registro pendiente.
     * Solo barberos y admins pueden rechazar.
     * Registra el motivo del rechazo.
     *
     * @param actor Usuario autenticado (barbero o admin)
     * @param solicitudId ID de la solicitud a rechazar
     * @param motivo Descripción del motivo de rechazo
     * @return Solicitud actualizada como DTO con estado RECHAZADA
     * @throws ForbiddenException Si actor no tiene permisos
     * @throws NotFoundException Si la solicitud no existe
     * @throws ValidationException Si la solicitud ya fue procesada
     */
    @Transactional
    public SolicitudRegistroDto reject(Usuario actor, Long solicitudId, String motivo) {
        assertReviewerRole(actor);
        SolicitudRegistro solicitud = getPendingRequest(solicitudId);
        solicitud.setEstado(EstadoSolicitudRegistro.RECHAZADA);
        solicitud.setMotivoRechazo(motivo);
        solicitud.setRevisadoPor(actor);
        SolicitudRegistro saved = solicitudRegistroRepository.save(solicitud);
        return solicitudRegistroConverter.toDto(saved);
    }

    /**
     * Obtiene solicitud pendiente por id.
     */
    private SolicitudRegistro getPendingRequest(Long solicitudId) {
        SolicitudRegistro solicitud = solicitudRegistroRepository.findById(solicitudId)
            .orElseThrow(() -> new NotFoundException("REGISTER_REQUEST_NOT_FOUND", "Solicitud no encontrada"));
        if (solicitud.getEstado() != EstadoSolicitudRegistro.PENDIENTE) {
            throw new ValidationException("REGISTER_REQUEST_NOT_PENDING", "La solicitud ya fue procesada");
        }
        return solicitud;
    }

    /**
     * Normaliza telefono vacio a null.
     */
    private String normalizePhone(String telefono) {
        if (telefono == null) {
            return null;
        }
        String trimmed = telefono.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Borra solicitudes ya resueltas que impiden volver a registrarse tras eliminar cuenta.
     */
    private void deleteFinishedRequestsThatBlockRegistration(String email, String telefono) {
        solicitudRegistroRepository.deleteFinishedByEmailOrTelefono(
            email,
            telefono,
            EstadoSolicitudRegistro.PENDIENTE
        );
    }

    /**
     * Verifica que el actor pueda revisar solicitudes.
     */
    private void assertReviewerRole(Usuario actor) {
        if (actor.getRol() == RolUsuario.BARBERO || actor.getRol() == RolUsuario.ADMIN) {
            return;
        }
        throw new ForbiddenException("FORBIDDEN_REGISTER_REQUEST_REVIEW", "No tienes permisos para revisar solicitudes");
    }
}
