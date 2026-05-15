---
title: Arquitectura
description: Vision general de la arquitectura tecnica del proyecto.
---

# Arquitectura

Harmony Studio esta dividido en dos aplicaciones principales:

- `frontend-barberia`: aplicacion React con Vite, TailwindCSS, React Router y Framer Motion.
- `tfg-barberia`: API REST con Spring Boot, Spring Security, Spring Data JPA, JWT, Swagger/OpenAPI y MySQL.

## Frontend

El frontend consume la API mediante Axios. Usa rutas protegidas, contexto de autenticacion, componentes reutilizables y carga diferida de paginas para mejorar el rendimiento inicial.

Rutas principales:

- `/` Inicio
- `/login` Inicio de sesion
- `/register` Registro
- `/completar-perfil` Completar datos obligatorios de perfil
- `/reservas` Reservas del cliente
- `/perfil` Perfil
- `/panel` Panel del barbero
- `/dashboard` Redireccion historica a `/panel`
- `/mi-horario` Horario y agenda
- `/gestion-reservas` Redireccion historica a `/mi-horario`
- `/mis-resenas` Resenas
- `/clientes` Clientes y solicitudes
- `/gestion-servicios` Servicios

## Backend

El backend organiza la logica por modulos:

- `auth`: registro, login, Google OAuth y usuario autenticado.
- `users`: gestion de usuarios, clientes y perfil.
- `reservas`: creacion, consulta y cambio de estado de reservas.
- `availability`: calculo de huecos disponibles.
- `schedule`: horarios concretos por fecha y agenda diaria.
- `servicios`: servicios ofrecidos por la barberia.
- `reviews`: resenas de clientes.
- `registration`: aprobacion o rechazo de solicitudes.
- `notifications`: notificaciones pendientes.
- `tablon`: mensajes visibles en el inicio.

## Servicios externos

- Google OAuth para inicio de sesion social.
- SMTP para envio de recordatorios y avisos por email cuando esta habilitado.
- Cloudinary para subida de imagenes de avatar desde el perfil.

## Seguridad

La autenticacion se basa en JWT. Spring Security protege endpoints por rol y valida el usuario en cada peticion mediante filtro de autenticacion. Existen roles `CLIENTE`, `BARBERO` y `ADMIN`.

## Base de datos

La base de datos MySQL incluye tablas relacionales, claves foraneas, indices y un trigger para validar transiciones de estado de reservas.

## Despliegue

El despliegue actual usa una maquina virtual de Azure con Docker Compose:

- `front`: contenedor Nginx que sirve la build estatica de React y redirige `/api` al backend.
- `service`: contenedor Spring Boot que expone la API interna en el puerto `8080`.
- `Azure Database for MySQL Flexible Server`: base de datos externa gestionada por Azure.

La aplicacion publica solo el puerto `80` de la VM. El backend no queda expuesto directamente a internet; se accede mediante el proxy `/api` configurado en Nginx.

```text
http://158.158.2.243/      -> frontend
http://158.158.2.243/api   -> backend mediante proxy
```
