// Mensaje que se muestra en la pantalla destino tras una redirección
// (ej. CU-01 paso 20, CU-19 paso 19, CU-14 paso 19).
const KEY = "firmaya-flash";

export function setFlash(type, text) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ type, text }));
  } catch {
    // Sin almacenamiento de sesión disponible.
  }
}

export function consumeFlash() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
