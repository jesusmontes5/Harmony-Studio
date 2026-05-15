-- Datos semilla opcionales para pruebas locales.
-- La aplicacion no ejecuta este archivo automaticamente porque application.yml
-- tiene spring.sql.init.mode=never. Si tu base ya tiene datos reales/manuales,
-- puedes ignorar este script.

INSERT INTO usuarios (id, nombre, email, telefono, password_hash, provider, rol, activo)
VALUES
    (1, 'admin', 'admin@gmail.com', '600000001', '$2a$10$8vnKWH.lMbjuKq2oGUfrvOdbQ0ab0GqTzpjYRs0s3PssZny3E4DHW', 'LOCAL', 'ADMIN', TRUE),
    (2, 'barbero', 'barbero@gmail.com', '600000002', '$2a$10$8vnKWH.lMbjuKq2oGUfrvOdbQ0ab0GqTzpjYRs0s3PssZny3E4DHW', 'LOCAL', 'BARBERO', TRUE),
    (3, 'cliente', 'cliente@gmail.com', '600000003', '$2a$10$8vnKWH.lMbjuKq2oGUfrvOdbQ0ab0GqTzpjYRs0s3PssZny3E4DHW', 'LOCAL', 'CLIENTE', TRUE);

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
VALUES
    (1, 'Corte', 'Corte de pelo', 30, 10.00, TRUE),
    (2, 'Arreglo de cejas', 'Arreglo de cejas', 10, 5.00, TRUE),
    (3, 'Corte mas cejas', 'Corte de pelo y arreglo de cejas', 40, 13.00, TRUE);

INSERT INTO horarios_barbero_fecha (barbero_id, fecha, hora_inicio, hora_fin)
VALUES
    (2, '2026-03-02', '10:00:00', '20:00:00'),
    (2, '2026-03-03', '10:00:00', '20:00:00'),
    (2, '2026-03-04', '10:00:00', '20:00:00'),
    (2, '2026-03-05', '10:00:00', '20:00:00'),
    (2, '2026-03-06', '10:00:00', '20:00:00'),
    (2, '2026-03-07', '10:00:00', '20:00:00');
