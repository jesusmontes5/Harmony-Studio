import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ScrollToTop } from "./components/ScrollToTop";
import "./index.css";

/**
 * Evita que el navegador restaure scroll entre rutas SPA.
 */
window.history.scrollRestoration = "manual";

/**
 * Client ID publico usado por el proveedor OAuth de Google en frontend.
 */
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/**
 * Punto de entrada React. Registra providers globales antes de renderizar la app.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ScrollToTop />
        <NotificationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
