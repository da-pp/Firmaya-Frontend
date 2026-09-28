"use client";

import { useState } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { copyToClipboard } from "@/lib/download";
import { formatDateTime } from "@/lib/format";
import { obtenerEnlaceFirma, reenviarSolicitud } from "@/lib/services/signatures";

// CU-09 — Consultar estado de firmas pendientes
export default function EstadoFirmasPage() {
  const contract = useContract();
  const [confirmar, setConfirmar] = useState(null); // parte
  const [fallo, setFallo] = useState(null); // parte
  const [success, setSuccess] = useState("");

  const firmantes = contract.partesInvitadas.filter((p) => p.rol === "Firmante");
  const firmados = firmantes.filter((p) => p.firma.estado === "Firmado").length;
  const total = firmantes.length;

  async function reenviar(parte) {
    setConfirmar(null);
    setSuccess("");
    const result = await reenviarSolicitud(contract.id, parte.id);
    if (result.ok) {
      setFallo(null);
      setSuccess("Solicitud reenviada exitosamente");
    } else {
      setFallo(parte);
    }
  }

  async function copiarEnlace() {
    await copyToClipboard(await obtenerEnlaceFirma(contract.id, fallo.id));
  }

  if (!contract.solicitudFirma) {
    return (
      <>
        <PageTitle icon="activity" title="Consultar estado de firmas pendientes" />
        <ContractHeader contract={contract} />
        <Message type="info">
          Aún no se han enviado solicitudes de firma para este contrato.
          <div>
            <Link href={`/contratos/${contract.id}/solicitar-firmas`} className="btn btn-secondary btn-sm">
              Solicitar firmas
            </Link>
          </div>
        </Message>
      </>
    );
  }

  return (
    <>
      <PageTitle icon="activity" title="Consultar estado de firmas pendientes" />
      <ContractHeader contract={contract} />

      {total > 0 && firmados === total && (
        <Message type="success">Todas las firmas han sido completadas. El contrato está firmado.</Message>
      )}
      <Message type="success">{success}</Message>
      {fallo && (
        <Message type="error">
          No se pudo reenviar la solicitud. ¿Desea reintentar o copiar el enlace manualmente?
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => reenviar(fallo)}>
              <Icon name="refresh" size={14} /> Reintentar
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copiarEnlace}>
              Copiar enlace
            </button>
          </div>
        </Message>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Progreso de firmas</h2>
            <span className="small muted">
              {firmados} de {total} firmas completadas
            </span>
          </div>
          <div className="progress" style={{ maxWidth: 320 }}>
            <span style={{ width: `${total ? (firmados / total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo electrónico</th>
                <th>Estado</th>
                <th>Fecha y hora del evento</th>
                <th>IP / Hash</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {firmantes.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td className="muted">{p.email}</td>
                  <td>
                    <StatusBadge value={p.firma.estado} />
                  </td>
                  <td className="muted">{p.firma.fechaEvento ? formatDateTime(p.firma.fechaEvento) : "—"}</td>
                  <td>
                    {p.firma.estado === "Firmado" ? (
                      <div>
                        <div>{p.firma.ip}</div>
                        <div className="hash" style={{ maxWidth: 260 }}>
                          {p.firma.hash}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {p.firma.estado !== "Firmado" && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmar(p)}>
                        <Icon name="refresh" size={14} /> Reenviar solicitud
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(confirmar)}
        message={confirmar ? `¿Confirmar reenvío de solicitud a ${confirmar.nombre}?` : ""}
        actions={[
          { label: "Confirmar", variant: "primary", onClick: () => reenviar(confirmar) },
          { label: "Cancelar", onClick: () => setConfirmar(null) },
        ]}
      />
    </>
  );
}
