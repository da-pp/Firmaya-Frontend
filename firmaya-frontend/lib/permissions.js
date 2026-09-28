// Reglas de rol y estado extraídas de los casos de uso.

const ROLES_CONTRATO = ["Abogado", "Agente Inmobiliario"];

// CU-01 precondición
export function puedeCrearContratos(user) {
  return Boolean(user && ROLES_CONTRATO.includes(user.rol));
}

// CU-02, CU-03, CU-05, CU-07, CU-09, CU-12, CU-14: Abogado / Agente con permisos sobre el contrato (creador).
export function puedeGestionarContrato(user, contract) {
  return Boolean(user && contract && contract.creadorId === user.id && ROLES_CONTRATO.includes(user.rol));
}

// CU-15 a CU-18 precondición
export function esAdministrador(user) {
  return user?.rol === "Administrador";
}

// CU-20 actores
export function puedeConfigurarNotificaciones(user) {
  return Boolean(user && ROLES_CONTRATO.includes(user.rol));
}

// CU-06 precondición: Abogado, Agente, Firmante o Revisor.
export function puedeComentar(rol) {
  return ["Abogado", "Agente Inmobiliario", "Firmante", "Revisor"].includes(rol);
}

// CU-14 precondición
export function permiteRestaurar(estado) {
  return estado !== "Firmado" && estado !== "Archivado";
}
