package org.vedruna.barberia.modules.tablon.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.vedruna.barberia.modules.tablon.entity.TablonMensaje;

/**
 * Repositorio de mensajes del tablon.
 */
public interface TablonMensajeRepository extends JpaRepository<TablonMensaje, Long> {

    /**
     * Lista mensajes activos de mas reciente a mas antiguo.
     */
    List<TablonMensaje> findByActivoTrueOrderByActualizadoEnDescIdDesc();

    /**
     * Elimina todos los mensajes de un usuario (como autor).
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM TablonMensaje t WHERE t.autor.id = :autorId")
    int deleteByAutorId(Long autorId);
}
