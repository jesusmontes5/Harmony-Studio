package org.vedruna.barberia.modules.schedule.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.vedruna.barberia.modules.schedule.entity.HorarioBarbero;

/**
 * Repositorio para horarios por fecha de barbero.
 */
public interface HorarioBarberoRepository extends JpaRepository<HorarioBarbero, Long> {

    /**
     * Lista tramos horarios de un barbero ordenados por fecha y hora.
     *
     * @param barberoId id del barbero.
     * @return lista de tramos.
     */
    List<HorarioBarbero> findByBarberoIdOrderByFechaAscHoraInicioAsc(Long barberoId);

    /**
     * Lista tramos de una fecha concreta para un barbero.
     *
     * @param barberoId id del barbero.
     * @param fecha fecha buscada.
     * @return lista de tramos.
     */
    List<HorarioBarbero> findByBarberoIdAndFechaOrderByHoraInicioAsc(Long barberoId, LocalDate fecha);

    /**
     * Elimina todos los tramos de un barbero mediante DELETE directo.
     * Usa query nativa para evitar problemas de persistence context al reemplazar horarios.
     *
     * @param barberoId id del barbero.
     */
    @Modifying
    @Query("DELETE FROM HorarioBarbero h WHERE h.barbero.id = :barberoId")
    int deleteByBarberoId(Long barberoId);
}
