import { apiClient } from "./apiClient";

/**
 * Crea una resena asociada a una reserva completada.
 */
export async function createReview(payload) {
  const response = await apiClient.post("/reviews", payload);
  return response.data;
}

/**
 * Lista resenas publicas y promedio de un barbero.
 */
export async function listBarberReviews(barberoId) {
  const response = await apiClient.get(`/barbers/${barberoId}/reviews`);
  return response.data;
}
