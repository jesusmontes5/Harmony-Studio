package org.vedruna.barberia.modules.reviews.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.entity.Reserva;
import org.vedruna.barberia.modules.reservas.repository.ReservaRepository;
import org.vedruna.barberia.modules.reviews.converter.ResenaConverter;
import org.vedruna.barberia.modules.reviews.dto.BarberoReviewsResponseDto;
import org.vedruna.barberia.modules.reviews.dto.CreateResenaRequestDto;
import org.vedruna.barberia.modules.reviews.dto.ResenaDto;
import org.vedruna.barberia.modules.reviews.entity.Resena;
import org.vedruna.barberia.modules.reviews.repository.ResenaRepository;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.shared.exception.ConflictException;
import org.vedruna.barberia.shared.exception.ForbiddenException;
import org.vedruna.barberia.shared.exception.NotFoundException;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Servicio de gestión de reseñas de barberos.
 * Permite a clientes reseñar barberos y consultar puntajes y promedio.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResenaService {

    /** Repositorio de reseñas. */
    private final ResenaRepository resenaRepository;

    /** Repositorio de reservas para validar elegibilidad. */
    private final ReservaRepository reservaRepository;

    /** Converter reseña a DTO. */
    private final ResenaConverter converter;

    /**
     * Crea una reseña de un barbero por parte del cliente.
     * Solo se puede reseñar reservas completadas, sin reseña previa.
     * El cliente debe ser propietario de la reserva.
     *
     * @param cliente Usuario autenticado (cliente que creó la reserva)
     * @param dto Datos de la reseña (reservaId, puntuación 1-5, comentario)
     * @return Reseña creada como DTO
     * @throws NotFoundException Si la reserva no existe
     * @throws ForbiddenException Si el cliente no es propietario de la reserva
     * @throws ValidationException Si la reserva no está completada
     * @throws ConflictException Si la reserva ya tiene reseña
     */
    @Transactional
    public ResenaDto create(Usuario cliente, CreateResenaRequestDto dto) {
        log.info("Create review clienteId={} reservaId={}", cliente.getId(), dto.getReservaId());

        Reserva reserva = reservaRepository.findById(dto.getReservaId())
            .orElseThrow(() -> new NotFoundException("RESERVATION_NOT_FOUND", "Reserva no encontrada"));

        if (!reserva.getCliente().getId().equals(cliente.getId())) {
            throw new ForbiddenException("REVIEW_FORBIDDEN", "Solo puedes reseñar tus reservas");
        }
        if (reserva.getEstado() != EstadoReserva.COMPLETADA) {
            throw new ValidationException("RESERVATION_NOT_COMPLETED", "Solo se puede reseñar una reserva completada");
        }
        if (resenaRepository.existsByReservaId(reserva.getId())) {
            throw new ConflictException("REVIEW_ALREADY_EXISTS", "La reserva ya tiene reseña");
        }

        Resena entity = new Resena();
        entity.setReserva(reserva);
        entity.setCliente(cliente);
        entity.setBarbero(reserva.getBarbero());
        entity.setPuntuacion(dto.getPuntuacion().byteValue());
        entity.setComentario(dto.getComentario());

        return converter.toDto(resenaRepository.save(entity));
    }

    /**
     * Lista todas las reseñas públicas de un barbero con promedio.
     * Accesible públicamente para que clientes vean puntuación antes de reservar.
     *
     * @param barberoId ID del barbero
     * @return DTO con lista de reseñas y promedio de puntuación
     */
    @Transactional(readOnly = true)
    public BarberoReviewsResponseDto listByBarbero(Long barberoId) {
        log.info("List reviews for barberoId={}", barberoId);
        List<ResenaDto> reviews = resenaRepository.findByBarberoIdOrderByCreadaEnDesc(barberoId)
            .stream()
            .map(converter::toDto)
            .toList();
        Double avg = resenaRepository.avgByBarbero(barberoId);
        return new BarberoReviewsResponseDto(barberoId, avg == null ? 0.0 : avg, reviews);
    }
}
