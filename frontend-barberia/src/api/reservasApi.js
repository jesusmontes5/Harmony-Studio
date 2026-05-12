/**
 * @fileoverview API client para operaciones de reservas.
 * Proporciona funciones para crear, consultar, actualizar y cancelar reservas.
 */

import { apiClient } from "./apiClient";

/**
 * Lista servicios activos para crear reservas.
 */
export async function listServices() {
  const response = await apiClient.get("/services");
  return response.data;
}

/**
 * Lista barberos activos disponibles para reservar.
 */
export async function listBarbers() {
  const response = await apiClient.get("/users/barbers");
  return response.data;
}

/**
 * Consulta disponibilidad diaria del barbero.
 * El backend acepta "servicios" como lista/coma-separado.
 */
export async function getAvailability({ barberoId, fecha, servicios }) {
  const params = {
    barbero_id: barberoId,
    fecha,
  };

  if (servicios?.length) {
    params.servicios = servicios.join(",");
  }

  const response = await apiClient.get("/availability", { params });
  return response.data;
}

/**
 * Crea una reserva para el cliente autenticado.
 */
export async function createReservation(payload) {
  const response = await apiClient.post("/reservations", payload);
  return response.data;
}

/**
 * Crea una cita futura sin hora para un cliente activo.
 */
export async function createPendingTimeReservation(payload) {
  const response = await apiClient.post("/reservations/pending-time", payload);
  return response.data;
}

/**
 * Lista reservas visibles para el usuario autenticado.
 */
export async function listMyReservations(params = {}) {
  const response = await apiClient.get("/reservations", { params });
  return response.data;
}

/**
 * Cambia el estado de una reserva existente.
 */
export async function updateReservationStatus(reservaId, payload) {
  const response = await apiClient.patch(`/reservations/${reservaId}/status`, payload);
  return response.data;
}

/**
 * Asigna una hora a una cita pendiente.
 */
export async function assignReservationTime(reservaId, payload) {
  const response = await apiClient.patch(`/reservations/${reservaId}/assign-time`, payload);
  return response.data;
}
