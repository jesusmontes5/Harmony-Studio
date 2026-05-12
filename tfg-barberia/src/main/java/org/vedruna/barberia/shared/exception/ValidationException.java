package org.vedruna.barberia.shared.exception;

/**
 * Excepcion para errores de validacion de reglas de negocio.
 */
public class ValidationException extends ApiException {

    /**
     * @param code codigo funcional.
     * @param message mensaje detallado.
     */
    public ValidationException(String code, String message) {
        super(400, code, message);
    }
}
