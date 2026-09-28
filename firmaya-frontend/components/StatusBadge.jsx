// Etiquetas de estado definidas en el documento (contrato, invitación, firma, usuario, plantilla).
const VARIANTS = {
  Borrador: "",
  "En Revisión": "badge-warning",
  "Listo para firmar": "badge-info",
  Firmado: "badge-success",
  Archivado: "",
  Pendiente: "badge-warning",
  "Invitación enviada": "badge-warning",
  Notificado: "badge-warning",
  "Re-notificado": "badge-warning",
  Activo: "badge-success",
  Activa: "badge-success",
  Inactivo: "badge-danger",
  Inactiva: "badge-danger",
};

export default function StatusBadge({ value }) {
  return <span className={`badge ${VARIANTS[value] ?? ""}`}>{value}</span>;
}
