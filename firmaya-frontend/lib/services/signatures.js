import { getDb, commit, clone, newToken, simulateEmail } from "@/lib/store";
import { sha256 } from "@/lib/hash";
import { registrarAuditoria } from "@/lib/services/audit";
import { MOCK_IP } from "@/data/seed";

const OTP_VIGENCIA_MS = 10 * 60 * 1000; // CU-08 paso 12
const OTP_MAX_INTENTOS = 3; // CU-08 camino alternativo

export const CANALES_FIRMA = ["Correo electrónico"]; // CU-07 paso 8

function firmantes(contract) {
  return contract.partesInvitadas.filter((p) => p.rol === "Firmante");
}

function currentVersion(contract) {
  return contract.versiones[contract.versiones.length - 1];
}

function enlaceFirma(parte) {
  return `${window.location.origin}/firmar/${parte.firma.tokenFirma}`;
}

function enviarSolicitud(contract, parte, mensaje) {
  return simulateEmail(
    parte.email,
    `Solicitud de firma: "${contract.nombre}"`,
    `${mensaje ? mensaje + "\n" : ""}Enlace de firma: ${enlaceFirma(parte)}`
  );
}

export async function obtenerEnlaceFirma(contratoId, parteId) {
  const db = await getDb();
  const contract = db.contracts.find((c) => c.id === contratoId);
  const parte = contract.partesInvitadas.find((p) => p.id === parteId);
  if (!parte.firma.tokenFirma) {
    parte.firma.tokenFirma = newToken("fir");
    commit();
  }
  return enlaceFirma(parte);
}

// CU-07 pasos 14–19
export async function solicitarFirmas(contratoId, config) {
  const db = await getDb();
  const contract = db.contracts.find((c) => c.id === contratoId);
  const now = new Date().toISOString();
  contract.solicitudFirma = { fecha: now, canal: config.canal, mensaje: config.mensaje, fechaLimite: config.fechaLimite || null };
  const fallidos = [];
  for (const parte of firmantes(contract)) {
    if (parte.firma.estado === "Firmado") continue;
    if (!parte.firma.tokenFirma) parte.firma.tokenFirma = newToken("fir");
    const result = enviarSolicitud(contract, parte, config.mensaje);
    if (result.ok) {
      parte.firma.estado = "Notificado";
      parte.firma.fechaEvento = now;
    } else {
      fallidos.push(parte.id);
    }
  }
  contract.fechaModificacion = now;
  commit();
  return { ok: fallidos.length === 0, fallidos };
}

// CU-07 camino alternativo "Reintentar fallidos"
export async function reintentarFallidos(contratoId, parteIds) {
  const db = await getDb();
  const contract = db.contracts.find((c) => c.id === contratoId);
  const now = new Date().toISOString();
  const fallidos = [];
  for (const parte of firmantes(contract).filter((p) => parteIds.includes(p.id))) {
    const result = enviarSolicitud(contract, parte, contract.solicitudFirma?.mensaje);
    if (result.ok) {
      parte.firma.estado = "Notificado";
      parte.firma.fechaEvento = now;
    } else {
      fallidos.push(parte.id);
    }
  }
  commit();
  return { ok: fallidos.length === 0, fallidos };
}

// CU-09 pasos 15–17
export async function reenviarSolicitud(contratoId, parteId) {
  const db = await getDb();
  const contract = db.contracts.find((c) => c.id === contratoId);
  const parte = contract.partesInvitadas.find((p) => p.id === parteId);
  if (!parte.firma.tokenFirma) parte.firma.tokenFirma = newToken("fir");
  const result = enviarSolicitud(contract, parte, contract.solicitudFirma?.mensaje);
  if (!result.ok) return { ok: false };
  parte.firma.estado = "Re-notificado";
  parte.firma.fechaEvento = new Date().toISOString();
  commit();
  return { ok: true };
}

// CU-08 paso 2: el enlace de firma (o el enlace de acceso de un Firmante) identifica a la parte.
function findSigner(db, token) {
  for (const contract of db.contracts) {
    const parte = contract.partesInvitadas.find(
      (p) => p.rol === "Firmante" && (p.firma?.tokenFirma === token || p.tokenAcceso === token)
    );
    if (parte) return { contract, parte };
  }
  return {};
}

export async function obtenerFirmaPorToken(token) {
  const db = await getDb();
  const { contract, parte } = findSigner(db, token);
  if (!contract) return { estado: "INVALIDO" };
  if (parte.firma.bloqueado) return { estado: "BLOQUEADO" };
  if (parte.firma.estado === "Firmado") return { estado: "FIRMADO", contrato: clone(contract), parte: clone(parte) };
  if (contract.estado !== "Listo para firmar") return { estado: "INVALIDO" };
  return { estado: "OK", contrato: clone(contract), parte: clone(parte) };
}

// CU-08 paso 10 / camino "Reenviar código"
export async function enviarOtp(token) {
  const db = await getDb();
  const { contract, parte } = findSigner(db, token);
  const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
  parte.firma.otp = { codigo, enviadoEn: new Date().toISOString(), intentos: parte.firma.otp?.intentos || 0 };
  commit();
  simulateEmail(
    parte.email,
    `Código de firma para "${contract.nombre}"`,
    `Su código OTP es ${codigo}. El código expira en 10 minutos.`
  );
  return { ok: true, email: parte.email };
}

// CU-08 pasos 14–20
export async function verificarOtp(token, codigo) {
  const db = await getDb();
  const { contract, parte } = findSigner(db, token);
  if (!contract || parte.firma.bloqueado) return { ok: false, error: "BLOQUEADO" };
  const otp = parte.firma.otp;
  if (!otp) return { ok: false, error: "EXPIRADO" };

  if (Date.now() - new Date(otp.enviadoEn).getTime() > OTP_VIGENCIA_MS) {
    return { ok: false, error: "EXPIRADO" };
  }

  if (otp.codigo !== codigo) {
    otp.intentos += 1;
    if (otp.intentos >= OTP_MAX_INTENTOS) {
      parte.firma.bloqueado = true;
      commit();
      return { ok: false, error: "BLOQUEADO" };
    }
    commit();
    return { ok: false, error: "INCORRECTO", restantes: OTP_MAX_INTENTOS - otp.intentos };
  }

  const now = new Date().toISOString();
  const version = currentVersion(contract);
  parte.firma.estado = "Firmado";
  parte.firma.fechaEvento = now;
  parte.firma.ip = MOCK_IP;
  parte.firma.versionFirmada = version.numero;
  parte.firma.hash = await sha256(`${version.hash}${parte.email}${now}`);
  parte.firma.otp = { ...otp, utilizado: true };
  contract.fechaModificacion = now;
  commit();

  await registrarAuditoria({
    usuario: parte.email,
    tipoAccion: "Firma",
    entidad: "Contrato",
    descripcion: `Firma registrada por ${parte.nombre}.`,
    contratoId: contract.id,
    contratoNombre: contract.nombre,
    version: version.numero,
    hash: version.hash,
  });

  // CU-08 paso 19
  if (firmantes(contract).every((p) => p.firma.estado === "Firmado")) {
    contract.estado = "Firmado";
    commit();
    await registrarAuditoria({
      usuario: "Sistema",
      tipoAccion: "Cambio de estado",
      entidad: "Contrato",
      descripcion: "Cambio de estado de Listo para firmar a Firmado.",
      contratoId: contract.id,
      contratoNombre: contract.nombre,
      antes: "Listo para firmar",
      despues: "Firmado",
      version: version.numero,
      hash: version.hash,
    });
    const owner = db.users.find((u) => u.id === contract.creadorId);
    if (owner) simulateEmail(owner.email, `Contrato firmado: "${contract.nombre}"`, "Todas las firmas han sido completadas.");
  }
  return { ok: true };
}
