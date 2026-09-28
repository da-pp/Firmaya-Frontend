import { getDb, commit, clone, newId, newToken, simulateEmail } from "@/lib/store";
import { sha256 } from "@/lib/hash";
import { formatDate } from "@/lib/format";
import { registrarAuditoria } from "@/lib/services/audit";
import { MOCK_IP } from "@/data/seed";

export const ESTADOS_CONTRATO = ["Borrador", "En Revisión", "Listo para firmar", "Firmado", "Archivado"];

// CU-05 paso 4: transiciones válidas; no se permite revertir estados.
export const TRANSICIONES = {
  Borrador: ["En Revisión"],
  "En Revisión": ["Listo para firmar"],
  Firmado: ["Archivado"],
};

export const ROLES_PARTE = ["Firmante", "Solo lectura", "Revisor"]; // CU-03 paso 6

export const ESTADOS_EDITABLES = ["Borrador", "En Revisión"]; // CU-02

function currentVersion(contract) {
  return contract.versiones[contract.versiones.length - 1];
}

function fullName(user) {
  return `${user.nombre} ${user.apellido}`;
}

function origin() {
  return window.location.origin;
}

function notificarPartes(contract, asunto, cuerpo) {
  contract.partesInvitadas.filter((p) => p.notificaciones).forEach((p) => simulateEmail(p.email, asunto, cuerpo));
}

async function findContract(id) {
  const db = await getDb();
  return { db, contract: db.contracts.find((c) => c.id === id) };
}

export async function obtenerContrato(id) {
  const { contract } = await findContract(id);
  return clone(contract) || null;
}

// CU-01 postcondición: el contrato queda en la lista del usuario creador.
export async function listarContratosDeUsuario(userId) {
  const db = await getDb();
  return clone(db.contracts.filter((c) => c.creadorId === userId)).sort(
    (a, b) => new Date(b.fechaModificacion) - new Date(a.fechaModificacion)
  );
}

// CU-17: datos agregados de todos los contratos con su responsable.
export async function listarContratosConResponsable() {
  const db = await getDb();
  return clone(db.contracts).map((c) => {
    const owner = db.users.find((u) => u.id === c.creadorId);
    return { ...c, responsable: owner ? fullName(owner) : "" };
  });
}

// CU-01 pasos 17–20
export async function crearContrato(data, template, user) {
  const db = await getDb();
  const values = {
    nombre_contrato: data.nombre,
    partes: data.partes,
    fecha_inicio: formatDate(data.fechaInicio),
    fecha_expiracion: data.fechaExpiracion ? formatDate(data.fechaExpiracion) : "",
    descripcion_propiedad: data.descripcionPropiedad,
  };
  const contenido = template.cuerpo.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (marker, key) =>
    key in values ? values[key] : marker
  );
  const now = new Date().toISOString();
  const hash = await sha256(contenido);
  const contract = {
    id: newId("c"),
    nombre: data.nombre.trim(),
    partes: data.partes.trim(),
    fechaInicio: data.fechaInicio,
    fechaExpiracion: data.fechaExpiracion || null,
    descripcionPropiedad: data.descripcionPropiedad,
    tipo: template.tipo,
    plantillaId: template.id,
    estado: "Borrador",
    creadorId: user.id,
    creadoEn: now,
    fechaModificacion: now,
    versiones: [{ numero: 1, contenido, autor: fullName(user), fecha: now, comentario: "", hash }],
    partesInvitadas: [],
    solicitudFirma: null,
    comentarios: [],
    accesos: [],
  };
  db.contracts.push(contract);
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Creación",
    entidad: "Contrato",
    descripcion: `Creación del contrato "${contract.nombre}" (v1).`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    version: 1,
    hash,
  });
  return clone(contract);
}

// CU-02 pasos 16–20
export async function guardarVersion(id, contenido, comentario, user) {
  const { contract } = await findContract(id);
  if (!ESTADOS_EDITABLES.includes(contract.estado)) return { ok: false, error: "NO_EDITABLE" };
  const previous = currentVersion(contract);
  const now = new Date().toISOString();
  const nueva = {
    numero: previous.numero + 1,
    contenido,
    autor: fullName(user),
    fecha: now,
    comentario: comentario || "",
    hash: await sha256(contenido),
  };
  contract.versiones.push(nueva);
  contract.fechaModificacion = now;
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Edición",
    entidad: "Contrato",
    descripcion: `Nueva versión v${nueva.numero} guardada.`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    antes: `v${previous.numero}`,
    despues: `v${nueva.numero}`,
    version: nueva.numero,
    hash: nueva.hash,
  });
  return { ok: true, version: clone(nueva) };
}

export async function correoYaInvitado(id, email) {
  const { contract } = await findContract(id);
  const normalized = (email || "").trim().toLowerCase();
  return contract.partesInvitadas.some((p) => p.email.toLowerCase() === normalized);
}

function enviarInvitacion(contract, parte) {
  const enlace = `${origin()}/acceso/${parte.tokenAcceso}`;
  const result = simulateEmail(
    parte.email,
    `Invitación al contrato "${contract.nombre}"`,
    `${parte.mensaje ? parte.mensaje + "\n" : ""}Acceda al contrato: ${enlace}`
  );
  return { ok: result.ok, enlace };
}

// CU-03 pasos 11–16
export async function invitarParte(id, data) {
  const { contract } = await findContract(id);
  if (await correoYaInvitado(id, data.email)) return { ok: false, error: "DUPLICADO" };
  const parte = {
    id: newId("pt"),
    nombre: data.nombre.trim(),
    email: data.email.trim(),
    rol: data.rol,
    mensaje: data.mensaje || "",
    estadoInvitacion: "Pendiente",
    tokenAcceso: newToken("acc"),
    notificaciones: true,
    firma:
      data.rol === "Firmante"
        ? { estado: "Pendiente", fechaEvento: null, ip: null, hash: null, tokenFirma: null, otp: null, bloqueado: false }
        : null,
  };
  contract.partesInvitadas.push(parte);
  commit();
  const envio = enviarInvitacion(contract, parte);
  if (!envio.ok) return { ok: false, error: "CORREO", parteId: parte.id, enlace: envio.enlace };
  parte.estadoInvitacion = "Invitación enviada";
  commit();
  return { ok: true, parteId: parte.id, enlace: envio.enlace };
}

// CU-03 camino alternativo "Reintentar"
export async function reintentarInvitacion(id, parteId) {
  const { contract } = await findContract(id);
  const parte = contract.partesInvitadas.find((p) => p.id === parteId);
  const envio = enviarInvitacion(contract, parte);
  if (!envio.ok) return { ok: false, error: "CORREO", enlace: envio.enlace };
  parte.estadoInvitacion = "Invitación enviada";
  commit();
  return { ok: true, enlace: envio.enlace };
}

export function tieneFirmantes(contract) {
  return contract.partesInvitadas.some((p) => p.rol === "Firmante");
}

// CU-05 pasos 12–17
export async function cambiarEstado(id, nuevoEstado, razon, user) {
  const { contract } = await findContract(id);
  const anterior = contract.estado;
  if (!(TRANSICIONES[anterior] || []).includes(nuevoEstado)) return { ok: false, error: "TRANSICION" };
  contract.estado = nuevoEstado;
  contract.fechaModificacion = new Date().toISOString();
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Cambio de estado",
    entidad: "Contrato",
    descripcion: `Cambio de estado de ${anterior} a ${nuevoEstado}.${razon ? ` Razón: ${razon}` : ""}`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    antes: anterior,
    despues: nuevoEstado,
    version: currentVersion(contract).numero,
    hash: currentVersion(contract).hash,
  });
  notificarPartes(contract, `Cambio de estado del contrato "${contract.nombre}"`, `Nuevo estado: ${nuevoEstado}`);
  return { ok: true };
}

// CU-06 pasos 14–18
export async function publicarComentario(id, { texto, textoSeleccionado }, autor, autorEmail) {
  const { contract } = await findContract(id);
  const comentario = {
    id: newId("cm"),
    autor,
    fecha: new Date().toISOString(),
    texto,
    textoSeleccionado: textoSeleccionado || "",
  };
  contract.comentarios.push(comentario);
  commit();
  contract.partesInvitadas
    .filter((p) => p.notificaciones && p.email !== autorEmail)
    .forEach((p) => simulateEmail(p.email, `Nuevo comentario en "${contract.nombre}"`, texto));
  return clone(comentario);
}

// CU-14 pasos 14–19
export async function restaurarVersion(id, numero, razon, user) {
  const { contract } = await findContract(id);
  if (!ESTADOS_EDITABLES.concat("Listo para firmar").includes(contract.estado)) {
    return { ok: false, error: "NO_EDITABLE" };
  }
  const origen = contract.versiones.find((v) => v.numero === numero);
  const previous = currentVersion(contract);
  const now = new Date().toISOString();
  const nueva = {
    numero: previous.numero + 1,
    contenido: origen.contenido,
    autor: fullName(user),
    fecha: now,
    comentario: `Restauración de la versión ${numero}`,
    hash: await sha256(origen.contenido),
    restauracion: true,
  };
  contract.versiones.push(nueva);
  contract.fechaModificacion = now;
  commit();
  await registrarAuditoria({
    usuario: user.email,
    tipoAccion: "Restauración",
    entidad: "Contrato",
    descripcion: `Restauración de la versión ${numero} como versión ${nueva.numero}.${razon ? ` Razón: ${razon}` : ""}`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    antes: `v${previous.numero}`,
    despues: `v${nueva.numero}`,
    version: nueva.numero,
    hash: nueva.hash,
  });
  return { ok: true, nueva: nueva.numero };
}

// CU-13 paso 16
export async function registrarVerificacion(id, coincide, usuario) {
  const { contract } = await findContract(id);
  const v = currentVersion(contract);
  await registrarAuditoria({
    usuario,
    tipoAccion: "Verificación de integridad",
    entidad: "Contrato",
    descripcion: `Verificación de integridad: ${coincide ? "hashes coincidentes" : "hashes no coincidentes"}.`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    version: v.numero,
    hash: v.hash,
  });
}

// CU-10 paso 17
export async function registrarDescarga(id, numeroVersion, usuario) {
  const { contract } = await findContract(id);
  const v = contract.versiones.find((x) => x.numero === numeroVersion);
  await registrarAuditoria({
    usuario,
    tipoAccion: "Descarga",
    entidad: "Contrato",
    descripcion: `Descarga del PDF versión v${numeroVersion}.`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    version: numeroVersion,
    hash: v?.hash || null,
  });
}

// CU-04 pasos 2–4
export async function accederPorToken(token) {
  const db = await getDb();
  for (const contract of db.contracts) {
    const parte = contract.partesInvitadas.find((p) => p.tokenAcceso === token);
    if (!parte) continue;
    if (contract.estado === "Archivado") return { estado: "NO_DISPONIBLE" };
    contract.accesos.push({ parteId: parte.id, fecha: new Date().toISOString(), ip: MOCK_IP });
    commit();
    return { estado: "OK", contrato: clone(contract), parte: clone(parte) };
  }
  return { estado: "INVALIDO" };
}

export async function obtenerPorTokenAcceso(token) {
  const db = await getDb();
  for (const contract of db.contracts) {
    const parte = contract.partesInvitadas.find((p) => p.tokenAcceso === token);
    if (parte) return { contrato: clone(contract), parte: clone(parte) };
  }
  return null;
}
