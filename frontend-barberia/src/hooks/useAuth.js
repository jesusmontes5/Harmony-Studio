import { useContext } from "react";
import { AuthContext } from "../context/AuthContextObject";

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * Retorna objeto con usuario autenticado y funciones de login/logout.
 * 
 * @returns {Object} Contexto de autenticación {user, login, logout, isLoading, error}
 * @throws {Error} Si se usa fuera de AuthProvider
 * 
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
