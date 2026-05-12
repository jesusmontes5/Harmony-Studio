package org.vedruna.barberia.shared.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.vedruna.barberia.modules.users.entity.Usuario;
import org.vedruna.barberia.modules.users.repository.UsuarioRepository;
import org.vedruna.barberia.shared.exception.UnauthorizedException;
import org.vedruna.barberia.shared.security.adapter.UsuarioUserDetailsAdapter;

/**
 * Implementacion de UserDetailsService basada en email.
 *
 * <p>Retorna UsuarioUserDetailsAdapter que adapta Usuario domain a UserDetails.</p>
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /** Repositorio de usuarios. */
    private final UsuarioRepository usuarioRepository;

    /**
     * Carga usuario por email para autenticacion, adaptado a UserDetails.
     */
    @Override
    public UserDetails loadUserByUsername(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Usuario no encontrado para autenticacion"));
        return new UsuarioUserDetailsAdapter(usuario);
    }
}
