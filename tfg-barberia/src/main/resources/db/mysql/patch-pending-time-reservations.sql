-- Ejecutar una vez sobre una base de datos existente antes de arrancar la app.
-- Permite crear citas pendientes de hora y asignarlas despues desde la agenda.

ALTER TABLE reservas
    ADD COLUMN fecha DATE NULL AFTER barbero_id;

UPDATE reservas
SET fecha = DATE(fecha_inicio)
WHERE fecha IS NULL AND fecha_inicio IS NOT NULL;

ALTER TABLE reservas
    MODIFY fecha_inicio DATETIME NULL,
    MODIFY fecha_fin DATETIME NULL,
    MODIFY estado ENUM('PENDIENTE_HORA','PENDIENTE','CANCELADA','COMPLETADA','NO_PRESENTADO') NOT NULL DEFAULT 'PENDIENTE';

ALTER TABLE reservas
    DROP CHECK chk_reserva_rango;

ALTER TABLE reservas
    ADD CONSTRAINT chk_reserva_rango CHECK (
        (fecha_inicio IS NULL AND fecha_fin IS NULL)
        OR (fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL AND fecha_inicio < fecha_fin)
    );

CREATE INDEX idx_reservas_barbero_fecha_pendiente ON reservas (barbero_id, fecha, estado);

DROP TRIGGER IF EXISTS tr_reservas_validar_transicion_estado;

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
