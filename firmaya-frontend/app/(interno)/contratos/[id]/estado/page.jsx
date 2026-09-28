"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { useSession } from "@/lib/session";
import { TRANSICIONES, cambiarEstado, tieneFirmantes } from "@/lib/services/contracts";

// Paso 6: descripción informativa del estado seleccionado, derivada de las reglas de los casos de uso.
const DESCRIPCIONES = {
  "En Revisión": "El contrato continúa editable y puede recibir nuevas versiones.",
  "Listo para firmar": "Habilita la solicitud de firma a las partes con rol Firmante.",
  Archivado:
    "El contrato deja de estar disponible para las partes invitadas y no admite nuevas invitaciones ni comentarios.",
};

// CU-05 — Cambiar estado del contrato
export default function CambiarEstadoPage() {
  const contract = useContract();
  const user = useSession();
  const router = useRouter();
  const [nuevo, setNuevo] = useState("");
  const [razon, setRazon] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null); // "confirm" | "sinFirmantes"
  const [result, setResult] = useState(null);

  const disponibles = TRANSICIONES[contract.estado] || [];

  function onConfirmClick() {
    setResult(null);
    if (!nuevo) {
      setError("Este campo es obligatorio");
      return;
    }
    setDialog("confirm");
  }

  async function ejecutar() {
    setDialog(null);
    const response = await cambiarEstado(contract.id, nuevo, razon.trim(), user);
    if (response.ok) {
      setResult({ type: "success", text: "Estado actualizado exitosamente" });
      setNuevo("");
      setRazon("");
    } else {
      setResult({ type: "error", text: "Esta transición de estado no es posible. Verifique el flujo permitido." });
    }
  }

  function onConfirmar() {
    // Paso 12: validación de la transición.
    if (!disponibles.includes(nuevo)) {
      setDialog(null);
      setResult({ type: "error", text: "Esta transición de estado no es posible. Verifique el flujo permitido." });
      return;
    }
    if (nuevo === "Listo para firmar" && !tieneFirmantes(contract)) {
      setDialog("sinFirmantes");
      return;
    }
    ejecutar();
  }

  return (
    <>
      <PageTitle icon="refresh" title="Cambiar estado del contrato" />
      <ContractHeader contract={contract} />
      {result && <Message type={result.type}>{result.text}</Message>}

      <div className="grid-2">
        <div className="card">
          <h2>Cambiar estado</h2>
          <div className="field">
            <span className="label">Estado actual</span>
            <span>
              <StatusBadge value={contract.estado} />
            </span>
          </div>
          <FormField label="Nuevo estado" htmlFor="nuevoEstado" required error={error}>
            <select
              id="nuevoEstado"
              className={`select ${error ? "is-invalid" : ""}`}
              value={nuevo}
              onChange={(e) => {
                setNuevo(e.target.value);
                setError("");
              }}
            >
              <option value="">Seleccionar</option>
              {disponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </FormField>
          {nuevo && <Message type="info">{DESCRIPCIONES[nuevo]}</Message>}
          <FormField label="Razón del cambio" htmlFor="razon">
            <textarea
              id="razon"
              className="textarea"
              maxLength={500}
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
            />
          </FormField>
          <button type="button" className="btn btn-primary btn-block" onClick={onConfirmClick}>
            <Icon name="refresh" size={16} /> Confirmar cambio de estado
          </button>
        </div>

        <div className="card">
          <h2>Flujo permitido</h2>
          {Object.entries(TRANSICIONES).map(([desde, hacia]) => (
            <div key={desde} className="option-card">
              {desde} → {hacia.join(", ")}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={dialog === "confirm"}
        message={`¿Confirma el cambio de estado de ${contract.estado} a ${nuevo}?`}
        actions={[
          { label: "Confirmar", variant: "primary", onClick: onConfirmar },
          { label: "Cancelar", onClick: () => setDialog(null) },
        ]}
      />
      <ConfirmModal
        open={dialog === "sinFirmantes"}
        message="El contrato no tiene firmantes asignados. ¿Desea continuar o ir a invitar partes?"
        actions={[
          { label: "Continuar", variant: "primary", onClick: ejecutar },
          { label: "Invitar partes", onClick: () => router.push(`/contratos/${contract.id}/invitar`) },
        ]}
      />
    </>
  );
}
