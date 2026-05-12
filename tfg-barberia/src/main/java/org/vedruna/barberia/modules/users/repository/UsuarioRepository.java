package org.vedruna.barberia.modules.users.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vedruna.barberia.modules.users.entity.RolUsuario;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Repositorio JPA para la entidad {@link Usuario}.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario por email.
     *
     * @param email email unico.
     * @return usuario opcional.
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Busca usuario por telefono.
     *
     * @param telefono numero de telefono.
     * @return usuario opcional.
     */
    Optional<Usuario> findByTelefono(String telefono);

    /**
     * Lista usuarios filtrando por rol, activo y texto libre.
     *
     * @param rol rol opcional.
     * @param activo estado opcional.
     * @param q texto opcional sobre nombre/email/telefono.
     * @return lista de usuarios que cumplen filtros.
     */
    @Query("""
        SELECT u FROM Usuario u
        WHERE (:rol IS NULL OR u.rol = :rol)
          AND (:activo IS NULL OR u.activo = :activo)
          AND u.email <> 'deleted-user@system.local'
          AND (:q IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(COALESCE(u.telefono, '')) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY u.creadoEn DESC
        """)
    List<Usuario> search(@Param("rol") RolUsuario rol, @Param("activo") Boolean activo, @Param("q") String q);

    /**
     * Busca destinatarios activos por rol.
     */
    List<Usuario> findByRolInAndActivoTrue(List<RolUsuario> roles);
}
