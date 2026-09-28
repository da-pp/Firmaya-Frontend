"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PasswordStrength from "@/components/PasswordStrength";
import { passwordChecks } from "@/lib/validators";
import { restablecerContrasena, validarTokenRecuperacion } from "@/lib/services/auth";

const TOKEN_ERROR = "El enlace de recuperación ha expirado o no es válido. Solicita uno nuevo.";

// CU-21 — Recuperar Contraseña (pasos 11–24)
export default function RestablecerContrasenaPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    let active = true;
    validarTokenRecuperacion(token).then((ok) => {
      if (active) setStatus(ok ? "valid" : "invalid");
    });
    return () => {
      active = false;
    };
  }, [token]);

  const cumple = passwordChecks(password).every((c) => c.ok);
  const noCoinciden = confirm.length > 0 && confirm !== password;
  const habilitado = cumple && confirm === password;

  async function onSubmit(event) {
    event.preventDefault();
    if (!habilitado) return;
    const result = await restablecerContrasena(token, password);
    setStatus(result.ok ? "done" : "invalid");
  }

  if (status === "loading") return null;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="stack center">
          <span className="title-icon" style={{ width: 48, height: 48 }}>
            <Icon name="lock" size={22} />
          </span>
          <h1 style={{ fontSize: 24 }}>Recuperar contraseña</h1>
        </div>

        {status === "invalid" && (
          <Message type="error">
            {TOKEN_ERROR}
            <div>
              <Link href="/recuperar-contrasena" className="btn btn-secondary btn-sm">
                Solicitar nuevo enlace
              </Link>
            </div>
          </Message>
        )}

        {status === "done" && (
          <Message type="success">
            Tu contraseña se restableció exitosamente.
            <div>
              <Link href="/login" className="btn btn-primary btn-sm">
                Ir a inicio de sesión
              </Link>
            </div>
          </Message>
        )}

        {status === "valid" && (
          <form className="stack" onSubmit={onSubmit} noValidate>
            <FormField label="Nueva contraseña" htmlFor="password" required>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <PasswordStrength value={password} />
            <FormField
              label="Confirmar nueva contraseña"
              htmlFor="confirm"
              required
              error={noCoinciden ? "Las contraseñas no coinciden." : ""}
            >
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                className={`input ${noCoinciden ? "is-invalid" : ""}`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </FormField>
            <button type="submit" className="btn btn-primary btn-block" disabled={!habilitado}>
              Restablecer contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
