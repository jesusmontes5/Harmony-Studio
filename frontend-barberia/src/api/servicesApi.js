import { apiClient } from "./apiClient";

/**
 * Lista servicios, opcionalmente incluyendo inactivos para gestion.
 */
export async function listServices(includeInactive = false) {
  const response = await apiClient.get("/services", {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return response.data;
}

/**
 * Crea un servicio nuevo.
 */
export async function createService(payload) {
  const response = await apiClient.post("/services", payload);
  return response.data;
}

/**
 * Actualiza parcialmente un servicio.
 */
export async function updateService(serviceId, payload) {
  const response = await apiClient.patch(`/services/${serviceId}`, payload);
  return response.data;
}

/**
 * Inactiva un servicio existente.
 */
export async function deleteService(serviceId) {
  await apiClient.delete(`/services/${serviceId}`);
}
