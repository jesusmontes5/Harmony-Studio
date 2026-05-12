---
title: Casos de prueba
description: Casos de prueba funcionales para validar el comportamiento principal.
---

# Casos de prueba

Esta tabla recoge pruebas funcionales que cubren los flujos principales de Harmony Studio. Sirven como base para la validacion manual y para futuros tests automatizados.

| ID | Caso | Rol | Precondicion | Pasos | Resultado esperado |
| --- | --- | --- | --- | --- | --- |
| CP-01 | Registro de cliente | Visitante | No existe usuario con el email indicado | Entrar en `/register`, completar datos validos y enviar | Se crea una solicitud pendiente de aprobacion |
| CP-02 | Login correcto | Cliente/Barbero | Usuario activo y aprobado | Entrar en `/login`, introducir credenciales validas | Se recibe token JWT y se redirige al inicio |
| CP-03 | Login incorrecto | Visitante | Usuario inexistente o contrasena incorrecta | Enviar credenciales no validas | Se muestra mensaje de error y no se inicia sesion |
| CP-04 | Acceso protegido | Cliente | Usuario con rol `CLIENTE` | Intentar acceder a `/panel` | La ruta queda bloqueada o redirigida |
| CP-05 | Consulta de disponibilidad | Cliente | Barbero con horario configurado | Seleccionar barbero y fecha en reservas | Se muestran solo huecos futuros y libres |
| CP-06 | Crear reserva | Cliente | Hueco disponible y servicio activo | Seleccionar servicio, hora y confirmar | Se crea reserva activa asociada al cliente |
| CP-07 | Evitar solape de reserva | Cliente | Ya existe reserva en el mismo tramo | Intentar reservar el mismo hueco | Backend rechaza la reserva |
| CP-08 | Cancelar reserva | Cliente/Barbero | Reserva activa | Pulsar cancelar, introducir motivo y confirmar | Reserva pasa a estado cancelado con motivo |
| CP-09 | Marcar no presentado | Barbero | Reserva asignada al cliente | Cambiar estado a no presentado | Cliente queda inactivo/bloqueado y reserva actualizada |
| CP-10 | Gestionar horario | Barbero | Usuario con rol `BARBERO` | Crear o eliminar tramos y guardar | El horario se reemplaza correctamente |
| CP-11 | Aprobar solicitud | Barbero/Admin | Existe solicitud pendiente | Aprobar desde clientes | Se activa el usuario solicitado |
| CP-12 | Rechazar solicitud | Barbero/Admin | Existe solicitud pendiente | Rechazar desde clientes | La solicitud queda rechazada |
| CP-13 | Crear servicio | Barbero/Admin | Datos validos | Crear servicio desde gestion de servicios | Servicio aparece en listado y puede reservarse |
| CP-14 | Desactivar servicio | Barbero/Admin | Servicio existente | Eliminar/desactivar servicio | Servicio deja de aparecer como reservable |
| CP-15 | Publicar mensaje en tablon | Barbero/Admin | Usuario autenticado | Crear aviso desde inicio | Mensaje aparece en el tablon informativo |
| CP-16 | Eliminar mensaje del tablon | Barbero/Admin | Mensaje existente | Pulsar eliminar y confirmar | Mensaje desaparece del tablon |
| CP-17 | Crear resena | Cliente | Reserva completada sin resena previa | Enviar puntuacion y comentario | Resena queda asociada a reserva y barbero |
| CP-18 | Eliminar cuenta | Cliente | Usuario autenticado | Confirmar eliminacion desde perfil | Cuenta queda eliminada y sus resenas historicas se conservan anonimizadas si procede |

## Pruebas tecnicas recomendadas

- Ejecutar build del frontend:

```bash
cd frontend-barberia
npm run build
```

- Ejecutar tests del backend:

```bash
cd tfg-barberia
.\mvnw.cmd test
```

- Revisar Swagger local:

```text
http://localhost:8080/swagger-ui.html
```

## Criterios generales de aceptacion

- La aplicacion debe ser usable desde movil.
- Las rutas privadas no deben ser accesibles sin autenticacion.
- Las rutas de barbero/admin no deben ser accesibles por clientes.
- Las reservas no pueden solaparse.
- Los horarios eliminados deben dejar de generar disponibilidad.
- Los errores deben mostrarse de forma clara en la interfaz.
