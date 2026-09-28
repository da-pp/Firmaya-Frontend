"use client";

import { Fragment, useState } from "react";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import Pagination from "@/components/Pagination";
import { downloadBlob, toCsvBlob } from "@/lib/download";
import { endOfDay, formatDateTimeSeconds, parseDDMMAAAA } from "@/lib/format";
import { useData } from "@/lib/useData";
import { TIPOS_ACCION, listarAuditoria } from "@/lib/services/audit";

const PAGE_SIZE = 50; // CU-18 pasos 2 y 19
const EMPTY_FILTERS = { desde: "", hasta: "", usuario: "", tipo: "", contrato: "" };

// CU-18 — Registro de acciones de auditoría
export default function AuditoriaPage() {
  const { data: registros } = useData(() => listarAuditoria(), []);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [exportStatus, setExportStatus] = useState(null); // "ok" | "error"

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
    setExpanded(null);
  }

  if (!registros) return null;

  // Paso 15: filtros combinados.
  const desde = parseDDMMAAAA(filters.desde);
  const hasta = parseDDMMAAAA(filters.hasta);
  const usuario = filters.usuario.trim().toLowerCase();
  const contrato = filters.contrato.trim().toLowerCase();
  const filtrados = registros.filter((r) => {
    const fecha = new Date(r.fecha);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > endOfDay(hasta)) return false;
    if (usuario && !r.usuario.toLowerCase().includes(usuario)) return false;
    if (filters.tipo && r.tipoAccion !== filters.tipo) return false;
    if (contrato && !(r.contratoNombre || "").toLowerCase().includes(contrato)) return false;
    return true;
  });
  const visibles = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportar() {
    // Pasos 21–25
    try {
      const blob = toCsvBlob(
        ["Fecha y hora", "Usuario", "Tipo de acción", "Entidad afectada", "Descripción", "Dirección IP"],
        filtrados.map((r) => [
          formatDateTimeSeconds(r.fecha),
          r.usuario,
          r.tipoAccion,
          r.entidad,
          r.descripcion,
          r.ip,
        ])
      );
      downloadBlob("registro_auditoria.csv", blob);
      setExportStatus("ok");
    } catch {
      setExportStatus("error");
    }
  }

  return (
    <>
      <PageTitle icon="search" title="Registro de acciones de auditoría" />

      <div className="card">
        <div className="field-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <FormField label="Fecha inicio" htmlFor="desde">
            <input
              id="desde"
              className="input"
              placeholder="DD/MM/AAAA"
              value={filters.desde}
              onChange={(e) => update("desde", e.target.value)}
            />
          </FormField>
          <FormField label="Fecha fin" htmlFor="hasta">
            <input
              id="hasta"
              className="input"
              placeholder="DD/MM/AAAA"
              value={filters.hasta}
              onChange={(e) => update("hasta", e.target.value)}
            />
          </FormField>
          <FormField label="Usuario" htmlFor="usuario">
            <input
              id="usuario"
              className="input"
              list="usuarios-auditoria"
              value={filters.usuario}
              onChange={(e) => update("usuario", e.target.value)}
            />
            <datalist id="usuarios-auditoria">
              {Array.from(new Set(registros.map((r) => r.usuario))).map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Tipo de acción" htmlFor="tipo">
            <select id="tipo" className="select" value={filters.tipo} onChange={(e) => update("tipo", e.target.value)}>
              <option value="">Seleccionar</option>
              {TIPOS_ACCION.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Contrato" htmlFor="contrato">
            <input
              id="contrato"
              className="input"
              value={filters.contrato}
              onChange={(e) => update("contrato", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {exportStatus === "ok" && <Message type="success">Registro exportado exitosamente.</Message>}
      {exportStatus === "error" && (
        <Message type="error">
          El registro no pudo ser exportado en este momento.
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportar}>
              <Icon name="refresh" size={14} /> Reintentar
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setExportStatus(null)}>
              Cancelar
            </button>
          </div>
        </Message>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Log de auditoría</h2>
            <span className="small muted">{filtrados.length} registros encontrados.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={exportar}>
            <Icon name="download" size={16} /> Exportar Registro
          </button>
        </div>

        {filtrados.length === 0 ? (
          <Message type="info">
            No se encontraron registros con los filtros aplicados.
            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setPage(1);
                }}
              >
                Borrar filtros
              </button>
            </div>
          </Message>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Tipo de acción</th>
                  <th>Entidad afectada</th>
                  <th>Descripción</th>
                  <th>Dirección IP</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((r) => (
                  <Fragment key={r.id}>
                    <tr
                      className={`clickable ${expanded === r.id ? "expanded-row" : ""}`}
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      <td className="muted" style={{ whiteSpace: "nowrap" }}>
                        {formatDateTimeSeconds(r.fecha)}
                      </td>
                      <td>{r.usuario}</td>
                      <td>
                        <span className="badge">{r.tipoAccion}</span>
                      </td>
                      <td>{r.entidad}</td>
                      <td>{r.descripcion}</td>
                      <td className="muted">{r.ip}</td>
                    </tr>
                    {expanded === r.id && (
                      <tr className="expanded-row">
                        <td colSpan={6}>
                          <div className="stack small">
                            <div>
                              <strong>Antes:</strong> {r.antes ?? "—"}
                            </div>
                            <div>
                              <strong>Después:</strong> {r.despues ?? "—"}
                            </div>
                            <div>
                              <strong>Versión del contrato:</strong> {r.version ? `v${r.version}` : "—"}
                            </div>
                            <div>
                              <strong>Hash:</strong> <span className="hash">{r.hash ?? "—"}</span>
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
        )}
        <Pagination page={page} total={filtrados.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </>
  );
}
