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

## Despliegue en Azure

El despliegue de produccion se realiza con Docker Compose en una maquina virtual de Azure. La base de datos se ejecuta como Azure Database for MySQL Flexible Server.

Recursos actuales:

```text
Grupo de recursos: rg-harmony-studio-es
Region: spaincentral
VM: vm-harmony-studio
IP publica: http://158.158.2.243
MySQL Flexible Server: mysql-harmony-studio.mysql.database.azure.com
Base de datos: tfg_barberia
```

En la VM:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
git clone https://github.com/jesusmontes5/Harmony-Studio.git
cd Harmony-Studio
cp .env.deploy.example .env
nano .env
sudo docker compose up --build -d
```

Variables principales del `.env` de produccion:

```properties
DB_URL=jdbc:mysql://mysql-harmony-studio.mysql.database.azure.com:3306/tfg_barberia?useUnicode=true&serverTimezone=UTC&useSSL=true
DB_USER=adminaz
DB_PASSWORD=replace-with-real-password
JWT_SECRET=replace-with-base64-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
APP_CORS_ALLOWED_ORIGINS=http://158.158.2.243
APP_NOTIFICATIONS_EMAIL_ENABLED=false

VITE_API_URL=/api
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

Actualizar tras cambios:

```bash
cd Harmony-Studio
git pull
sudo docker compose up --build -d
```

Comprobaciones:

```bash
sudo docker compose ps
sudo docker compose logs -f
```

Aplicacion desplegada:

```text
http://158.158.2.243/
```

Health check:

```text
http://158.158.2.243/api/actuator/health
```

## Frontend en Vercel

El frontend tambien puede desplegarse en Vercel desde el mismo repositorio, seleccionando solo la carpeta `frontend-barberia`.

Configuracion del proyecto en Vercel:

```text
Root Directory: frontend-barberia
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variables de entorno:

```properties
VITE_API_URL=/api
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

El archivo `frontend-barberia/vercel.json` redirige las llamadas `/api/*` hacia el backend desplegado en Azure:

```text
https://tu-proyecto.vercel.app/api/*
  -> http://158.158.2.243/api/*
```

Cuando se conozca el dominio final de Vercel, debe anadirse en Google Cloud Console y en `APP_CORS_ALLOWED_ORIGINS` del backend.
