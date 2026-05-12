package org.vedruna.barberia.modules.reservas.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.entity.Reserva;

/**
 * Repositorio de reservas.
 */
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    /**
     * Lista reservas de un cliente con filtros opcionales.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.cliente.id = :clienteId
          AND (:estado IS NULL OR r.estado = :estado)
          AND (:desde IS NULL OR r.fechaInicio >= :desde)
          AND (:hasta IS NULL OR r.fechaInicio <= :hasta)
        ORDER BY r.fechaInicio DESC
        """)
    List<Reserva> findForCliente(@Param("clienteId") Long clienteId,
                                 @Param("estado") EstadoReserva estado,
                                 @Param("desde") LocalDateTime desde,
                                 @Param("hasta") LocalDateTime hasta);

    /**
     * Lista reservas de un barbero con filtros opcionales.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.barbero.id = :barberoId
          AND (:estado IS NULL OR r.estado = :estado)
          AND (:desde IS NULL OR r.fechaInicio >= :desde)
          AND (:hasta IS NULL OR r.fechaInicio <= :hasta)
        ORDER BY r.fechaInicio DESC
        """)
    List<Reserva> findForBarbero(@Param("barberoId") Long barberoId,
                                 @Param("estado") EstadoReserva estado,
                                 @Param("desde") LocalDateTime desde,
                                 @Param("hasta") LocalDateTime hasta);

    /**
     * Lista reservas global para administrador con filtros opcionales.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE (:barberoId IS NULL OR r.barbero.id = :barberoId)
          AND (:estado IS NULL OR r.estado = :estado)
          AND (:desde IS NULL OR r.fechaInicio >= :desde)
          AND (:hasta IS NULL OR r.fechaInicio <= :hasta)
        ORDER BY r.fechaInicio DESC
        """)
    List<Reserva> findForAdmin(@Param("barberoId") Long barberoId,
                               @Param("estado") EstadoReserva estado,
                               @Param("desde") LocalDateTime desde,
                               @Param("hasta") LocalDateTime hasta);

    /**
     * Valida existencia de solape para un barbero excluyendo canceladas.
     */
    @Query("""
        SELECT COUNT(r) > 0
        FROM Reserva r
        WHERE r.barbero.id = :barberoId
          AND r.estado NOT IN (
              org.vedruna.barberia.modules.reservas.entity.EstadoReserva.CANCELADA,
              org.vedruna.barberia.modules.reservas.entity.EstadoReserva.PENDIENTE_HORA
          )
          AND r.fechaInicio IS NOT NULL
          AND r.fechaFin IS NOT NULL
          AND r.fechaInicio < :fin
          AND r.fechaFin > :inicio
        """)
    boolean existsOverlap(@Param("barberoId") Long barberoId,
                          @Param("inicio") LocalDateTime inicio,
                          @Param("fin") LocalDateTime fin);

    /**
     * Lista reservas activas de un barbero que se solapan con un rango.
     *
     * @param barberoId id del barbero.
     * @param fin fecha fin del tramo candidato.
     * @param inicio fecha inicio del tramo candidato.
     * @param estado estado excluido (cancelada).
     * @return reservas solapadas.
     */
    List<Reserva> findByBarberoIdAndFechaInicioLessThanAndFechaFinGreaterThanAndEstadoNot(
        Long barberoId,
        LocalDateTime fin,
        LocalDateTime inicio,
        EstadoReserva estado
    );

    /**
     * Lista reservas con hora que bloquean un rango concreto.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.barbero.id = :barberoId
          AND r.estado NOT IN (
              org.vedruna.barberia.modules.reservas.entity.EstadoReserva.CANCELADA,
              org.vedruna.barberia.modules.reservas.entity.EstadoReserva.PENDIENTE_HORA
          )
          AND r.fechaInicio IS NOT NULL
          AND r.fechaFin IS NOT NULL
          AND r.fechaInicio < :fin
          AND r.fechaFin > :inicio
        """)
    List<Reserva> findBlockingOverlaps(@Param("barberoId") Long barberoId,
                                        @Param("inicio") LocalDateTime inicio,
                                        @Param("fin") LocalDateTime fin);

    /**
     * Lista reservas con hora y estado sensible que se solapan con un tramo de horario.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.barbero.id = :barberoId
          AND r.estado IN :estados
          AND r.fechaInicio IS NOT NULL
          AND r.fechaFin IS NOT NULL
          AND r.fechaInicio < :fin
          AND r.fechaFin > :inicio
        """)
    List<Reserva> findScheduledOverlapsByEstados(@Param("barberoId") Long barberoId,
                                                 @Param("estados") Set<EstadoReserva> estados,
                                                 @Param("inicio") LocalDateTime inicio,
                                                 @Param("fin") LocalDateTime fin);

    /**
     * Lista citas sin hora de un barbero en una fecha.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.barbero.id = :barberoId
          AND r.estado = org.vedruna.barberia.modules.reservas.entity.EstadoReserva.PENDIENTE_HORA
          AND r.fecha = :fecha
        ORDER BY r.creadaEn ASC
        """)
    List<Reserva> findPendingTimeForBarberoAndFecha(@Param("barberoId") Long barberoId,
                                                    @Param("fecha") LocalDate fecha);

    /**
     * Comprueba si un cliente ya tiene una reserva activa en estados dados.
     *
     * @param clienteId id del cliente.
     * @param estados estados considerados activos.
     * @return true si existe al menos una reserva activa.
     */
    boolean existsByClienteIdAndEstadoIn(Long clienteId, Set<EstadoReserva> estados);

    /**
     * Elimina todas las reservas de un cliente.
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Reserva r WHERE r.cliente.id = :clienteId")
    int deleteByClienteId(Long clienteId);

    /**
     * Elimina todas las reservas de un barbero.
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Reserva r WHERE r.barbero.id = :barberoId")
    int deleteByBarberoId(Long barberoId);
}
