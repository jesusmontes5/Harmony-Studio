import { apiClient } from "./apiClient";

/**
 * Envia una solicitud de registro local al backend.
 */
export async function registerRequest(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

/**
 * Autentica usuario con email y contrasena.
 */
export async function loginRequest(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

/**
 * Autentica o solicita alta usando el token ID de Google.
 */
export async function googleLoginRequest(payload) {
  const response = await apiClient.post("/auth/google", payload);
  return response.data;
}

/**
 * Recupera los datos publicos del usuario autenticado actual.
 */
export async function meRequest() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}
