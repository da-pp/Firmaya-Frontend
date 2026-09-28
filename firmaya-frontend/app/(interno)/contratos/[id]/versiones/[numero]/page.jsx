"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContract } from "@/components/ContractContext";
import HashCopyButton from "@/components/HashCopyButton";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { formatDateTime } from "@/lib/format";
import { permiteRestaurar } from "@/lib/permissions";

// CU-11 pasos 14–18: contenido de una versión en modo solo lectura.
export default function VerVersionPage() {
  const contract = useContract();
  const router = useRouter();
  const { numero } = useParams();
  const n = Number(numero);
  const version = contract.versiones.find((v) => v.numero === n);
  const actual = contract.versiones[contract.versiones.length - 1].numero;
  const base = `/contratos/${contract.id}`;

  useEffect(() => {
    if (!version) router.replace(`${base}/versiones`);
  }, [version, base, router]);

  if (!version) return null;

  return (
    <>
      <PageTitle icon="history" title="Ver historial de versiones" />
      <Message type="info">Está viendo la versión {version.numero} , solo lectura.</Message>
      <div className="card contract-header">
        <div>
          <span className="meta-label">Versión</span>
          <span className="meta-value">v{version.numero}</span>
        </div>
        <div>
          <span className="meta-label">Autor</span>
          <span className="meta-value">{version.autor}</span>
        </div>
        <div>
          <span className="meta-label">Fecha</span>
          <span className="meta-value">{formatDateTime(version.fecha)}</span>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <span className="meta-label">Hash SHA-256</span>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <span className="hash">{version.hash}</span>
            <HashCopyButton hash={version.hash} />
          </div>
        </div>
      </div>
      <div className="card">
        <div className="contract-content">{version.contenido}</div>
      </div>
      <div className="row">
        <Link href={`${base}/versiones`} className="btn btn-secondary">
          Volver al historial
        </Link>
        {permiteRestaurar(contract.estado) && version.numero !== actual && (
          <Link href={`${base}/versiones/${version.numero}/restaurar`} className="btn btn-primary">
            <Icon name="refresh" size={16} /> Restaurar esta versión
          </Link>
        )}
      </div>
    </>
  );
}
