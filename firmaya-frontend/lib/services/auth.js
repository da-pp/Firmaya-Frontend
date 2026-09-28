import { getDb, commit, clone, newToken, simulateEmail } from "@/lib/store";
import { registrarAuditoria } from "@/lib/services/audit";

const SESSION_KEY = "firmaya-demo-session";
const MAX_INTENTOS = 5; // CU-19
const BLOQUEO_MS = 15 * 60 * 1000; // CU-19
const TOKEN_RECUPERACION_MS = 30 * 60 * 1000; // CU-21

function findByEmail(db, email) {
  const normalized = (email || "").trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized);
}

function publicUser(user) {
  if (!user) return null;
  const { password: _password, ...rest } = clone(user);
  return rest;
}

// CU-19 pasos 15–20
export async function iniciarSesion(email, password) {
  const db = await getDb();
  const user = findByEmail(db, email);
  const now = Date.now();

  if (!user || user.estado !== "Activo") return { ok: false, error: "CREDENCIALES" };

  if (user.bloqueadoHasta && new Date(user.bloqueadoHasta).getTime() > now) {
    return { ok: false, error: "BLOQUEADA" };
  }

  if (user.password !== password) {
    user.intentosFallidos = (user.intentosFallidos || 0) + 1;
    if (user.intentosFallidos >= MAX_INTENTOS) {
      user.intentosFallidos = 0;
      user.bloqueadoHasta = new Date(now + BLOQUEO_MS).toISOString();
      commit();
      return { ok: false, error: "BLOQUEADA" };
    }
    commit();
    return { ok: false, error: "CREDENCIALES" };
  }

  user.intentosFallidos = 0;
  user.bloqueadoHasta = null;
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Inicio de sesión",
    entidad: "Usuario",
    descripcion: `Inicio de sesión de ${user.nombre} ${user.apellido}.`,
  });
  try {
    window.localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    // Sin almacenamiento: la sesión no sobrevive a la recarga.
  }
  return { ok: true, user: publicUser(user) };
}

export async function obtenerUsuarioSesion() {
  let userId = null;
  try {
    userId = window.localStorage.getItem(SESSION_KEY);
  } catch {
    userId = null;
  }
  if (!userId) return null;
  const db = await getDb();
  const user = db.users.find((u) => u.id === userId && u.estado === "Activo");
  return publicUser(user);
}

// CU-21 pasos 8–10: el mensaje mostrado es siempre genérico.
export async function solicitarRecuperacion(email) {
  const db = await getDb();
  const user = findByEmail(db, email);
  if (user) {
    const token = newToken("rec");
    db.recoveryTokens.push({
      token,
      userId: user.id,
      expira: new Date(Date.now() + TOKEN_RECUPERACION_MS).toISOString(),
      usado: false,
    });
    commit();
    simulateEmail(
      user.email,
      "Restablecer contraseña",
      `Enlace de restablecimiento (vence en 30 minutos): ${window.location.origin}/restablecer-contrasena/${token}`
    );
  }
  return { ok: true };
}

export async function validarTokenRecuperacion(token) {
  const db = await getDb();
  const entry = db.recoveryTokens.find((t) => t.token === token);
  return Boolean(entry && !entry.usado && new Date(entry.expira).getTime() > Date.now());
}

// CU-21 pasos 21–23
export async function restablecerContrasena(token, password) {
  const db = await getDb();
  const entry = db.recoveryTokens.find((t) => t.token === token);
  if (!entry || entry.usado || new Date(entry.expira).getTime() <= Date.now()) {
    return { ok: false, error: "TOKEN" };
  }
  const user = db.users.find((u) => u.id === entry.userId);
  user.password = password;
  entry.usado = true;
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Cambio de contraseña",
    entidad: "Usuario",
    descripcion: `Restablecimiento de contraseña de ${user.nombre} ${user.apellido}.`,
  });
  return { ok: true };
}
