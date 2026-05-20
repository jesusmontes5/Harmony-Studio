/**
 * @fileoverview API client para operaciones de usuarios.
 * Proporciona funciones para gestionar perfil, autenticacion y datos personales.
 */

import { apiClient } from "./apiClient";

/**
 * Actualiza datos basicos del perfil autenticado.
 */
export async function updateMyName(payload) {
  const response = await apiClient.patch("/users/me", payload);
  return response.data;
}

/**
 * Actualiza el perfil autenticado incluyendo nombre, telefono o avatar.
 */
export async function updateMyProfile(payload) {
  const response = await apiClient.patch("/users/me", payload);
  return response.data;
}

/**
 * Cambia la contrasena del usuario autenticado.
 */
export async function changeMyPassword(payload) {
  await apiClient.patch("/users/me/password", payload);
}

/**
 * Lista clientes filtrando por busqueda y estado activo.
 */
export async function listClients(q = "", activo) {
  const params = {};
  if (q) params.q = q;
  if (typeof activo === "boolean") params.activo = activo;

  const response = await apiClient.get("/users/clients", { params });
  return response.data;
}

/**
 * Bloquea un cliente para impedirle operar como usuario activo.
 */
export async function blockClient(clientId) {
  const response = await apiClient.patch(`/users/clients/${clientId}/block`);
  return response.data;
}

/**
 * Desbloquea un cliente previamente bloqueado.
 */
export async function unblockClient(clientId) {
  const response = await apiClient.patch(`/users/clients/${clientId}/unblock`);
  return response.data;
}

/**
 * Lista solicitudes de registro pendientes de revision.
 */
export async function listPendingRegistrationRequests() {
  const response = await apiClient.get("/registration-requests", {
    params: { estado: "PENDIENTE" },
  });
  return response.data;
}

/**
 * Aprueba una solicitud de registro con el rol indicado.
 */
export async function approveRegistrationRequest(id, rol = "CLIENTE") {
  const response = await apiClient.patch(`/registration-requests/${id}/approve`, { rol });
  return response.data;
}

/**
 * Rechaza una solicitud de registro indicando el motivo.
 */
export async function rejectRegistrationRequest(id, motivo) {
  const response = await apiClient.patch(`/registration-requests/${id}/reject`, {
    motivo,
  });
  return response.data;
}

/**
 * Elimina la cuenta del usuario autenticado.
 */
export async function deleteMyAccount() {
  await apiClient.delete("/users/me");
}
