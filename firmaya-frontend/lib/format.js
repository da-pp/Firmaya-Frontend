// Formatos de fecha definidos en los casos de uso:
// DD/MM/AAAA, DD/MM/AAAA HH:mm (CU-04, CU-09, CU-10, CU-11) y DD/MM/AAAA HH:mm:ss (CU-18).

const pad = (n) => String(n).padStart(2, "0");

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTimeSeconds(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${formatDateTime(d)}:${pad(d.getSeconds())}`;
}

// Convierte "DD/MM/AAAA" en Date (00:00 local). Devuelve null si el formato o la fecha no son válidos.
export function parseDDMMAAAA(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((text || "").trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function shortHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 16)}...`;
}

export function initials(nombre, apellido) {
  return `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase();
}
