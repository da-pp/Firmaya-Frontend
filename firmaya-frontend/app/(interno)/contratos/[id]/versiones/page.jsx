"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FlashMessage from "@/components/FlashMessage";
import HashCopyButton from "@/components/HashCopyButton";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { formatDateTime, shortHash } from "@/lib/format";
import { permiteRestaurar } from "@/lib/permissions";

const EXPANDED_KEY = "firmaya-historial-expandida";

// CU-11 — Ver historial de versiones (+ botón "Restaurar esta versión" de CU-14)
export default function HistorialPage() {
  const contract = useContract();
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(false);

  const versiones = [...contract.versiones].sort((a, b) => b.numero - a.numero);
  const actual = contract.versiones[contract.versiones.length - 1].numero;
  const unica = contract.versiones.length === 1;
  const restaurable = permiteRestaurar(contract.estado);
  const base = `/contratos/${contract.id}`;

  // Paso 19: al volver al historial se mantiene el estado previo de la lista.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(EXPANDED_KEY) || "null");
      if (saved?.contractId === contract.id) queueMicrotask(() => setExpanded(saved.numero));
    } catch {
      // Sin almacenamiento de sesión disponible.
    }
  }, [contract.id]);

  function toggle(numero) {
    const next = expanded === numero ? null : numero;
    setExpanded(next);
    try {
      window.sessionStorage.setItem(EXPANDED_KEY, JSON.stringify({ contractId: contract.id, numero: next }));
    } catch {
      // Sin almacenamiento de sesión disponible.
    }
  }

  return (
    <>
      <PageTitle icon="history" title="Ver historial de versiones" />
      <ContractHeader contract={contract} />
      <FlashMessage />
      {copied && <Message type="success">Hash copiado al portapapeles.</Message>}
      {!restaurable && (
        <Message type="info">La restauración de versiones no está disponible en el estado actual del contrato.</Message>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Historial de versiones</h2>
          {unica ? (
            <button type="button" className="btn btn-secondary" disabled>
              <Icon name="compare" size={16} /> Comparar versiones
            </button>
          ) : (
            <Link href={`${base}/versiones/comparar`} className="btn btn-secondary">
              <Icon name="compare" size={16} /> Comparar versiones
            </Link>
          )}
        </div>
        {unica && <p className="muted">Este contrato aún no tiene versiones anteriores.</p>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Comentario</th>
                <th>Hash SHA-256</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {versiones.map((v) => (
                <Fragment key={v.numero}>
                  <tr className={`clickable ${expanded === v.numero ? "expanded-row" : ""}`} onClick={() => toggle(v.numero)}>
                    <td>
                      <div className="row">
                        <strong>v{v.numero}</strong>
                        {v.numero === actual && <span className="badge badge-success">Versión actual</span>}
                      </div>
                    </td>
                    <td>{v.autor}</td>
                    <td className="muted">{formatDateTime(v.fecha)}</td>
                    <td>{v.comentario.length > 40 ? `${v.comentario.slice(0, 40)}...` : v.comentario}</td>
                    <td>
                      <div className="row" style={{ flexWrap: "nowrap" }}>
                        <span className="hash-short" title={v.hash}>
                          {shortHash(v.hash)}
                        </span>
                        <HashCopyButton hash={v.hash} onCopied={() => setCopied(true)} />
                      </div>
                    </td>
                    <td>
                      {restaurable && v.numero !== actual && (
                        <Link
                          href={`${base}/versiones/${v.numero}/restaurar`}
                          className="btn btn-primary btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="refresh" size={14} /> Restaurar esta versión
                        </Link>
                      )}
                    </td>
                  </tr>
                  {expanded === v.numero && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <div className="stack">
                          {v.comentario && <p>{v.comentario}</p>}
                          <div className="row">
                            <Link href={`${base}/versiones/${v.numero}`} className="btn btn-secondary btn-sm">
                              <Icon name="eye" size={14} /> Ver
                            </Link>
                            {unica ? (
                              <button type="button" className="btn btn-secondary btn-sm" disabled>
                                <Icon name="compare" size={14} /> Comparar
                              </button>
                            ) : (
                              <Link href={`${base}/versiones/comparar`} className="btn btn-secondary btn-sm">
                                <Icon name="compare" size={14} /> Comparar
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
