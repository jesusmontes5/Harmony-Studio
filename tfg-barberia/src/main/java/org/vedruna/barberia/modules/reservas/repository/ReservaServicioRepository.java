package org.vedruna.barberia.modules.reservas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.reservas.entity.EstadoReserva;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicio;
import org.vedruna.barberia.modules.reservas.entity.ReservaServicioId;

/**
 * Repositorio del detalle de servicios aplicados por reserva.
 */
public interface ReservaServicioRepository extends JpaRepository<ReservaServicio, ReservaServicioId> {

    /**
     * Recupera el detalle de servicios de una reserva.
     *
     * @param reservaId id de la reserva.
     * @return lista de lineas de servicio.
     */
    List<ReservaServicio> findByReservaId(Long reservaId);

    /**
     * Indica si el servicio aparece en reservas cuyo estado no coincide con el indicado.
     *
     * @param servicioId id del servicio.
     * @param estado estado a excluir de la comprobacion.
     * @return true si existe al menos una referencia en otro estado.
     */
    boolean existsByServicioIdAndReservaEstadoNot(Long servicioId, EstadoReserva estado);

    /**
     * Borra relaciones de un servicio para reservas en un estado concreto.
     *
     * @param servicioId id del servicio.
     * @param estado estado de reserva objetivo.
     * @return numero de filas borradas.
     */
    @Modifying
    @Query("DELETE FROM ReservaServicio rs WHERE rs.servicio.id = :servicioId AND rs.reserva.estado = :estado")
    int deleteByServicioIdAndReservaEstado(@Param("servicioId") Long servicioId,
                                           @Param("estado") EstadoReserva estado);
}
