import { Card } from "../ui/Card";

/**
 * GallerySection - Seccion de galeria de trabajos.
 * Muestra fotos de cortes y trabajos realizados.
 * @component
 * @returns {React.ReactElement}
 */
export function GallerySection({ images }) {
  return (
    <section id="galeria" aria-labelledby="galeria-title" className="animate-fade-up">
      <Card title="Galeria" subtitle="Galeria de estilos y ambiente de nuestra barberia.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {images.map((image, index) => (
            <figure
              key={`${image}-${index}`}
              className="group relative overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/80 shadow-[0_16px_36px_-30px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

              <img
                src={image}
                alt={`Trabajo de barberia ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52"
              />

              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-primary/40 to-transparent pb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  #{index + 1}
                </span>
              </div>
            </figure>
          ))}
        </div>
      </Card>
    </section>
  );
}
