"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { copyToClipboard } from "@/lib/download";
import { parseDDMMAAAA, startOfToday } from "@/lib/format";
import { isBlank } from "@/lib/validators";
import { CANALES_FIRMA, obtenerEnlaceFirma, reintentarFallidos, solicitarFirmas } from "@/lib/services/signatures";

const FECHA_ERROR = "La fecha límite debe ser posterior a la fecha actual";

// CU-07 — Solicitar firma de las partes
export default function SolicitarFirmasPage() {
  const contract = useContract();
  const router = useRouter();
  const [canal, setCanal] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [fallidos, setFallidos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");

  const listo = contract.estado === "Listo para firmar";
  const firmantes = contract.partesInvitadas.filter((p) => p.rol === "Firmante");
  const firmados = firmantes.filter((p) => p.firma.estado === "Firmado").length;

  // Precondición: contrato en estado "Listo para firmar".
  useEffect(() => {
    if (!listo) router.replace(`/contratos/${contract.id}`);
  }, [listo, contract.id, router]);

  async function onSubmit(event) {
    event.preventDefault();
    setSuccess("");
    const next = {};
    // Paso 12
    if (!canal) next.canal = "Este campo es obligatorio";
    // Paso 13
    let limite = null;
    if (!isBlank(fechaLimite)) {
      limite = parseDDMMAAAA(fechaLimite);
      if (!limite || limite <= startOfToday()) next.fechaLimite = FECHA_ERROR;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = await solicitarFirmas(contract.id, {
      canal,
      mensaje,
      fechaLimite: limite ? limite.toISOString() : null,
    });
    handleResult(result);
  }

  function handleResult(result) {
    if (result.ok) {
      setFallidos([]);
      setSuccess("Solicitudes de firma enviadas exitosamente");
    } else {
      setFallidos(result.fallidos);
      setSeleccionado(result.fallidos[0] || "");
    }
  }

  async function copiarEnlace() {
    if (!seleccionado) return;
    const enlace = await obtenerEnlaceFirma(contract.id, seleccionado);
    await copyToClipboard(enlace);
  }

  if (!listo) return null;

  return (
    <>
      <PageTitle icon="mail" title="Solicitar firma a las partes" />
      <ContractHeader contract={contract} />

      {firmantes.length === 0 ? (
        <Message type="warning">
          No hay firmantes asignados. Debe invitar al menos a una parte con el rol de Firmante antes de solicitar
          firmas.
          <div>
            <Link href={`/contratos/${contract.id}/invitar`} className="btn btn-secondary btn-sm">
              Ir a invitar partes
            </Link>
          </div>
        </Message>
      ) : (
        <>
          <Message type="success">{success}</Message>
          {fallidos.length > 0 && (
            <Message type="error">
              <ul className="list-plain">
                {firmantes
                  .filter((p) => fallidos.includes(p.id))
                  .map((p) => (
                    <li key={p.id}>
                      <label className="choice">
                        <input
                          type="radio"
                          name="fallido"
                          checked={seleccionado === p.id}
                          onChange={() => setSeleccionado(p.id)}
                        />
                        {p.nombre} — {p.email}
                      </label>
                    </li>
                  ))}
              </ul>
              <div className="row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => handleResult(await reintentarFallidos(contract.id, fallidos))}
                >
                  <Icon name="refresh" size={14} /> Reintentar fallidos
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={copiarEnlace}>
                  Copiar enlace
                </button>
              </div>
            </Message>
          )}

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h2>Firmantes</h2>
                {contract.solicitudFirma && (
                  <span className="small muted">
                    {firmados} de {firmantes.length} firmas completadas
                  </span>
                )}
              </div>
              {firmantes.map((p) => (
                <div key={p.id} className="option-card">
                  <div>
                    <strong>{p.nombre}</strong>
                    <div className="small muted">{p.email}</div>
                  </div>
                  <StatusBadge value={p.firma.estado} />
                </div>
              ))}
            </div>

            <form className="card" onSubmit={onSubmit} noValidate>
              <h2>Configurar solicitud</h2>
              <FormField label="Canal de notificación" required error={errors.canal}>
                <div className="choice-group">
                  {CANALES_FIRMA.map((c) => (
                    <label key={c} className="choice">
                      <input
                        type="radio"
                        name="canal"
                        value={c}
                        checked={canal === c}
                        onChange={() => {
                          setCanal(c);
                          setErrors((e) => ({ ...e, canal: undefined }));
                        }}
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField label="Mensaje personalizado" htmlFor="mensaje">
                <textarea
                  id="mensaje"
                  className="textarea"
                  maxLength={500}
                  placeholder="Mensaje opcional para los firmantes."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </FormField>
              <FormField label="Fecha límite para firma" htmlFor="fechaLimite" error={errors.fechaLimite} errorPosition="above">
                <input
                  id="fechaLimite"
                  className={`input ${errors.fechaLimite ? "is-invalid" : ""}`}
                  placeholder="DD/MM/AAAA"
                  value={fechaLimite}
                  onChange={(e) => {
                    setFechaLimite(e.target.value);
                    setErrors((er) => ({ ...er, fechaLimite: undefined }));
                  }}
                />
              </FormField>
              <button type="submit" className="btn btn-primary btn-block">
                <Icon name="mail" size={16} /> Enviar solicitudes de firma
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
