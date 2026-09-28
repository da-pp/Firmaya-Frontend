"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { compareTexts } from "@/lib/diff";
import { formatDateTime } from "@/lib/format";

function Column({ title, version, segments, current, containerRef }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="small muted">
        <div>Autor: {version.autor}</div>
        <div>Fecha y hora: {formatDateTime(version.fecha)}</div>
        <div className="hash">Hash: {version.hash}</div>
      </div>
      <div ref={containerRef} className="contract-content scroll">
        {segments.map((s, i) =>
          s.type === "equal" ? (
            <span key={i}>{s.text}</span>
          ) : (
            <span
              key={i}
              data-change={s.change}
              className={`${s.type === "add" ? "diff-add" : "diff-del"} ${s.change === current ? "diff-current" : ""}`}
            >
              {s.text}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// CU-12 — Comparar versiones de contrato
export default function CompararPage() {
  const contract = useContract();
  const ordered = [...contract.versiones].sort((a, b) => a.numero - b.numero);
  const [a, setA] = useState(String(ordered[0].numero)); // precargada con la más antigua
  const [b, setB] = useState(String(ordered[ordered.length - 1].numero)); // precargada con la más reciente
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(0);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const iguales = a === b;

  function comparar() {
    const versionA = ordered.find((v) => String(v.numero) === a);
    const versionB = ordered.find((v) => String(v.numero) === b);
    setResult({ versionA, versionB, ...compareTexts(versionA.contenido, versionB.contenido) });
    setCurrent(0);
  }

  // Paso 14: desplazamiento automático al cambio seleccionado.
  useEffect(() => {
    if (!result || !result.changes) return;
    for (const ref of [leftRef, rightRef]) {
      const el = ref.current?.querySelector(`[data-change="${current}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [current, result]);

  return (
    <>
      <PageTitle icon="compare" title="Comparar versiones del contrato" />
      <ContractHeader contract={contract} />

      <div className="card">
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <FormField label="Versión base (Versión A)" htmlFor="versionA" required>
              <select
                id="versionA"
                className="select"
                value={a}
                onChange={(e) => {
                  setA(e.target.value);
                  setResult(null);
                }}
              >
                {ordered.map((v) => (
                  <option key={v.numero} value={v.numero}>
                    v{v.numero}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <FormField label="Versión a comparar (Versión B)" htmlFor="versionB" required>
              <select
                id="versionB"
                className="select"
                value={b}
                onChange={(e) => {
                  setB(e.target.value);
                  setResult(null);
                }}
              >
                {ordered.map((v) => (
                  <option key={v.numero} value={v.numero}>
                    v{v.numero}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <button type="button" className="btn btn-primary" onClick={comparar} disabled={iguales}>
            <Icon name="compare" size={16} /> Comparar
          </button>
        </div>
        {iguales && <Message type="warning">Seleccione dos versiones diferentes para realizar la comparación.</Message>}
      </div>

      {result && (
        <>
          {result.changes === 0 ? (
            <Message type="info">Las versiones seleccionadas no presentan diferencias en el contenido.</Message>
          ) : (
            <div className="card-header">
              <span className="badge badge-info">
                {result.changes} cambios detectados entre las versiones seleccionadas.
              </span>
              <div className="row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  Cambio anterior
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrent((c) => Math.min(result.changes - 1, c + 1))}
                  disabled={current >= result.changes - 1}
                >
                  Siguiente cambio
                </button>
              </div>
            </div>
          )}
          <div className="grid-2">
            <Column
              title={`Versión A - v${result.versionA.numero}`}
              version={result.versionA}
              segments={result.left}
              current={current}
              containerRef={leftRef}
            />
            <Column
              title={`Versión B - v${result.versionB.numero}`}
              version={result.versionB}
              segments={result.right}
              current={current}
              containerRef={rightRef}
            />
          </div>
        </>
      )}

      <div>
        <Link href={`/contratos/${contract.id}/versiones`} className="btn btn-secondary">
          Volver al historial
        </Link>
      </div>
    </>
  );
}
