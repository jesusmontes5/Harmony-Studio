import { useCallback, useEffect, useState } from "react";
import { mapApiError } from "../api/apiClient";
import { listBarberReviews } from "../api/reviewsApi";
import { useAuth } from "../hooks/useAuth";
import { BarberReviewsPanel } from "../components/reviews/BarberReviewsPanel";

/**
 * MisResenasPage - Página de mis reseñas.
 * Muestra reseñas que el cliente ha escrito sobre barberos.
 * @page
 * @returns {React.ReactElement}
 */
export function MisResenasPage() {
  const { user } = useAuth();
  const [reviewsResponse, setReviewsResponse] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  /**
   * Carga las resenas asociadas al barbero autenticado.
   */
  const loadReviews = useCallback(async () => {
    if (!user?.id) return;
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const data = await listBarberReviews(user.id);
      setReviewsResponse(data);
    } catch (err) {
      setReviewsError(mapApiError(err).message);
    } finally {
      setReviewsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="relative -mx-md -my-lg overflow-hidden px-md py-lg sm:-mx-lg sm:-my-xl sm:px-lg sm:py-xl lg:-mx-xl lg:px-xl">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fbf7ef]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_18%,rgba(201,151,62,0.12),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(201,151,62,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(251,247,239,0.76))]" />
      <div className="pointer-events-none fixed -left-28 top-48 -z-10 h-[34rem] w-[34rem] rounded-full border border-accent/10" />
      <div className="pointer-events-none fixed right-4 top-28 -z-10 hidden h-32 w-32 bg-[radial-gradient(circle,rgba(201,151,62,0.28)_1px,transparent_1.5px)] bg-[length:14px_14px] opacity-25 lg:block" />
      <div className="pointer-events-none fixed -right-32 bottom-6 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent/20" />

      <div className="mx-auto max-w-5xl space-y-7 sm:space-y-8">
        <div className="animate-fade-up">
          <BarberReviewsPanel
            title="Resumen de reseñas"
            subtitle="Comentarios y puntuaciones de clientes satisfechos."
            loading={reviewsLoading}
            response={reviewsResponse}
            error={reviewsError}
            onRefresh={loadReviews}
          />
        </div>
      </div>
    </div>
  );
}
