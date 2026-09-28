import { getDb, commit, clone, newId, simulateEmail } from "@/lib/store";
import { registrarAuditoria } from "@/lib/services/audit";
import { DEMO_PASSWORD } from "@/data/seed";

export const ROLES_USUARIO = ["Administrador", "Abogado", "Agente Inmobiliario"]; // CU-15 paso 8
export const ESTADOS_USUARIO = ["Activo", "Inactivo"]; // CU-15 paso 9

function strip(user) {
  const { password: _password, ...rest } = clone(user);
  return rest;
}

export async function listarUsuarios() {
  const db = await getDb();
  return db.users.map(strip);
}

export async function emailRegistrado(email, excludeId = null) {
  const db = await getDb();
  const normalized = (email || "").trim().toLowerCase();
  return db.users.some((u) => u.id !== excludeId && u.email.toLowerCase() === normalized);
}

// CU-15 pasos 18–21
export async function crearUsuario(data, admin) {
  const db = await getDb();
  const user = {
    id: newId("u"),
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim(),
    rol: data.rol,
    estado: data.estado,
    password: DEMO_PASSWORD,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    preferenciasNotificacion: {
      eventos: { nuevaVersion: true, firmaRecibida: true, listoParaFirmar: true, nuevoComentario: true, cambioEstado: true, proximoAVencer: false },
      canales: ["Correo Electrónico"],
    },
  };
  db.users.push(user);
  commit();
  simulateEmail(user.email, "Activación de cuenta FirmaYA", "Instrucciones para establecer su contraseña.");
  await registrarAuditoria({
    usuario: admin.email,
    tipoAccion: "Creación",
    entidad: "Usuario",
    descripcion: `Creación del usuario ${user.nombre} ${user.apellido} (${user.rol}).`,
    despues: `${user.email} · ${user.rol} · ${user.estado}`,
  });
  return strip(user);
}

// CU-15 flujo alternativo de edición / desactivación
export async function actualizarUsuario(id, data, admin) {
  const db = await getDb();
  const user = db.users.find((u) => u.id === id);
  const antes = `${user.nombre} ${user.apellido} · ${user.email} · ${user.rol} · ${user.estado}`;
  const desactiva = user.estado === "Activo" && data.estado === "Inactivo";
  Object.assign(user, {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim(),
    rol: data.rol,
    estado: data.estado,
  });
  commit();
  await registrarAuditoria({
    usuario: admin.email,
    tipoAccion: desactiva ? "Desactivación" : "Edición",
    entidad: "Usuario",
    descripcion: desactiva
      ? `Desactivación del usuario ${user.nombre} ${user.apellido}.`
      : `Edición del usuario ${user.nombre} ${user.apellido}.`,
    antes,
    despues: `${user.nombre} ${user.apellido} · ${user.email} · ${user.rol} · ${user.estado}`,
  });
  return strip(user);
}

// CU-20
export async function guardarPreferencias(userId, preferencias) {
  const db = await getDb();
  const user = db.users.find((u) => u.id === userId);
  user.preferenciasNotificacion = clone(preferencias);
  commit();
  return clone(user.preferenciasNotificacion);
}

export async function obtenerPreferencias(userId) {
  const db = await getDb();
  const user = db.users.find((u) => u.id === userId);
  return clone(user?.preferenciasNotificacion);
}
