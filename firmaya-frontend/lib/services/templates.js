import { getDb, commit, clone, newId } from "@/lib/store";
import { registrarAuditoria } from "@/lib/services/audit";

export const TIPOS_CONTRATO = ["Arrendamiento", "Venta", "Mandato", "Otro"]; // CU-01 paso 3 / CU-16 paso 6
export const ESTADOS_PLANTILLA = ["Activa", "Inactiva"]; // CU-16 paso 9

// CU-16 paso 14: marcadores {{campo}}
export function detectarCampos(cuerpo) {
  const found = new Set();
  for (const match of (cuerpo || "").matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) found.add(match[1]);
  return Array.from(found);
}

export async function listarPlantillas() {
  const db = await getDb();
  return clone(db.templates);
}

export async function listarPlantillasActivas() {
  const db = await getDb();
  return clone(db.templates.filter((t) => t.estado === "Activa"));
}

// Contratos activos basados en la plantilla (no archivados).
export async function tieneContratosActivos(plantillaId) {
  const db = await getDb();
  return db.contracts.some((c) => c.plantillaId === plantillaId && c.estado !== "Archivado");
}

// CU-16 pasos 17–20 y flujo "Editar plantilla con contratos activos"
export async function guardarPlantilla(data, { nuevaVersion }, admin) {
  const db = await getDb();
  const fields = {
    nombre: data.nombre.trim(),
    tipo: data.tipo,
    descripcion: data.descripcion,
    cuerpo: data.cuerpo,
    estado: data.estado,
  };
  let template;
  if (data.id) {
    template = db.templates.find((t) => t.id === data.id);
    Object.assign(template, fields);
    if (nuevaVersion) template.version += 1;
  } else {
    template = { id: newId("p"), version: 1, ...fields };
    db.templates.push(template);
  }
  commit();
  await registrarAuditoria({
    usuario: admin.email,
    tipoAccion: data.id ? "Edición" : "Creación",
    entidad: "Plantilla",
    descripcion: `${data.id ? "Edición" : "Creación"} de la plantilla "${template.nombre}" (versión ${template.version}).`,
  });
  return clone(template);
}
