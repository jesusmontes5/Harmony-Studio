import { apiClient } from "./apiClient";

/**
 * Obtiene los tramos horarios configurados para un barbero.
 */
export async function getBarberSchedule(barberoId) {
  const response = await apiClient.get(`/barbers/${barberoId}/schedule`);
  return response.data;
}

/**
 * Reemplaza el horario completo de un barbero.
 */
export async function replaceBarberSchedule(barberoId, schedule) {
  const response = await apiClient.put(`/barbers/${barberoId}/schedule`, schedule);
  return response.data;
}
