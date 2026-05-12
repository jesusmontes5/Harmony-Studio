package org.vedruna.barberia.modules.reviews.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.reviews.entity.Resena;

/**
 * Repositorio de resenas.
 */
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    /**
     * Verifica si ya existe resena para la reserva.
     *
     * @param reservaId id de la reserva.
     * @return true si existe.
     */
    boolean existsByReservaId(Long reservaId);

    /**
     * Lista resenas de un barbero.
     *
     * @param barberoId id del barbero.
     * @return lista de resenas ordenadas por fecha descendente.
     */
    List<Resena> findByBarberoIdOrderByCreadaEnDesc(Long barberoId);

    /**
     * Obtiene promedio de puntuacion para un barbero.
     *
     * @param barberoId id del barbero.
     * @return promedio o null si no hay datos.
     */
    @Query("SELECT AVG(r.puntuacion) FROM Resena r WHERE r.barbero.id = :barberoId")
    Double avgByBarbero(@Param("barberoId") Long barberoId);

    /**
     * Elimina todas las resenas donde el usuario es el barbero reseñado.
     */
    @Modifying
    @Query("DELETE FROM Resena r WHERE r.barbero.id = :barberoId")
    int deleteByBarberoId(@Param("barberoId") Long barberoId);

    /**
     * Anonimiza las resenas escritas por un cliente: desvincula la reserva
     * y reasigna el autor al usuario tecnico de borrado.
     */
    @Modifying
    @Query(value = "UPDATE resenas SET reserva_id = NULL, cliente_id = :deletedUserId WHERE cliente_id = :clienteId", nativeQuery = true)
    int anonymizeCliente(@Param("clienteId") Long clienteId, @Param("deletedUserId") Long deletedUserId);
}
