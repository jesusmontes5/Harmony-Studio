package org.vedruna.barberia.modules.registration.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.registration.entity.EstadoSolicitudRegistro;
import org.vedruna.barberia.modules.registration.entity.SolicitudRegistro;

/**
 * Repositorio para solicitudes de registro.
 */
public interface SolicitudRegistroRepository extends JpaRepository<SolicitudRegistro, Long> {

    /**
     * Busca por email y estado concreto.
     */
    Optional<SolicitudRegistro> findByEmailAndEstado(String email, EstadoSolicitudRegistro estado);

    /**
     * Busca por telefono y estado concreto.
     */
    Optional<SolicitudRegistro> findByTelefonoAndEstado(String telefono, EstadoSolicitudRegistro estado);

    /**
     * Lista solicitudes por estado ordenadas por creacion desc.
     */
    List<SolicitudRegistro> findByEstadoOrderByCreadaEnDesc(EstadoSolicitudRegistro estado);

    /**
     * Lista todas las solicitudes ordenadas por creacion desc.
     */
    List<SolicitudRegistro> findAllByOrderByCreadaEnDesc();

    /**
     * Libera solicitudes historicas que bloquean un nuevo registro.
     */
    @Modifying
    @Query("""
        DELETE FROM SolicitudRegistro s
        WHERE s.estado <> :estado
          AND (s.email = :email OR (:telefono IS NOT NULL AND s.telefono = :telefono))
        """)
    int deleteFinishedByEmailOrTelefono(@Param("email") String email,
                                        @Param("telefono") String telefono,
                                        @Param("estado") EstadoSolicitudRegistro estado);

    /**
     * Elimina solicitudes asociadas a una cuenta borrada.
     */
    @Modifying
    @Query("""
        DELETE FROM SolicitudRegistro s
        WHERE s.email = :email OR (:telefono IS NOT NULL AND s.telefono = :telefono)
        """)
    int deleteByEmailOrTelefono(@Param("email") String email,
                                @Param("telefono") String telefono);
}
