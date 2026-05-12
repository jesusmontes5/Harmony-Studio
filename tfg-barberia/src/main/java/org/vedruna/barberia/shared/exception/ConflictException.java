package org.vedruna.barberia.shared.exception;

/**
 * Excepcion para conflictos de negocio (duplicados, estados incompatibles, etc.).
 */
public class ConflictException extends ApiException {

    /**
     * @param code codigo funcional.
     * @param message mensaje detallado.
     */
    public ConflictException(String code, String message) {
        super(409, code, message);
    }
}
