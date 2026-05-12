package org.vedruna.barberia.shared.validation;

import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.vedruna.barberia.shared.exception.ValidationException;

/**
 * Validador de fortaleza de contraseña.
 *
 * <p>Asegura que las contraseñas cumplan requisitos mínimos de seguridad:
 * <ul>
 *   <li>Mínimo 8 caracteres</li>
 *   <li>Al menos una mayúscula</li>
 *   <li>Al menos una minúscula</li>
 *   <li>Al menos un dígito</li>
 *   <li>Al menos un carácter especial (!@#$%^&*)</li>
 * </ul>
 */
@Component
@Slf4j
public class PasswordStrengthValidator {

    /** Expresión regular que valida fortaleza de contraseña. */
    private static final String PASSWORD_REGEX =
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$";

    /** Patron compilado reutilizable para validar contrasenas sin recompilar la regex. */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(PASSWORD_REGEX);

    /** Longitud mínima de contraseña. */
    private static final int MIN_LENGTH = 8;

    /**
     * Valida que la contraseña cumple requisitos de seguridad.
     *
     * @param password contraseña a validar.
     * @throws ValidationException si no cumple requisitos.
     */
    public void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new ValidationException("PASSWORD_REQUIRED", "La contraseña es requerida");
        }

        if (password.length() < MIN_LENGTH) {
            throw new ValidationException(
                "PASSWORD_TOO_SHORT",
                "La contraseña debe tener al menos " + MIN_LENGTH + " caracteres"
            );
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new ValidationException(
                "PASSWORD_WEAK",
                "La contraseña debe contener: mayúscula, minúscula, dígito y carácter especial (!@#$%^&*)"
            );
        }

        log.debug("Password strength validation passed");
    }
}
