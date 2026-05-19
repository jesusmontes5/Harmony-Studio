# Harmony Studio - Gestión premium para barbería

**Proyecto final de Desarrollo de Aplicaciones Web (DAW)**  
**Alumno:** Jesús Montes Jiménez  
**Proyecto:** Harmony Studio

Harmony Studio es una aplicación web para la gestión de una barbería moderna. Permite a clientes solicitar y gestionar reservas, y al barbero administrar horarios, clientes, servicios, reseñas, citas pendientes y actividad del negocio desde un panel privado.

---

## Índice

- [Introducción](#introducción)
- [Funcionalidades](#funcionalidades)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Guía de instalación](#guía-de-instalación)
- [Guía de uso](#guía-de-uso)
- [Enlaces del proyecto](#enlaces-del-proyecto)
- [Documentación técnica](#documentación-técnica)
- [Conclusión](#conclusión)
- [Contribuciones, agradecimientos y referencias](#contribuciones-agradecimientos-y-referencias)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Introducción

Harmony Studio nace como una solución web completa para digitalizar el flujo de trabajo de una barbería. El proyecto centraliza reservas, gestión de clientes, configuración de horarios, servicios, reseñas, mensajes informativos y seguimiento de la actividad diaria en una única plataforma responsive, segura y fácil de utilizar desde móvil.

La motivación principal es resolver un problema habitual en pequeños negocios: la gestión manual de citas, cambios de horario, clientes no presentados y comunicación con usuarios. La aplicación permite que el cliente reserve de forma sencilla y que el barbero tenga control sobre su agenda real.

### Objetivos

- Crear una aplicación web funcional, responsive y mobile-first.
- Implementar autenticación y autorización con roles.
- Gestionar reservas, horarios, servicios, clientes y reseñas.
- Mantener una base de datos consistente con claves, índices y triggers.
- Documentar el backend mediante Swagger/OpenAPI.
- Documentar el proyecto con README y sitio Starlight.
- Construir una interfaz premium, clara y coherente con una marca de barbería moderna.

---

## Funcionalidades

### Cliente

- Registro de cuenta mediante solicitud pendiente de aprobación.
- Inicio de sesión con email y contraseña.
- Inicio de sesión con Google OAuth.
- Consulta de barberos y servicios disponibles.
- Creación de reservas según disponibilidad real.
- Consulta de reserva activa e historial.
- Cancelación de reservas dentro del margen permitido.
- Creación de reseñas tras una cita completada.
- Edición de perfil, nombre y avatar.
- Eliminación de cuenta.

### Barbero / Administrador

- Panel privado con resumen de actividad.
- Visualización de ingresos y cortes por día.
- Gestión de horario por fechas concretas.
- Gestión de reservas del día.
- Asignación de hora a citas pendientes.
- Cambio de estado de reservas: completada, cancelada o no presentado.
- Gestión de clientes activos y bloqueados mediante estado de usuario.
- Aprobación o rechazo de solicitudes de registro.
- Gestión de servicios ofrecidos.
- Gestión de mensajes del tablón informativo.
- Consulta de reseñas recibidas.

### Seguridad y control

- Autenticación mediante JWT.
- Autorización por roles: `CLIENTE`, `BARBERO`, `ADMIN`.
- Validación de contraseñas seguras.
- Rate limiting en endpoints sensibles de autenticación.
- Validación backend de reglas de negocio.
- CORS configurado para frontend local o desplegado.

---

## Tecnologías utilizadas

### Frontend

- React 19
- Vite
- React Router
- TailwindCSS
- Framer Motion
- Axios
- React OAuth Google
- Cloudinary para avatar de perfil
- ESLint

### Backend

- Java 17
- Spring Boot 3.5.7
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation
- Spring Mail
- Spring Actuator
- Lombok
- JWT con JJWT
- Bucket4j para rate limiting
- Springdoc OpenAPI / Swagger UI

### Base de datos

- MySQL
- Modelo relacional con claves foráneas
- Índices para optimizar consultas frecuentes
- Trigger para reforzar transiciones válidas de estado en reservas

### Documentación

- README principal
- Starlight con diagramas y casos de prueba
- Mermaid para diagramas visuales
- Swagger/OpenAPI para endpoints del backend

---

## Arquitectura del proyecto

El proyecto está dividido en tres bloques principales:

```text
barberia/
|-- frontend-barberia/   # Aplicación React + Vite
|-- tfg-barberia/        # API REST Spring Boot
|-- docs/                # Documentación técnica en Starlight
`-- README.md            # Documentación principal del proyecto
```

### Frontend

El frontend consume la API REST del backend mediante Axios. Usa rutas protegidas, contexto de autenticación, componentes reutilizables, transiciones entre páginas y carga diferida de vistas para mantener una interfaz coherente y fluida.

Rutas principales:

- `/` - Inicio
- `/login` - Inicio de sesión
- `/register` - Registro
- `/completar-perfil` - Completar datos obligatorios de perfil
- `/reservas` - Reservas de cliente
- `/perfil` - Perfil
- `/panel` - Panel del barbero
- `/dashboard` - Redirección histórica a `/panel`
- `/mi-horario` - Gestión de horario y agenda
- `/gestion-reservas` - Redirección histórica a `/mi-horario`
- `/mis-resenas` - Reseñas
- `/clientes` - Gestión de clientes y solicitudes
- `/gestion-servicios` - Gestión de servicios

### Backend

El backend expone una API REST organizada por módulos:

- Autenticación
- Usuarios
- Reservas
- Disponibilidad
- Horarios y agenda
- Servicios
- Reseñas
- Solicitudes de registro
- Notificaciones
- Tablón de mensajes

La documentación interactiva de endpoints está disponible mediante Swagger cuando el backend está en ejecución.

### Servicios externos

- Google OAuth para inicio de sesión social.
- SMTP para recordatorios y avisos por email cuando está habilitado.
- Cloudinary para subida de avatar desde el perfil.

---

## Guía de instalación

### Requisitos previos

- Java 17 o superior
- Maven Wrapper incluido en el backend
- Node.js y npm
- MySQL 8
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/jesusmontes5/Harmony-Studio.git
cd Harmony-Studio
```

### 2. Crear la base de datos

Ejecutar el esquema SQL:

```bash
mysql -u root -p < tfg-barberia/src/main/resources/db/mysql/schema.sql
```

El esquema crea la base de datos `TFG_Barberia`, sus tablas, índices y trigger de integridad.

### 3. Configurar el backend

Copiar el fichero de ejemplo:

```bash
cd tfg-barberia
copy .env.example .env
```

Configurar las variables necesarias:

```properties
DB_URL=jdbc:mysql://localhost:3306/TFG_Barberia?useUnicode=true&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=root

JWT_SECRET=replace-with-base64-secret
JWT_EXPIRATION_MINUTES=15

GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
APP_CORS_ALLOWED_ORIGINS=http://localhost:5174
APP_NOTIFICATIONS_EMAIL_ENABLED=false
```

Si se habilitan emails, también deben configurarse las variables SMTP definidas en el backend.

Ejecutar backend:

```bash
.\mvnw.cmd spring-boot:run
```

En Linux/Mac:

```bash
./mvnw spring-boot:run
```

Backend disponible en:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

### 4. Configurar el frontend

En otra terminal:

```bash
cd frontend-barberia
copy .env.example .env
```

Configurar:

```properties
VITE_API_URL=/api
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

Instalar dependencias:

```bash
npm install
```

Ejecutar frontend:

```bash
npm run dev
```

Frontend disponible en:

```text
http://localhost:5174
```

### 5. Ejecutar la documentación Starlight

```bash
cd docs
npm install
npm run dev
```

Documentación local:

```text
http://localhost:4321
```

### 6. Generar build de producción

Frontend:

```bash
cd frontend-barberia
npm run build
```

Backend:

```bash
cd tfg-barberia
.\mvnw.cmd clean package
```

Documentación:

```bash
cd docs
npm run build
```

### 7. Despliegue en produccion

El despliegue actual separa el frontend y el backend:

- Frontend principal: Vercel, desplegando solo `frontend-barberia`.
- Backend/API: maquina virtual de Azure con Docker Compose.
- Base de datos: Azure Database for MySQL Flexible Server.

Arquitectura de produccion:

```text
Usuario
  -> Vercel: https://harmony-studio-ivory.vercel.app
      -> /api proxy hacia Azure VM
          -> Spring Boot:8080
              -> Azure MySQL Flexible Server
```

Recursos usados:

```text
Grupo de recursos: rg-harmony-studio-es
Region: spaincentral
VM: vm-harmony-studio
Frontend Vercel: https://harmony-studio-ivory.vercel.app
Backend/API Azure: http://158.158.2.243/api
Frontend alternativo en Azure: http://158.158.2.243
MySQL: mysql-harmony-studio.mysql.database.azure.com
Base de datos: tfg_barberia
```

En la VM se instala Docker, Docker Compose v2 y Git. En Ubuntu 22.04 se puede instalar Compose v2 con:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
docker compose version
```

El repositorio se clona y se crea un archivo `.env` privado a partir de `.env.deploy.example`:

```bash
git clone https://github.com/jesusmontes5/Harmony-Studio.git
cd Harmony-Studio
cp .env.deploy.example .env
nano .env
```

Variables principales del despliegue:

```properties
DB_URL=jdbc:mysql://mysql-harmony-studio.mysql.database.azure.com:3306/tfg_barberia?useUnicode=true&serverTimezone=UTC&useSSL=true
DB_USER=adminaz
DB_PASSWORD=replace-with-real-password

JWT_SECRET=replace-with-base64-secret
JWT_EXPIRATION_MINUTES=15

GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
APP_CORS_ALLOWED_ORIGINS=https://harmony-studio-ivory.vercel.app,http://158.158.2.243
APP_NOTIFICATIONS_EMAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=replace-with-gmail-account
MAIL_PASSWORD=replace-with-gmail-app-password
MAIL_FROM=replace-with-gmail-account

VITE_API_URL=/api
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

Si no se quieren enviar correos durante una prueba, `APP_NOTIFICATIONS_EMAIL_ENABLED` puede dejarse en `false`.

Crear el esquema de base de datos:

```bash
mysql -h mysql-harmony-studio.mysql.database.azure.com -P 3306 -u adminaz -p --ssl-mode=REQUIRED tfg_barberia < tfg-barberia/src/main/resources/db/mysql/schema.sql
```

Opcionalmente, cargar datos semilla:

```bash
mysql -h mysql-harmony-studio.mysql.database.azure.com -P 3306 -u adminaz -p --ssl-mode=REQUIRED tfg_barberia < tfg-barberia/src/main/resources/db/mysql/data.sql
```

Levantar los contenedores de Azure:

```bash
sudo docker compose up --build -d
sudo docker compose ps
```

Actualizar el despliegue despues de cambios:

```bash
git pull
sudo docker compose up --build -d
```

Ver logs:

```bash
sudo docker compose logs -f
```

### 8. Frontend en Vercel

Vercel despliega solo la carpeta `frontend-barberia` desde el mismo repositorio:

```text
Root Directory: frontend-barberia
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variables de entorno en Vercel:

```properties
VITE_API_URL=/api
VITE_API_TIMEOUT_MS=15000
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
VITE_HOME_FEATURED_BARBER_ID=2
VITE_CLOUDINARY_CLOUD_NAME=replace-with-cloudinary-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=replace-with-upload-preset
```

El archivo `frontend-barberia/vercel.json` hace de puente entre Vercel y Azure:

```text
https://harmony-studio-ivory.vercel.app/api/*
  -> http://158.158.2.243/api/*
```

Para que Google Login funcione en produccion, el dominio de Vercel debe estar en:

- Google Cloud Console, como origen autorizado de JavaScript.
- `.env` de la VM, en `APP_CORS_ALLOWED_ORIGINS`.

---

## Guía de uso

### Acceso como cliente

1. Entrar en la web.
2. Registrarse desde `/register`.
3. Esperar aprobación del barbero o administrador.
4. Iniciar sesión desde `/login`.
5. Ir a `/reservas`.
6. Seleccionar barbero, fecha, servicios y hora disponible.
7. Confirmar la reserva.
8. Consultar la reserva activa o el historial desde la misma página.

### Acceso como barbero o administrador

1. Iniciar sesión con una cuenta con rol `BARBERO` o `ADMIN`.
2. Acceder al panel desde `/panel`.
3. Revisar métricas de actividad.
4. Configurar disponibilidad en `/mi-horario`.
5. Gestionar citas del día y citas pendientes.
6. Revisar solicitudes de registro en `/clientes`.
7. Crear, editar o desactivar servicios en `/gestion-servicios`.
8. Consultar reseñas en `/mis-resenas`.

### Documentación de API

Con el backend en ejecución, se puede acceder a:

```text
http://localhost:8080/swagger-ui.html
```

También existe una colección local de peticiones en:

```text
tfg-barberia/request.http
```

### Documentación Starlight

La documentación técnica del proyecto está en la carpeta `docs/` y contiene la portada, arquitectura, diagramas UML/ER, despliegue y casos de prueba.

```bash
cd docs
npm install
npm run dev
```

Disponible en local en:

```text
http://localhost:4321
```

---

## Enlaces del proyecto

- Repositorio: https://github.com/jesusmontes5/Harmony-Studio
- Proyecto desplegado: `https://harmony-studio-ivory.vercel.app/`
- Frontend alternativo en Azure: `http://158.158.2.243/`
- Documentación Starlight: incluida en `docs/`
- Figma de la interfaz: https://www.figma.com/design/zjuhzeH3yg0EYXkDpIPaqe/TFG-Barberia?node-id=0-1&t=SqV60CRjlqtlAzrw-1
- Swagger local: `http://localhost:8080/swagger-ui.html`
- Health check desplegado: `https://harmony-studio-ivory.vercel.app/api/actuator/health`

---

## Documentación técnica

La documentación técnica ampliada está realizada en Starlight e incluye:

- Diagrama de casos de uso.
- Diagrama de clases.
- Diagrama entidad-relación.
- Diagrama de componentes.
- Diagrama de actividades.
- Diagrama de secuencia.
- Diagrama de despliegue.
- Casos de prueba.

Estado actual:

- README principal: incluido en este documento.
- Documentación Starlight: incluida en `docs/`.
- Swagger/OpenAPI: implementado en backend.
- Esquema SQL: disponible en `tfg-barberia/src/main/resources/db/mysql/schema.sql`.
- Casos de prueba: documentados en `docs/src/content/docs/pruebas/casos-prueba.md`.
- Figma: incluido en los enlaces del proyecto.

---

## Conclusión

Harmony Studio cumple el objetivo de crear una aplicación web completa para una barbería, conectando una interfaz moderna y mobile-first con un backend seguro y una base de datos consistente.

El proyecto integra funcionalidades reales de negocio: reservas, horarios, clientes, servicios, reseñas, autenticación, roles y administración. Además, se ha trabajado una identidad visual premium para que la experiencia no sea solo funcional, sino también coherente con una marca moderna.

Como mejoras futuras se plantean:

- Añadir tests unitarios y de integración más completos.
- Automatizar despliegue con GitHub Actions.
- Desplegar públicamente la documentación Starlight.
- Mejorar el sistema de notificaciones y recordatorios.
- Añadir monitorización y métricas de producción.

---

## Contribuciones, agradecimientos y referencias

### Contribuciones

Proyecto desarrollado como Trabajo Final de Desarrollo de Aplicaciones Web.

### Agradecimientos

Agradecimiento al profesorado del ciclo DAW por la orientación durante el desarrollo del proyecto.

### Referencias

- Documentación oficial de React: https://react.dev
- Documentación oficial de Vite: https://vite.dev
- Documentación oficial de TailwindCSS: https://tailwindcss.com
- Documentación oficial de Spring Boot: https://spring.io/projects/spring-boot
- Documentación oficial de Spring Security: https://spring.io/projects/spring-security
- Documentación de Springdoc OpenAPI: https://springdoc.org
- Documentación de MySQL: https://dev.mysql.com/doc
- Documentación de Starlight: https://starlight.astro.build

---

## Licencia

Este proyecto se entrega con fines académicos para el ciclo de Desarrollo de Aplicaciones Web.

---

## Contacto

**Alumno:** Jesús Montes Jiménez  
**Email:** jesusmontesjimenez02@gmail.com  
**Ciclo:** Desarrollo de Aplicaciones Web (DAW)
