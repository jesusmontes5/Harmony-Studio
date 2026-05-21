import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { premiumCardClass } from "../../styles/uiClasses";

/**
 * Formatea fecha/hora de una resena y devuelve guion si no hay valor.
 */
function formatDateTime(value) {
  if (!value) return "-";
  const rawValue = String(value);
  const normalizedValue = /(?:Z|[+-]\d{2}:?\d{2})$/.test(rawValue) ? rawValue : `${rawValue}Z`;
  return new Date(normalizedValue).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
  });
}

/**
 * Traduce una puntuacion numerica a tono visual de badge.
 */
function scoreTone(score) {
  if (score >= 4) return "success";
  if (score >= 3) return "warning";
  return "danger";
}

/**
 * Devuelve una representacion visual compacta de la puntuacion.
 */
function scoreLabel(score) {
  return `${Number(score || 0).toFixed(1)}/5`;
}

/**
 * Genera iniciales para el avatar de cliente.
 */
function getInitials(nombre) {
  const source = nombre || "CL";
  return source
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

/**
 * Pintado simple de estrellas con color de acento.
 */
function Stars({ score }) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(score || 0))));
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rounded ? "text-accent" : "text-neutral-border"}>
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * BarberReviewsPanel - Panel que muestra reseñas de un barbero.
 * Agrega puntuacion promedio, lista de reseñas con filtros y detalles de cliente/comentario.
 * @component
 * @param {Object} props
 * @param {string} props.title - Título del panel
 * @param {string} props.subtitle - Subtítulo del panel
 * @param {boolean} props.loading - Estado de carga
 * @param {Object} props.response - Respuesta de API {reviews, promedio}
 * @param {string} props.error - Mensaje de error si existe
 * @returns {React.ReactElement}
 */
export function BarberReviewsPanel({
  title = "Reseñas",
  subtitle = "Valoraciones de clientes",
  loading = false,
  response = null,
  error = "",
}) {
  const reviews = response?.reviews || [];
  const avg = Number(response?.promedio || 0);

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={`${premiumCardClass} animate-fade-up`}
      contentClassName="p-7 sm:p-8"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 px-6 py-6 shadow-[0_18px_45px_-34px_rgba(17,24,39,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/25 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">Puntuación Promedio</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">{avg.toFixed(2)} / 5</p>
              <div className="mt-2">
                <Stars score={avg} />
              </div>
            </div>
            <div className="rounded-2xl border border-accent/25 bg-white/90 px-5 py-3 text-right shadow-soft">
              <p className="font-display text-2xl font-bold text-primary">{scoreLabel(avg)}</p>
              <p className="mt-1 text-xs font-medium text-neutral-text/70">Media global</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-danger/20 bg-danger/5 px-lg py-md text-sm font-medium text-danger animate-fade-up">
            {error}
          </div>
        ) : null}

        {!loading && !error && reviews.length === 0 ? (
          <div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-2 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.45)]">
            <EmptyState
              title="Sin reseñas aún"
              description="Tus clientes no han dejado valoraciones todavía. ¡Pide feedback para mejorar!"
              icon=""
            />
          </div>
        ) : null}

        {!loading && !error && reviews.length > 0 ? (
          <div className="max-h-[28rem] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
            <ul className="grid gap-4">
              {reviews.map((review, idx) => (
                <li
                  key={review.id}
                  className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-br from-white via-white to-accent/5 p-5 shadow-[0_18px_45px_-36px_rgba(17,24,39,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-elegant animate-fade-up sm:p-6"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-primary to-[#070b16] text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(17,24,39,0.9)]">
                        {getInitials(review.clienteNombre)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-bold text-primary">{review.clienteNombre}</p>
                        <p className="mt-1 text-xs font-medium text-neutral-text/60">{formatDateTime(review.creadaEn)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars score={review.puntuacion} />
                      <Badge tone={scoreTone(review.puntuacion)}>{review.puntuacion}/5</Badge>
                    </div>
                  </div>

                  {review.comentario ? (
                    <p className="rounded-xl border border-accent/12 bg-white/80 px-4 py-3 text-sm leading-relaxed text-neutral-text">
                      &quot;{review.comentario}&quot;
                    </p>
                  ) : (
                    <p className="text-sm italic text-neutral-text/50">Sin comentario adicional</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
