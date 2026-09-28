"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import { setFlash } from "@/lib/flash";
import { isBlank, isValidEmail } from "@/lib/validators";
import { iniciarSesion } from "@/lib/services/auth";

const CREDENCIALES = "El correo electrónico o la contraseña son incorrectos.";
const BLOQUEADA =
  "Tu cuenta ha sido bloqueada temporalmente. Puedes intentarlo de nuevo en 15 minutos o recuperar tu contraseña.";

// CU-19 — Iniciar Sesión
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null); // { type: "CREDENCIALES" | "BLOQUEADA" | "CONEXION" }
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  async function autenticar() {
    setLoading(true);
    try {
      const result = await iniciarSesion(email, password);
      if (result.ok) {
        setFlash("success", `Bienvenido, ${result.user.nombre} ${result.user.apellido}.`);
        router.push("/panel");
        return;
      }
      setError({ type: result.error });
    } catch {
      setError({ type: "CONEXION" });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    // Pasos 12–13
    const next = {};
    if (isBlank(email)) next.email = "El campo Correo electrónico es obligatorio";
    else if (!isValidEmail(email)) next.email = "Ingrese un correo electrónico válido";
    if (isBlank(password)) next.password = "El campo Contraseña es obligatorio";
    setErrors(next);
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.password) {
      passwordRef.current?.focus();
      return;
    }
    // Paso 14: requisito de longitud mínima (8 caracteres).
    if (password.length < 8) {
      setError({ type: "CREDENCIALES" });
      return;
    }
    autenticar();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-split">
        <aside className="auth-aside">
          <div className="stack">
            <span className="title-icon" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Icon name="file" />
            </span>
            <h2>Plataforma Centralizada de Gestión de Contratos</h2>
            <p className="small" style={{ opacity: 0.8 }}>
              Accedé para crear, editar, firmar y auditar contratos con trazabilidad por versión y hash.
            </p>
          </div>
          <span className="small" style={{ opacity: 0.6 }}>
            Firma OTP · Auditoría · Versionado
          </span>
        </aside>

        <form className="auth-main" onSubmit={onSubmit} noValidate>
          <div>
            <h1 style={{ fontSize: 22 }}>Iniciar sesión</h1>
            <p className="small muted">Ingresá con tu cuenta para continuar.</p>
          </div>

          {error?.type === "CREDENCIALES" && <Message type="error">{CREDENCIALES}</Message>}
          {error?.type === "BLOQUEADA" && <Message type="error">{BLOQUEADA}</Message>}
          {error?.type === "CONEXION" && (
            <Message type="error">
              No se pudo conectar al servidor. Verifica tu conexión a internet.
              <div className="row">
                <button type="button" className="btn btn-secondary btn-sm" onClick={autenticar}>
                  Reintentar
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setError(null)}>
                  Cancelar
                </button>
              </div>
            </Message>
          )}

          <FormField label="Correo electrónico" htmlFor="email" required error={errors.email}>
            <input
              id="email"
              ref={emailRef}
              type="email"
              autoComplete="username"
              autoFocus
              className={`input ${errors.email ? "is-invalid" : ""}`}
              maxLength={254}
              placeholder="usuario@dominio.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((er) => ({ ...er, email: undefined }));
              }}
              onKeyDown={(e) => {
                // Paso 8: el foco pasa al campo Contraseña.
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
            />
          </FormField>
          <FormField label="Contraseña" htmlFor="password" required error={errors.password}>
            <input
              id="password"
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              className={`input ${errors.password ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((er) => ({ ...er, password: undefined }));
              }}
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            Iniciar Sesión
          </button>
          <Link href="/recuperar-contrasena" className="small center" style={{ textAlign: "center" }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </div>
    </div>
  );
}
