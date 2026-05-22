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

## Refrescar Azure

Cuando `main` ya esta actualizado en GitHub, el backend de la VM puede reconstruirse con:

```powershell
.\scripts\azure-refresh.ps1
```

Tambien existe el acceso directo:

```text
scripts/azure-refresh.bat
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

Diseno de la interfaz en Figma:

```text
https://www.figma.com/design/zjuhzeH3yg0EYXkDpIPaqe/TFG-Barberia?node-id=0-1&t=SqV60CRjlqtlAzrw-1
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
