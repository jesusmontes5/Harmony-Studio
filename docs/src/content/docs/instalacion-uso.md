---
title: Instalacion y uso
description: Pasos para instalar, ejecutar y usar Harmony Studio en local.
---

# Instalacion y uso

## Requisitos

- Java 17 o superior.
- Node.js y npm.
- MySQL 8.
- Git.

## Backend

```bash
cd tfg-barberia
copy .env.example .env
.\mvnw.cmd spring-boot:run
```

Variables principales:

```properties
DB_URL=jdbc:mysql://localhost:3306/TFG_Barberia?useUnicode=true&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=replace-with-base64-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
APP_NOTIFICATIONS_EMAIL_ENABLED=false
```

Backend local:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

## Frontend

```bash
cd frontend-barberia
copy .env.example .env
npm install
npm run dev
```

Variables principales:

```properties
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

Frontend local:

```text
http://localhost:5173
```

## Documentacion Starlight

```bash
cd docs
npm install
npm run dev
```

Documentacion local:

```text
http://localhost:4321
```
