package org.vedruna.barberia.shared.security.adapter;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.vedruna.barberia.modules.users.entity.Usuario;

/**
 * Adaptador que implementa {@link UserDetails} para integración con Spring Security.
 *
 * <p>Separa la entidad domain (Usuario) de la infraestructura Spring Security,
 * permitiendo cambiar frameworks sin afectar el dominio.</p>
 */
@RequiredArgsConstructor
public class UsuarioUserDetailsAdapter implements UserDetails {

    /** Usuario domain que será adaptado. */
    private final Usuario usuario;

    /**
     * @return authorities basadas en el rol del usuario.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));
    }

    /**
     * @return hash de contraseña del usuario.
     */
    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }

    /**
     * @return email del usuario como username.
     */
    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    /**
     * @return true si la cuenta no está expirada.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * @return true si la cuenta no está bloqueada.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * @return true si las credenciales no han expirado.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * @return true si la cuenta está activa.
     */
    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(usuario.getActivo());
    }

    /**
     * Método para acceder al usuario domain subyacente.
     *
     * @return instancia de Usuario.
     */
    public Usuario getUsuario() {
        return usuario;
    }
}
