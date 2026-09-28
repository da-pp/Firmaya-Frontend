import { getDb, commit, clone, newId } from "@/lib/store";
import { MOCK_IP } from "@/data/seed";

// Tipos de acción registrados por los casos de uso que indican registro en auditoría.
export const TIPOS_ACCION = [
  "Creación",
  "Edición",
  "Cambio de estado",
  "Descarga",
  "Firma",
  "Verificación de integridad",
  "Restauración",
  "Desactivación",
  "Inicio de sesión",
  "Cambio de contraseña",
];

export async function registrarAuditoria(entry) {
  const db = await getDb();
  db.audit.push({
    id: newId("a"),
    fecha: new Date().toISOString(),
    ip: MOCK_IP,
    antes: null,
    despues: null,
    version: null,
    hash: null,
    contratoId: null,
    contratoNombre: null,
    ...entry,
  });
  commit();
}

// CU-18: registros ordenados del más reciente al más antiguo.
export async function listarAuditoria() {
  const db = await getDb();
  return clone(db.audit).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}
