// Validaciones de frontend definidas explícitamente en los casos de uso.

// "formato válido (contiene @ y dominio)" — CU-03, CU-15, CU-19, CU-21
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

// "exactamente 64 caracteres hexadecimales (0-9, a-f)" — CU-13
export function isHex64(value) {
  return /^[0-9a-f]{64}$/.test(value || "");
}

// "numérico, exactamente 6 dígitos" — CU-08
export function isOtp(value) {
  return /^\d{6}$/.test(value || "");
}

// "solo letras y espacios" — CU-15
export function isLettersAndSpaces(value) {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(value || "");
}

export function isBlank(value) {
  return !value || !String(value).trim();
}

// Requisitos de contraseña — CU-21 paso 14
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Al menos 1 mayúscula", test: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { id: "number", label: "Al menos 1 número", test: (v) => /\d/.test(v) },
  { id: "special", label: "Al menos 1 carácter especial", test: (v) => /[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/.test(v) },
];

export function passwordChecks(value) {
  return PASSWORD_REQUIREMENTS.map((r) => ({ ...r, ok: r.test(value || "") }));
}
