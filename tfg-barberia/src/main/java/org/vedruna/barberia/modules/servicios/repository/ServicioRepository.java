package org.vedruna.barberia.modules.servicios.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.vedruna.barberia.modules.servicios.entity.Servicio;

/**
 * Repositorio JPA de servicios.
 */
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    /**
     * @return lista de servicios activos.
     */
    List<Servicio> findByActivoTrueOrderByNombreAsc();

    /**
     * Obtiene servicios por ids para construccion de reserva.
     *
     * @param ids ids de servicios solicitados.
     * @return lista de servicios encontrados.
     */
    List<Servicio> findByIdIn(List<Long> ids);
}
