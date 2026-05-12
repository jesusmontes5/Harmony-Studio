package org.vedruna.barberia.shared.advice;

import jakarta.validation.ConstraintViolationException;
import java.sql.SQLIntegrityConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.vedruna.barberia.shared.exception.ApiException;

/**
 * Manejador global de excepciones REST.
 *
 * <p>Convierte excepciones del dominio y validaciones a {@link ProblemDetail} para respuestas
 * consistentes.</p>
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Maneja excepciones personalizadas de la aplicacion.
     *
     * @param ex excepcion de dominio.
     * @return detalle de problema RFC7807.
     */
    @ExceptionHandler(ApiException.class)
    public ProblemDetail handleApiException(ApiException ex) {
        log.warn("ApiException: {} - {}", ex.getCode(), ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatus(ex.getStatusCode());
        detail.setTitle(ex.getCode());
        detail.setDetail(ex.getMessage());
        return detail;
    }

    /**
     * Maneja errores de validacion de DTO (@Valid).
     *
     * @param ex excepcion de validacion.
     * @return detalle de problema con status 400.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        detail.setTitle("VALIDATION_ERROR");
        String first = ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .orElse("Request validation failed");
        detail.setDetail(first);
        return detail;
    }

    /**
     * Maneja errores de validacion por constraints directas.
     *
     * @param ex excepcion de constraints.
     * @return detalle de problema con status 400.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("Constraint violation: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        detail.setTitle("VALIDATION_ERROR");
        detail.setDetail(ex.getMessage());
        return detail;
    }

    /**
     * Fallback para cualquier error inesperado.
     *
     * @param ex excepcion no controlada.
     * @return detalle de problema con status 500.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        detail.setTitle("INTERNAL_ERROR");
        detail.setDetail("Unexpected server error");
        return detail;
    }

    /**
     * Maneja violaciones de integridad de datos (unique constraints, foreign keys).
     *
     * @param ex excepcion de integridad.
     * @return detalle de problema con status 409 (Conflict).
     */
    @ExceptionHandler({SQLIntegrityConstraintViolationException.class, JpaSystemException.class})
    public ProblemDetail handleDataIntegrityViolation(Exception ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        detail.setTitle("DATA_CONFLICT");

        String message = ex.getMessage();
        if (message != null && message.contains("Duplicate entry")) {
            detail.setDetail("El registro ya existe (violación de unicidad)");
        } else if (message != null && message.contains("foreign key constraint fails")) {
            detail.setDetail("No se puede eliminar: hay registros relacionados");
        } else {
            detail.setDetail("Conflicto de datos: verifique su solicitud");
        }
        return detail;
    }

    /**
     * Maneja excepciones de acceso a la base de datos.
     *
     * @param ex excepcion de acceso a datos.
     * @return detalle de problema con status 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ProblemDetail handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception", ex);

        // Si es una ApiException, ya fue manejada arriba
        if (ex instanceof ApiException) {
            return handleApiException((ApiException) ex);
        }

        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        detail.setTitle("PROCESSING_ERROR");
        detail.setDetail("Error al procesar la solicitud");
        return detail;
    }
}
