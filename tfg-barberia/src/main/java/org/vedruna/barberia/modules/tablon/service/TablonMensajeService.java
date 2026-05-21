package org.vedruna.barberia.modules.tablon.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.notifications.service.NotificacionService;
import org.vedruna.barberia.modules.tablon.converter.TablonMensajeConverter;
import org.vedruna.barberia.modules.tablon.dto.CreateTablonMensajeRequestDto;
import org.vedruna.barberia.modules.tablon.dto.TablonMensajeDto;
import org.vedruna.barberia.modules.tablon.dto.UpdateTablonMensajeRequestDto;
import org.vedruna.barberia.modules.tablon.entity.TablonMensaje;
import org.vedruna.barberia.modules.tablon.repository.TablonMensajeRepository;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.shared.exception.NotFoundException;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio de gestión del talón de información.
 * Permite crear, actualizar, listar y eliminar mensajes del talón visible públicamente.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TablonMensajeService {

    /** Formato legible usado para fechas de mensajes en notificaciones. */
    private static final DateTimeFormatter BOARD_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /** Repositorio de tablon. */
    private final TablonMensajeRepository tablonMensajeRepository;

    /** Repositorio de usuarios. */
    private final UsuarioRepository usuarioRepository;

    /** Servicio de notificaciones/email. */
    private final NotificacionService notificacionService;

    /** Converter de entidad a DTO. */
    private final TablonMensajeConverter converter;

    /**
     * Lista todos los mensajes activos del talón públicamente.
     * Accesible sin autenticación.
     *
     * @return Lista de mensajes activos ordenados por más reciente
     */
    @Transactional(readOnly = true)
    public List<TablonMensajeDto> listActive() {
        return tablonMensajeRepository.findByActivoTrueOrderByActualizadoEnDescIdDesc().stream()
            .map(converter::toDto)
            .toList();
    }

    /**
     * Crea un nuevo mensaje en el talón de información.
     * Notifica a todos los clientes de la creación del mensaje.
     *
     * @param dto Datos del mensaje (titulo, contenido/mensaje)
     * @param actor Usuario autenticado (barbero/admin que crea el mensaje)
     * @return Mensaje creado como DTO
     * @throws ValidationException Si titulo o mensaje están vacíos
     */
    @Transactional
    public TablonMensajeDto create(CreateTablonMensajeRequestDto dto, Usuario actor) {
        validateText(dto.getTitulo(), dto.getMensaje());

        TablonMensaje entity = new TablonMensaje();
        entity.setTitulo(dto.getTitulo().trim());
        entity.setMensaje(dto.getMensaje().trim());
        entity.setAutor(actor);
        entity.setActivo(true);

        TablonMensaje saved = tablonMensajeRepository.save(entity);
        notifyClientsAboutNewBoardAnnouncement(actor, saved);
        return converter.toDto(saved);
    }

    /**
     * Actualiza un mensaje existente del talón.
     * Notifica a los clientes de la actualización.
     *
     * @param id ID del mensaje a actualizar
     * @param dto Nuevos datos (titulo, mensaje)
     * @param actor Usuario autenticado (autor del mensaje o admin)
     * @return Mensaje actualizado como DTO
     * @throws NotFoundException Si el mensaje no existe o está eliminado
     * @throws ValidationException Si titulo o mensaje están vacíos
     */
    @Transactional
    public TablonMensajeDto update(Long id, UpdateTablonMensajeRequestDto dto, Usuario actor) {
        validateText(dto.getTitulo(), dto.getMensaje());

        TablonMensaje entity = tablonMensajeRepository.findById(id)
            .filter(TablonMensaje::getActivo)
            .orElseThrow(() -> new NotFoundException("BOARD_MESSAGE_NOT_FOUND", "Mensaje de tablon no encontrado"));

        entity.setTitulo(dto.getTitulo().trim());
        entity.setMensaje(dto.getMensaje().trim());
        entity.setAutor(actor);

        TablonMensaje saved = tablonMensajeRepository.save(entity);
        return converter.toDto(saved);
    }

    /**
     * Elimina (soft delete) un mensaje del talón de información.
     * El mensaje sigue existiendo pero marcado como inactivo.
     *
     * @param id ID del mensaje a eliminar
     * @param actor Usuario autenticado (autor o admin)
     * @throws NotFoundException Si el mensaje no existe o ya está eliminado
     */
    @Transactional
    public void delete(Long id, Usuario actor) {
        TablonMensaje entity = tablonMensajeRepository.findById(id)
            .filter(TablonMensaje::getActivo)
            .orElseThrow(() -> new NotFoundException("BOARD_MESSAGE_NOT_FOUND", "Mensaje de tablon no encontrado"));

        entity.setActivo(false);
        tablonMensajeRepository.save(entity);
    }

    /**
     * Valida contenido minimo de titulo y mensaje.
     */
    private void validateText(String titulo, String mensaje) {
        if (titulo == null || titulo.trim().isEmpty()) {
            throw new ValidationException("BOARD_TITLE_REQUIRED", "El titulo del mensaje es obligatorio");
        }
        if (mensaje == null || mensaje.trim().isEmpty()) {
            throw new ValidationException("BOARD_MESSAGE_REQUIRED", "El contenido del mensaje es obligatorio");
        }
    }

    /**
     * Notifica por email a todos los clientes activos.
     */
    private void notifyClientsAboutNewBoardAnnouncement(Usuario actor, TablonMensaje announcement) {
        List<Usuario> activeClients = usuarioRepository.findByRolInAndActivoTrue(List.of(RolUsuario.CLIENTE));
        if (activeClients.isEmpty()) {
            return;
        }

        String actorName = actor.getNombre() == null || actor.getNombre().isBlank() ? actor.getEmail() : actor.getNombre();
        String now = LocalDateTime.now().format(BOARD_DATE_FORMAT);
        String message = String.format(
            "Hay un nuevo anuncio disponible para los clientes de Harmony Studio.\n\nTitulo: %s\nPublicado por: %s\nFecha de publicacion: %s\n\nPuedes consultarlo desde la pagina principal de la aplicacion.",
            announcement.getTitulo(),
            actorName,
            now
        );

        activeClients.forEach(client -> notificacionService.createSystemInfoAlways(client, message));
        log.info("New board announcement notified clients={} title={}", activeClients.size(), announcement.getTitulo());
    }
}
