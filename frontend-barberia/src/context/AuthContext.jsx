import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStoredToken,
  getStoredToken,
  mapApiError,
  setStoredToken,
} from "../api/apiClient";
import { googleLoginRequest, loginRequest, meRequest, registerRequest } from "../api/authApi";
import { AuthContext } from "./AuthContextObject";

/**
 * Proveedor global de autenticacion, usuario actual y acciones de sesion.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getStoredToken() ? undefined : null));
  const [authMessage, setAuthMessage] = useState("");

  /**
   * Recupera el usuario autenticado usando el token almacenado.
   */
  const fetchMe = useCallback(async () => {
    try {
      const me = await meRequest();
      setUser(me);
      return me;
    } catch (error) {
      const mappedError = mapApiError(error);
      clearStoredToken();
      setUser(null);
      setAuthMessage(mappedError.message);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
  }, [fetchMe]);

  /**
   * Inicia sesion con credenciales locales y persiste el JWT recibido.
   */
  const login = useCallback(async (credentials) => {
    try {
      setAuthMessage("");
      const authResponse = await loginRequest(credentials);
      setStoredToken(authResponse.accessToken || authResponse.token, credentials?.remember);
      setUser(authResponse.user);
      return { ok: true, data: authResponse };
    } catch (error) {
      return { ok: false, error: mapApiError(error) };
    }
  }, []);

  /**
   * Inicia sesion con token de Google Identity Services.
   */
  const googleLogin = useCallback(async (token, remember = true) => {
    try {
      setAuthMessage("");
      const authResponse = await googleLoginRequest({ token });
      setStoredToken(authResponse.accessToken || authResponse.token, remember);
      setUser(authResponse.user);
      return { ok: true, data: authResponse };
    } catch (error) {
      return { ok: false, error: mapApiError(error) };
    }
  }, []);

  /**
   * Registra una solicitud de alta y normaliza posibles errores de API.
   */
  const register = useCallback(async (payload) => {
    try {
      const registeredUser = await registerRequest(payload);
      return { ok: true, data: registeredUser };
    } catch (error) {
      return { ok: false, error: mapApiError(error) };
    }
  }, []);

  /**
   * Cierra sesion local eliminando token y usuario del contexto.
   */
  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setAuthMessage("");
  }, []);

  /**
   * Actualiza el usuario en memoria tras cambios de perfil.
   */
  const setUserData = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  /**
   * Memoriza el valor compartido para evitar renders innecesarios en consumidores.
   */
  const value = useMemo(
    () => ({
      user,
      authMessage,
      authLoading: user === undefined,
      isAuthenticated: Boolean(user),
      login,
      googleLogin,
      register,
      logout,
      refreshMe: fetchMe,
      setUserData,
    }),
    [user, authMessage, login, googleLogin, register, logout, fetchMe, setUserData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
