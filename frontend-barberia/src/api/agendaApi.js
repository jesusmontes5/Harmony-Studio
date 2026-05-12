/**
 * @fileoverview API client para operaciones de agenda de barberos.
 * Proporciona funciones para consultar disponibilidad y horarios.
 */

import { apiClient } from "./apiClient";

/**
 * Obtiene la agenda diaria de un barbero para una fecha concreta.
 */
export async function getAgendaDia({ barberoId, fecha }) {
  const response = await apiClient.get(`/barbers/${barberoId}/agenda`, {
    params: { fecha },
  });
  return response.data;
}
