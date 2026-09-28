"use client";

import { useState } from "react";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";
import { downloadBlob, toCsvBlob } from "@/lib/download";
import { daysFromNow, endOfDay, formatDateTime, parseDDMMAAAA, startOfToday } from "@/lib/format";
import { useData } from "@/lib/useData";
import { ESTADOS_CONTRATO, listarContratosConResponsable } from "@/lib/services/contracts";

const PAGE_SIZE = 20; // CU-17 paso 19
const RANGE_ERROR = "La fecha de inicio debe ser anterior a la fecha de fin.";

function defaultRange() {
  const fin = startOfToday();
  const inicio = new Date(fin);
  inicio.setDate(inicio.getDate() - 30); // Paso 2: últimos 30 días
  return { inicio, fin };
}

const METRICAS = [
  { id: "activos", label: "Contratos activos totales", test: (c) => c.estado !== "Archivado" },
  { id: "pendientes", label: "Contratos pendientes de firma", test: (c) => c.estado === "Listo para firmar" },
  { id: "firmados", label: "Contratos firmados en el período", test: (c) => c.estado === "Firmado" },
  {
    id: "vencer",
    label: "Contratos próximos a vencer (próximos 7 días)",
    test: (c) =>
      c.estado !== "Archivado" &&
      c.fechaExpiracion &&
      new Date(c.fechaExpiracion) >= startOfToday() &&
      new Date(c.fechaExpiracion) <= endOfDay(daysFromNow(7)),
  },
];

// CU-17 — Ver Panel de Actividad Global
export default function ActividadPage() {
  const { data: contratos } = useData(() => listarContratosConResponsable(), []);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [rango, setRango] = useState(defaultRange);
  const [rangeError, setRangeError] = useState("");
  const [estados, setEstados] = useState([]);
  const [metrica, setMetrica] = useState(null);
  const [page, setPage] = useState(1);

  // Pasos 10–15: el rango se aplica solo cuando ambas fechas son válidas y ordenadas.
  function onFecha(nextInicio, nextFin) {
    setFechaInicio(nextInicio);
    setFechaFin(nextFin);
    if (!nextInicio && !nextFin) {
      setRangeError("");
      setRango(defaultRange());
      return;
    }
    const inicio = parseDDMMAAAA(nextInicio);
    const fin = parseDDMMAAAA(nextFin);
    if (!inicio || !fin) {
      setRangeError("");
      return;
    }
    if (inicio >= fin) {
      setRangeError(RANGE_ERROR);
      return;
    }
    setRangeError("");
    setRango({ inicio, fin });
    setPage(1);
  }

  function toggleEstado(estado) {
    setEstados((list) => (list.includes(estado) ? list.filter((e) => e !== estado) : [...list, estado]));
    setPage(1);
  }

  if (!contratos) return null;

  const base = contratos.filter((c) => {
    const modificado = new Date(c.fechaModificacion);
    const enPeriodo = modificado >= rango.inicio && modificado <= endOfDay(rango.fin);
    return enPeriodo && (estados.length === 0 || estados.includes(c.estado));
  });
  const sinDatos = base.length === 0;
  const porEstado = ESTADOS_CONTRATO.map((e) => ({ estado: e, total: base.filter((c) => c.estado === e).length }));
  const maxEstado = Math.max(1, ...porEstado.map((e) => e.total));
  const recientes = [...base]
    .sort((a, b) => new Date(b.fechaModificacion) - new Date(a.fechaModificacion))
    .slice(0, 10);

  const metricaActiva = METRICAS.find((m) => m.id === metrica);
  const detalle = metricaActiva
    ? base.filter(metricaActiva.test).sort((a, b) => new Date(b.fechaModificacion) - new Date(a.fechaModificacion))
    : [];

  function exportar() {
    const blob = toCsvBlob(
      ["Nombre", "Estado", "Responsable", "Última modificación"],
      detalle.map((c) => [c.nombre, c.estado, c.responsable, formatDateTime(c.fechaModificacion)])
    );
    downloadBlob(`actividad_${metricaActiva.id}.csv`, blob);
  }

  return (
    <>
      <PageTitle icon="grid" title="Ver panel de actividad global" />

      <div className="card">
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div style={{ minWidth: 180 }}>
            <FormField label="Fecha de inicio" htmlFor="fechaInicio" error={rangeError}>
              <input
                id="fechaInicio"
                className={`input ${rangeError ? "is-invalid" : ""}`}
                placeholder="DD/MM/AAAA"
                value={fechaInicio}
                onChange={(e) => onFecha(e.target.value, fechaFin)}
              />
            </FormField>
          </div>
          <div style={{ minWidth: 180 }}>
            <FormField label="Fecha de fin" htmlFor="fechaFin">
              <input
                id="fechaFin"
                className={`input ${rangeError ? "is-invalid" : ""}`}
                placeholder="DD/MM/AAAA"
                value={fechaFin}
                onChange={(e) => onFecha(fechaInicio, e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Filtro por estado">
            <div className="choice-group">
              {ESTADOS_CONTRATO.map((e) => (
                <label key={e} className="choice">
                  <input type="checkbox" checked={estados.includes(e)} onChange={() => toggleEstado(e)} />
                  {e}
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      {sinDatos && <Message type="info">No se registró actividad en el período seleccionado.</Message>}

      <div className="grid-4">
        {METRICAS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`card metric ${metrica === m.id ? "active" : ""}`}
            onClick={() => {
              setMetrica(m.id);
              setPage(1);
            }}
          >
            <span className="small muted">{m.label}</span>
            <span className="metric-value">{base.filter(m.test).length}</span>
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Contratos por estado</h2>
          {porEstado.map((e) => (
            <div key={e.estado} className="bar-row">
              <div className="card-header small">
                <span>{e.estado}</span>
                <span>{e.total}</span>
              </div>
              <div className="progress">
                <span style={{ width: `${(e.total / maxEstado) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Actividad reciente</h2>
          {recientes.map((c) => (
            <div key={c.id} className="option-card">
              <div>
                <strong>{c.nombre}</strong>
                <div className="small muted">
                  Responsable: {c.responsable} - {formatDateTime(c.fechaModificacion)}
                </div>
              </div>
              <StatusBadge value={c.estado} />
            </div>
          ))}
        </div>
      </div>

      {metricaActiva && (
        <div className="card">
          <div className="card-header">
            <h2>{metricaActiva.label}</h2>
            <button type="button" className="btn btn-secondary" onClick={exportar}>
              <Icon name="download" size={16} /> Exportar Lista
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Última modificación</th>
                </tr>
              </thead>
              <tbody>
                {detalle.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>
                      <StatusBadge value={c.estado} />
                    </td>
                    <td>{c.responsable}</td>
                    <td className="muted">{formatDateTime(c.fechaModificacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={detalle.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}
    </>
  );
}
