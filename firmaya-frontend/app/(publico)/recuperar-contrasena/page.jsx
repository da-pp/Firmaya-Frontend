"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import { isValidEmail } from "@/lib/validators";
import { solicitarRecuperacion } from "@/lib/services/auth";

const EMAIL_ERROR = "Ingrese un correo electrónico válido (ej. nombre@dominio.com)";
const GENERIC =
  "Si el correo electrónico ingresado corresponde a una cuenta registrada, recibirás instrucciones para restablecer tu contraseña.";

// CU-21 — Recuperar Contraseña (pasos 1–10)
export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const valido = isValidEmail(email);
  const mostrarError = email.length > 0 && !valido;

  async function onSubmit(event) {
    event.preventDefault();
    if (!valido) return;
    await solicitarRecuperacion(email);
    setSent(true);
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <div className="stack center">
          <span className="title-icon" style={{ width: 48, height: 48 }}>
            <Icon name="lock" size={22} />
          </span>
          <h1 style={{ fontSize: 24 }}>Recuperar contraseña</h1>
          <p className="muted">Ingresá tu email para recibir instrucciones.</p>
        </div>
        <FormField label="Correo electrónico" htmlFor="email" required error={mostrarError ? EMAIL_ERROR : ""}>
          <input
            id="email"
            type="email"
            className={`input ${mostrarError ? "is-invalid" : ""}`}
            maxLength={254}
            placeholder="usuario@dominio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
          />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block" disabled={!valido}>
          <Icon name="mail" size={16} /> Enviar instrucciones
        </button>
        {sent && <Message type="info">{GENERIC}</Message>}
      </form>
    </div>
  );
}
