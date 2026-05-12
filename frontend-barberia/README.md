# Frontend Barberia (React + Vite)

Base funcional conectada a backend Spring Boot.

## Configuracion

1. Copia `.env.example` a `.env`
2. Ajusta URL backend:

```bash
VITE_API_URL=http://localhost:8080
```

## Ejecutar

```bash
npm install
npm run dev
```

## Rutas frontend

- `/login`
- `/register`
- `/reservas` (protegida)

## Endpoints backend usados

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /services`
- `GET /availability?barbero_id=&fecha=&servicios=`
- `POST /reservations`
- `GET /reservations`

## Sesion y token

- El token JWT (`accessToken`) se guarda en `localStorage` bajo `barberia_access_token`.
- Se adjunta automaticamente en `Authorization: Bearer <token>` usando interceptor de Axios (`src/api/apiClient.js`).

## Flujos implementados

- Registro con validacion basica de contraseña confirmada.
- Login con estados `loading/error`.
- Redireccion a `/reservas` al iniciar sesion.
- Proteccion de rutas con `ProtectedRoute`.
- Reserva con seleccion de fecha, servicios y slot disponible.
- Creacion de reserva y refresco de disponibilidad + listado de reservas.
