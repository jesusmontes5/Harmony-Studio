/**
 * @fileoverview API client para operaciones del tablon de mensajes.
 * Proporciona funciones para crear, listar, actualizar y eliminar mensajes.
 */
import { apiClient } from "./apiClient";

/**
 * Lista los mensajes activos del tablon publico.
 */
export async function listBoardMessages() {
  const response = await apiClient.get("/board/messages");
  return response.data;
}

/**
 * Crea un nuevo mensaje de tablon.
 */
export async function createBoardMessage(payload) {
  const response = await apiClient.post("/board/messages", payload);
  return response.data;
}

/**
 * Actualiza un mensaje existente del tablon.
 */
export async function updateBoardMessage(id, payload) {
  const response = await apiClient.patch(`/board/messages/${id}`, payload);
  return response.data;
}

/**
 * Elimina logicamente un mensaje del tablon.
 */
export async function deleteBoardMessage(id) {
  await apiClient.delete(`/board/messages/${id}`);
}
