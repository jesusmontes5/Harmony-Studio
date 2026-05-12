CREATE DATABASE IF NOT EXISTS TFG_Barberia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE TFG_Barberia;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NULL,
    provider ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL',
    rol ENUM('CLIENTE','BARBERO','ADMIN') NOT NULL DEFAULT 'CLIENTE',
    avatar_url VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    duracion_minutos INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS horarios_barbero_fecha (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    barbero_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_horario_rango CHECK (hora_inicio < hora_fin),
    CONSTRAINT uq_horario_barbero_fecha UNIQUE (barbero_id, fecha, hora_inicio, hora_fin),
    CONSTRAINT fk_horario_barbero FOREIGN KEY (barbero_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    barbero_id BIGINT NOT NULL,
    fecha DATE NULL,
    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    estado ENUM('PENDIENTE_HORA','PENDIENTE','CANCELADA','COMPLETADA','NO_PRESENTADO') NOT NULL DEFAULT 'PENDIENTE',
    observaciones_cliente VARCHAR(255),
    observaciones_barbero TEXT,
    motivo_cancelacion VARCHAR(255),
    precio_total DECIMAL(10,2),
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_reserva_rango CHECK (
        (fecha_inicio IS NULL AND fecha_fin IS NULL)
        OR (fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL AND fecha_inicio < fecha_fin)
    ),
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (cliente_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_barbero FOREIGN KEY (barbero_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reserva_servicios (
    reserva_id BIGINT NOT NULL,
    servicio_id BIGINT NOT NULL,
    precio_aplicado DECIMAL(10,2) NOT NULL,
    duracion_aplicada_minutos INT NOT NULL,
    PRIMARY KEY (reserva_id, servicio_id),
    CONSTRAINT fk_rs_reserva FOREIGN KEY (reserva_id)
        REFERENCES reservas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rs_servicio FOREIGN KEY (servicio_id)
        REFERENCES servicios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    reserva_id BIGINT NULL,
    tipo ENUM('RECORDATORIO_24H','RECORDATORIO_DIA','CANCELACION','INFORMACION') NOT NULL,
    canal ENUM('EMAIL') NOT NULL DEFAULT 'EMAIL',
    mensaje VARCHAR(500) NOT NULL,
    fecha_programada DATETIME NOT NULL,
    enviada BOOLEAN NOT NULL DEFAULT FALSE,
    enviada_en DATETIME NULL,
    error_envio VARCHAR(500) NULL,
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_notif_reserva FOREIGN KEY (reserva_id)
        REFERENCES reservas(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resenas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reserva_id BIGINT NULL UNIQUE,
    cliente_id BIGINT NOT NULL,
    barbero_id BIGINT NOT NULL,
    puntuacion TINYINT NOT NULL,
    comentario TEXT,
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_resena_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    CONSTRAINT fk_resena_reserva FOREIGN KEY (reserva_id)
        REFERENCES reservas(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_resena_cliente FOREIGN KEY (cliente_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_resena_barbero FOREIGN KEY (barbero_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS solicitudes_registro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('PENDIENTE','APROBADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
    motivo_rechazo VARCHAR(255) NULL,
    revisado_por BIGINT NULL,
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitud_revisado FOREIGN KEY (revisado_por)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tablon_mensajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(140) NOT NULL,
    mensaje VARCHAR(2000) NOT NULL,
    autor_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tablon_autor FOREIGN KEY (autor_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_reservas_barbero_fecha ON reservas (barbero_id, fecha_inicio);
CREATE INDEX idx_reservas_cliente_fecha ON reservas (cliente_id, fecha_inicio);
CREATE INDEX idx_reservas_barbero_fecha_pendiente ON reservas (barbero_id, fecha, estado);
CREATE INDEX idx_reservas_estado ON reservas (estado);
CREATE INDEX idx_horarios_barbero_fecha ON horarios_barbero_fecha (barbero_id, fecha, hora_inicio);
CREATE INDEX idx_notif_pendientes ON notificaciones (enviada, fecha_programada);
CREATE INDEX idx_notif_usuario ON notificaciones (usuario_id);


CREATE INDEX idx_solicitudes_estado ON solicitudes_registro (estado);
CREATE INDEX idx_tablon_activo_actualizado ON tablon_mensajes (activo, actualizado_en);


-- Refuerza en base de datos las transiciones de estado de reservas.
-- Aunque el backend ya valida estas reglas, este trigger evita cambios incoherentes
-- si alguien actualiza la tabla reservas directamente desde MySQL.
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
