import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBoardMessage,
  deleteBoardMessage,
  listBoardMessages,
  updateBoardMessage,
} from "../api/boardApi";
import { mapApiError } from "../api/apiClient";

const INITIAL_FORM = {
  titulo: "",
  mensaje: "",
};

/**
 * Hook personalizado para cargar y gestionar mensajes del talón.
 * Realiza carga inicial y permite refrescar, crear, editar y eliminar mensajes.
 * 
 * @returns {Object} Estado de mensajes y funciones
 * @returns {Array<Object>} messages - Lista de mensajes del talón
 * @returns {boolean} loading - Estado de carga inicial
 * @returns {boolean} saving - Estado de guardado
 * @returns {boolean} deletingId - ID del mensaje siendo eliminado
 * @returns {string} error - Mensaje de error si existe
 * @returns {Function} loadBoard - Función para recargar mensajes
 * @returns {Function} createMessage - Crear nuevo mensaje
 * @returns {Function} updateMessage - Actualizar mensaje existente
 * @returns {Function} deleteMessage - Eliminar mensaje
 */
export function useBoardMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  /**
   * Indica si el formulario esta creando o editando un mensaje existente.
   */
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  /**
   * Carga los mensajes publicados en el tablon.
   */
  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listBoardMessages();
      setMessages(data || []);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  /**
   * Limpia el formulario y sale del modo edicion.
   */
  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }, []);

  /**
   * Rellena el formulario con un mensaje existente para editarlo.
   */
  const startEdit = useCallback((message) => {
    setForm({
      titulo: message.titulo || "",
      mensaje: message.mensaje || "",
    });
    setEditingId(message.id);
    setError("");
    setFeedback("");
  }, []);

  /**
   * Valida y crea o actualiza un mensaje del tablon.
   */
  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setFeedback("");

      if (!form.titulo.trim() || !form.mensaje.trim()) {
        setError("Completa titulo y mensaje.");
        return;
      }

      setSaving(true);
      try {
        if (editingId) {
          await updateBoardMessage(editingId, {
            titulo: form.titulo.trim(),
            mensaje: form.mensaje.trim(),
          });
          setFeedback("Mensaje del tablon actualizado.");
        } else {
          await createBoardMessage({
            titulo: form.titulo.trim(),
            mensaje: form.mensaje.trim(),
          });
          setFeedback("Mensaje publicado en el tablon.");
        }
        resetForm();
        await loadBoard();
      } catch (err) {
        setError(mapApiError(err).message);
      } finally {
        setSaving(false);
      }
    },
    [editingId, form.mensaje, form.titulo, loadBoard, resetForm]
  );

  /**
   * Elimina un mensaje del tablon tras confirmacion gestionada por la interfaz.
   */
  const remove = useCallback(
    async (id) => {
      setError("");
      setFeedback("");
      setDeletingId(id);
      try {
        await deleteBoardMessage(id);
        setFeedback("Mensaje eliminado del tablon.");
        if (editingId === id) {
          resetForm();
        }
        await loadBoard();
      } catch (err) {
        setError(mapApiError(err).message);
      } finally {
        setDeletingId(null);
      }
    },
    [editingId, loadBoard, resetForm]
  );

  return {
    messages,
    loading,
    saving,
    deletingId,
    error,
    feedback,
    form,
    isEditing,
    setForm,
    loadBoard,
    startEdit,
    submit,
    remove,
    resetForm,
  };
}
