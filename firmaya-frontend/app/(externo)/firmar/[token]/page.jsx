"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import PdfDownload from "@/components/PdfDownload";
import { useData } from "@/lib/useData";
import { isOtp } from "@/lib/validators";
import { enviarOtp, obtenerFirmaPorToken, verificarOtp } from "@/lib/services/signatures";

const INVALID = "El enlace de firma no es válido o ha expirado. Solicite un nuevo enlace al dueño del contrato.";
const BLOCKED = "El enlace de firma ha sido bloqueado por seguridad. Contacte al dueño del contrato.";

// CU-08 — Firmar contrato vía OTP
export default function FirmarPage() {
  const { token } = useParams();
  const { data } = useData(() => obtenerFirmaPorToken(token), [token]);
  const [leido, setLeido] = useState(false);
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState(null); // { type: "INCORRECTO" | "EXPIRADO", restantes }
  const contentRef = useRef(null);

  function checkEnd() {
    const el = contentRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setLeido(true);
  }

  // Paso 8: si el contenido entra completo en pantalla, el final ya está visible.
  useEffect(() => {
    if (data?.estado === "OK" && paso === 1) queueMicrotask(checkEnd);
  }, [data?.estado, paso]);

  async function iniciarVerificacion() {
    // Pasos 9–11
    const result = await enviarOtp(token);
    setEmail(result.email);
    setCodigo("");
    setError(null);
    setPaso(2);
  }

  async function onCodigo(value) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCodigo(digits);
    setError(null);
    // Pasos 13–15: se valida al completar los 6 dígitos numéricos.
    if (!isOtp(digits)) return;
    const result = await verificarOtp(token, digits);
    if (!result.ok && result.error === "INCORRECTO") setError({ type: "INCORRECTO", restantes: result.restantes });
    if (!result.ok && result.error === "EXPIRADO") setError({ type: "EXPIRADO" });
  }

  if (!data) return null;
  if (data.estado === "INVALIDO") return <Message type="error">{INVALID}</Message>;
  if (data.estado === "BLOQUEADO") return <Message type="error">{BLOCKED}</Message>;

  const { contrato, parte } = data;
  const version = contrato.versiones[contrato.versiones.length - 1];

  if (data.estado === "FIRMADO") {
    return (
      <>
        <PageTitle icon="key" title="Firmar contrato mediante OTP" />
        <Message type="success">Su firma ha sido registrada exitosamente. Puede descargar el contrato firmado.</Message>
        <div className="row">
          <PdfDownload contract={contrato} usuario={parte.email} compact />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle icon="key" title="Firmar contrato mediante OTP" />
      <div className="card">
        <div className="card-header">
          <span className="badge badge-info">Firma segura OTP</span>
          <span className="badge badge-warning">Paso {paso} de 2</span>
        </div>
        <div className="contract-header">
          <div>
            <span className="meta-label">Nombre del contrato</span>
            <span className="meta-value">{contrato.nombre}</span>
          </div>
          <div>
            <span className="meta-label">Versión a firmar</span>
            <span className="meta-value">v{version.numero}</span>
          </div>
        </div>
        <div>
          <span className="meta-label">Hash de la versión</span>
          <span className="hash">{version.hash}</span>
        </div>
      </div>

      {paso === 1 && (
        <div className="card">
          <h2>Lectura del contrato</h2>
          <div ref={contentRef} className="contract-content scroll" onScroll={checkEnd}>
            {version.contenido}
          </div>
          <div className="row-end">
            <button type="button" className="btn btn-primary" disabled={!leido} onClick={iniciarVerificacion}>
              <Icon name="edit" size={16} /> Leer y firmar el contrato
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="card">
          <p>Ingrese el código de 6 dígitos enviado a {email}. El código expira en 10 minutos</p>
          <div className="field" style={{ maxWidth: 240 }}>
            <label className="label" htmlFor="otp">
              Código OTP<span className="required">*</span>
            </label>
            <input
              id="otp"
              className={`input hash ${error ? "is-invalid" : ""}`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(e) => onCodigo(e.target.value)}
              style={{ fontSize: 20, letterSpacing: "0.4em" }}
            />
          </div>
          {error?.type === "INCORRECTO" && (
            <Message type="error">
              El código ingresado es incorrecto. Verifique el código e intente nuevamente. Intentos restantes:{" "}
              {error.restantes}.
            </Message>
          )}
          {error?.type === "EXPIRADO" && (
            <Message type="warning">
              El código ha expirado. ¿Desea recibir un nuevo código?
              <div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={iniciarVerificacion}>
                  Reenviar código
                </button>
              </div>
            </Message>
          )}
        </div>
      )}
    </>
  );
}
