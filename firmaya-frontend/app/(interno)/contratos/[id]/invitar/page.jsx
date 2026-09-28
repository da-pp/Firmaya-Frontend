"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FlashMessage from "@/components/FlashMessage";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { copyToClipboard } from "@/lib/download";
import { isBlank, isValidEmail } from "@/lib/validators";
import { ROLES_PARTE, invitarParte, reintentarInvitacion } from "@/lib/services/contracts";

const EMAIL_ERROR = "Ingrese un correo electrónico válido (ej. nombre@dominio.com)";
const DUPLICATE_ERROR = "Esta dirección ya ha sido invitada a este contrato";
const REQUIRED = "Este campo es obligatorio";

const EMPTY = { email: "", nombre: "", rol: "", mensaje: "" };

// CU-03 — Invitar a las partes al contrato
export default function InvitarPage() {
  const contract = useContract();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [mailError, setMailError] = useState(null); // { parteId, enlace, email }
  const [copied, setCopied] = useState("");

  // Precondición: el contrato no está en estado Archivado.
  useEffect(() => {
    if (contract.estado === "Archivado") router.replace(`/contratos/${contract.id}`);
  }, [contract.estado, contract.id, router]);

  const duplicated = (email) =>
    contract.partesInvitadas.some((p) => p.email.toLowerCase() === email.trim().toLowerCase());

  // Pasos 8–9: validación en tiempo real del correo.
  function emailError(email) {
    if (!email) return undefined;
    if (!isValidEmail(email)) return EMAIL_ERROR;
    if (duplicated(email)) return DUPLICATE_ERROR;
    return undefined;
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: field === "email" ? emailError(value) : undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSuccess("");
    setCopied("");
    const next = {};
    if (isBlank(form.email)) next.email = REQUIRED;
    else if (emailError(form.email)) next.email = emailError(form.email);
    if (isBlank(form.nombre)) next.nombre = REQUIRED;
    if (!form.rol) next.rol = REQUIRED;
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = await invitarParte(contract.id, form);
    if (result.ok) {
      setSuccess(`Invitación enviada exitosamente a ${form.email.trim()}`);
      setMailError(null);
      setForm(EMPTY);
    } else if (result.error === "DUPLICADO") {
      setErrors({ email: DUPLICATE_ERROR });
    } else {
      setMailError({ parteId: result.parteId, enlace: result.enlace, email: form.email.trim() });
    }
  }

  async function retry() {
    const result = await reintentarInvitacion(contract.id, mailError.parteId);
    if (result.ok) {
      setSuccess(`Invitación enviada exitosamente a ${mailError.email}`);
      setMailError(null);
      setForm(EMPTY);
    }
  }

  async function copy() {
    if (await copyToClipboard(mailError.enlace)) setCopied("Enlace copiado al portapapeles");
  }

  if (contract.estado === "Archivado") return null;

  return (
    <>
      <PageTitle icon="users" title="Invitar partes al contrato" />
      <FlashMessage />
      <ContractHeader contract={contract} />
      <Message type="success">{success}</Message>
      {mailError && (
        <Message type="error">
          No se pudo enviar el correo de invitación. ¿Desea reintentar o copiar el enlace manualmente?
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
              <Icon name="refresh" size={14} /> Reintentar
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
              Copiar enlace
            </button>
          </div>
        </Message>
      )}
      <Message type="success">{copied}</Message>

      <div className="grid-side-left">
        <form className="card" onSubmit={onSubmit} noValidate>
          <h2>Nueva invitación</h2>
          <FormField label="Correo electrónico" htmlFor="email" required error={errors.email} errorPosition="above">
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? "is-invalid" : ""}`}
              maxLength={254}
              placeholder="nombre@dominio.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </FormField>
          <FormField label="Nombre de la parte" htmlFor="nombre" required error={errors.nombre}>
            <input
              id="nombre"
              className={`input ${errors.nombre ? "is-invalid" : ""}`}
              maxLength={150}
              placeholder="Nombre y apellido"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
            />
          </FormField>
          <FormField label="Rol" htmlFor="rol" required error={errors.rol}>
            <select
              id="rol"
              className={`select ${errors.rol ? "is-invalid" : ""}`}
              value={form.rol}
              onChange={(e) => update("rol", e.target.value)}
            >
              <option value="">Seleccionar</option>
              {ROLES_PARTE.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Mensaje personalizado" htmlFor="mensaje">
            <textarea
              id="mensaje"
              className="textarea"
              maxLength={500}
              placeholder="Mensaje opcional para incluir en la invitación."
              value={form.mensaje}
              onChange={(e) => update("mensaje", e.target.value)}
            />
          </FormField>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={errors.email === DUPLICATE_ERROR}
          >
            <Icon name="mail" size={16} /> Enviar invitación
          </button>
        </form>

        <div className="card">
          <h2>Partes invitadas</h2>
          {contract.partesInvitadas.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.partesInvitadas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td className="muted">{p.email}</td>
                      <td>
                        <span className="badge">{p.rol}</span>
                      </td>
                      <td>
                        <StatusBadge value={p.estadoInvitacion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
