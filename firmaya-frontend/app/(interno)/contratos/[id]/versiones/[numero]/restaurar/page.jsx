"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { setFlash } from "@/lib/flash";
import { formatDateTime } from "@/lib/format";
import { permiteRestaurar } from "@/lib/permissions";
import { useSession } from "@/lib/session";
import { restaurarVersion } from "@/lib/services/contracts";

// CU-14 — Restaurar una versión anterior (panel de confirmación, pasos 4–19)
export default function RestaurarVersionPage() {
  const contract = useContract();
  const user = useSession();
  const router = useRouter();
  const { numero } = useParams();
  const n = Number(numero);
  const version = contract.versiones.find((v) => v.numero === n);
  const actual = contract.versiones[contract.versiones.length - 1].numero;
  const historial = `/contratos/${contract.id}/versiones`;
  const valido = Boolean(version) && n !== actual && permiteRestaurar(contract.estado);

  const [razon, setRazon] = useState("");
  const [dialog, setDialog] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!valido && !done) router.replace(historial);
  }, [valido, done, historial, router]);

  async function confirmar() {
    setDialog(false);
    setDone(true);
    const result = await restaurarVersion(contract.id, n, razon.trim(), user);
    if (result.ok) {
      setFlash("success", `La versión ${n} fue restaurada exitosamente como la nueva versión ${result.nueva}.`);
    }
    router.push(historial);
  }

  if (!valido && !done) return null;

  return (
    <>
      <PageTitle icon="history" title="Restaurar una versión anterior" />
      <ContractHeader contract={contract} />
      <div className="card">
        <h2>Confirmar restauración</h2>
        <div className="contract-header">
          <div>
            <span className="meta-label">Versión a restaurar</span>
            <span className="meta-value">v{version.numero}</span>
          </div>
          <div>
            <span className="meta-label">Fecha de la versión</span>
            <span className="meta-value">{formatDateTime(version.fecha)}</span>
          </div>
          <div>
            <span className="meta-label">Autor de la versión</span>
            <span className="meta-value">{version.autor}</span>
          </div>
        </div>
        <Message type="info">
          Esta acción creará una nueva versión con el contenido de la versión seleccionada. El historial no se perderá.
        </Message>
        <FormField label="Razón de la restauración" htmlFor="razon">
          <textarea
            id="razon"
            className="textarea"
            maxLength={500}
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
          />
        </FormField>
        <div className="row-end">
          <button type="button" className="btn btn-primary" onClick={() => setDialog(true)} disabled={done}>
            <Icon name="refresh" size={16} /> Confirmar restauración
          </button>
        </div>
      </div>

      <ConfirmModal
        open={dialog}
        message={`¿Confirma la restauración de la versión ${n}?`}
        actions={[
          { label: "Confirmar", variant: "primary", onClick: confirmar },
          {
            label: "Cancelar",
            onClick: () => {
              setDialog(false);
              router.push(historial);
            },
          },
        ]}
      />
    </>
  );
}
