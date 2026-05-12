import axios from "axios";

const TOKEN_STORAGE_KEY = "barberia_access_token";
const DEFAULT_STATUS_MESSAGES = {
  400: "Revisa los datos enviados e intentalo de nuevo.",
  401: "Tu sesion ha expirado o no es valida. Inicia sesion de nuevo.",
  403: "No tienes permisos para realizar esta accion.",
  404: "No se encontro el recurso solicitado.",
  409: "No se pudo completar la accion por conflicto con el estado actual.",
  422: "Los datos enviados no son validos.",
  500: "Se ha producido un error interno en el servidor.",
  503: "El servicio no esta disponible temporalmente.",
};

/**
 * Cliente HTTP centralizado para todo el frontend.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Obtiene token actual de almacenamiento local.
 */
export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Persiste token de acceso JWT.
 */
export function setStoredToken(token, remember = true) {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return;
  }

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Limpia token guardado.
 */
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normaliza errores de backend Spring (ProblemDetail) y de red.
 */
export function mapApiError(error) {
  const status = error?.response?.status ?? 0;
  const data = error?.response?.data;

  const backendTitle =
    data?.title
    || data?.code
    || data?.error
    || (typeof data?.type === "string" ? data.type : null)
    || "API_ERROR";

  const backendDetail =
    data?.detail
    || data?.message
    || (Array.isArray(data?.errors) ? data.errors[0] : null)
    || null;

  if (error?.response?.data) {
    const fallbackByStatus = DEFAULT_STATUS_MESSAGES[status];
    return {
      status,
      title: backendTitle,
      message: backendDetail || fallbackByStatus || "Se ha producido un error en la API",
      raw: data,
    };
  }

  if (error?.request) {
    if (error?.code === "ECONNABORTED") {
      return {
        status: 0,
        title: "TIMEOUT_ERROR",
        message: "La solicitud ha tardado demasiado. Intentalo de nuevo.",
        raw: null,
      };
    }

    const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
    return {
      status: 0,
      title: "NETWORK_ERROR",
      message: isOffline
        ? "No tienes conexion a internet."
        : "No se pudo conectar con el backend. Revisa CORS, URL API o que el servidor este encendido.",
      raw: null,
    };
  }

  return {
    status,
    title: "UNKNOWN_ERROR",
    message: error?.message || "Error inesperado",
    raw: null,
  };
}

export { TOKEN_STORAGE_KEY };
