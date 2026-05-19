# Documentacion Starlight - Harmony Studio

Sitio de documentacion tecnica del proyecto final DAW.

## Ejecutar en local

```bash
cd docs
npm install
npm run dev
```

Abrir:

```text
http://localhost:4321
```

## Generar build

```bash
npm run build
```

## Despliegue de la aplicacion

La aplicacion principal esta desplegada con frontend en Vercel y backend en Azure:

```text
https://harmony-studio-ivory.vercel.app/
```

La VM de Azure mantiene la API y un frontend alternativo:

```text
http://158.158.2.243/
http://158.158.2.243/api
```

El sitio Starlight se mantiene como documentacion tecnica dentro de `docs/` y puede desplegarse aparte como sitio estatico si se necesita.

## Contenido incluido

- Portada creativa.
- Introduccion.
- Arquitectura.
- Instalacion y uso.
- Diagrama de casos de uso.
- Diagrama de clases.
- Diagrama Entidad-Relacion.
- Diagrama de componentes.
- Diagrama de actividades.
- Diagrama de secuencia.
- Diagrama de despliegue.
- Casos de prueba.
