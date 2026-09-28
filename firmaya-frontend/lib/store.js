// Almacén local de datos de demostración (no existe backend en el proyecto).
// Los servicios de lib/services son la única puerta de acceso, de modo que
// pueden reemplazarse por llamadas reales sin modificar las pantallas.

import { buildSeed } from "@/data/seed";

const STORAGE_KEY = "firmaya-demo-db-v1";

let cache = null;
let initPromise = null;
const listeners = new Set();

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Sin almacenamiento disponible: los datos quedan solo en memoria.
  }
}

async function init() {
  cache = readStorage() || (await buildSeed());
  writeStorage();
  // Sincroniza cambios hechos en otras pestañas (ej. un firmante firmando mientras
  // el dueño del contrato consulta el estado de firmas — CU-09 paso 18).
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      cache = JSON.parse(event.newValue);
      listeners.forEach((fn) => fn());
    } catch {
      // Ignorar valores corruptos.
    }
  });
  return cache;
}

export function getDb() {
  if (cache) return Promise.resolve(cache);
  if (!initPromise) initPromise = init();
  return initPromise;
}

export function commit() {
  writeStorage();
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function newToken(prefix) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`;
}

// Simulación del servicio de correo: el backend real enviaría el mensaje.
export function simulateEmail(to, subject, body) {
  console.info(`[FirmaYA · correo simulado] Para: ${to}\nAsunto: ${subject}\n${body}`);
  return { ok: true };
}
