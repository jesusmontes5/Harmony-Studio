-- Ejecutar una vez sobre una base de datos existente.
-- Elimina el estado CONFIRMADA porque el flujo real pasa de PENDIENTE a
-- COMPLETADA, NO_PRESENTADO o CANCELADA.

UPDATE reservas
SET estado = 'PENDIENTE'
WHERE estado = 'CONFIRMADA';

DROP TRIGGER IF EXISTS tr_reservas_validar_transicion_estado;

ALTER TABLE reservas
    MODIFY estado ENUM('PENDIENTE_HORA','PENDIENTE','CANCELADA','COMPLETADA','NO_PRESENTADO') NOT NULL DEFAULT 'PENDIENTE';

DELIMITER //

CREATE TRIGGER tr_reservas_validar_transicion_estado
BEFORE UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.estado <> OLD.estado THEN
        IF OLD.estado IN ('CANCELADA', 'COMPLETADA', 'NO_PRESENTADO') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'No se puede modificar una reserva en estado final';
        END IF;

        IF OLD.estado = 'PENDIENTE_HORA'
           AND NEW.estado NOT IN ('PENDIENTE', 'CANCELADA') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Transicion de estado no permitida desde PENDIENTE_HORA';
        END IF;

        IF OLD.estado = 'PENDIENTE'
           AND NEW.estado NOT IN ('CANCELADA', 'COMPLETADA', 'NO_PRESENTADO') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Transicion de estado no permitida desde PENDIENTE';
        END IF;
    END IF;
END //

DELIMITER ;
