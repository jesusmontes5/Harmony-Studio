-- Patch para conservar resenas de clientes que eliminan su cuenta.
-- Cambia la FK de resenas.reserva_id de ON DELETE CASCADE a ON DELETE SET NULL.
-- Asi, al borrar reservas del cliente, las resenas se conservan con reserva_id = NULL.
-- Ejecutar una vez sobre una base de datos existente antes de arrancar la app.
-- Es robusto si la FK ya fue eliminada en un intento previo.

SET @fk_name := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'resenas'
      AND COLUMN_NAME = 'reserva_id'
      AND REFERENCED_TABLE_NAME = 'reservas'
    LIMIT 1
);

SET @drop_fk_sql := IF(
    @fk_name IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE resenas DROP FOREIGN KEY `', @fk_name, '`')
);

PREPARE drop_fk_stmt FROM @drop_fk_sql;
EXECUTE drop_fk_stmt;
DEALLOCATE PREPARE drop_fk_stmt;

ALTER TABLE resenas
    MODIFY reserva_id BIGINT NULL;

ALTER TABLE resenas
    ADD CONSTRAINT fk_resena_reserva FOREIGN KEY (reserva_id)
        REFERENCES reservas(id) ON UPDATE CASCADE ON DELETE SET NULL;
