import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://harmony-studio-ivory.vercel.app",
  integrations: [
    starlight({
      title: "Harmony Studio",
      description: "Documentacion tecnica del proyecto final DAW Harmony Studio.",
      defaultLocale: "root",
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Proyecto",
          items: [
            { label: "Portada", slug: "" },
            { label: "Introduccion", slug: "introduccion" },
            { label: "Arquitectura", slug: "arquitectura" },
            { label: "Instalacion y uso", slug: "instalacion-uso" }
          ]
        },
        {
          label: "Diagramas",
          items: [
            { label: "Casos de uso", slug: "diagramas/casos-uso" },
            { label: "Clases", slug: "diagramas/clases" },
            { label: "Entidad-Relacion", slug: "diagramas/entidad-relacion" },
            { label: "Componentes", slug: "diagramas/componentes" },
            { label: "Actividades", slug: "diagramas/actividades" },
            { label: "Secuencia", slug: "diagramas/secuencia" },
            { label: "Despliegue", slug: "diagramas/despliegue" }
          ]
        },
        {
          label: "Validacion",
          items: [{ label: "Casos de prueba", slug: "pruebas/casos-prueba" }]
        }
      ]
    })
  ]
});
