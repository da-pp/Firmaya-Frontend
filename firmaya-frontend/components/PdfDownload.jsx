"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import StatusBadge from "@/components/StatusBadge";
import { buildPdf } from "@/lib/pdf";
import { downloadBlob } from "@/lib/download";
import { formatDateTime } from "@/lib/format";
import { registrarDescarga } from "@/lib/services/contracts";

const NO_FIRMADO =
  "El PDF completo solo está disponible una vez que todos los firmantes hayan completado la firma";

function safeName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "-");
}

function signedFileName(contract, version) {
  return `${safeName(contract.nombre)}_v${version.numero}_firmado.pdf`;
}

// CU-10 pasos 5–12: contenido de la versión final + datos de firma + hash en el pie + leyenda.
function generarPdf(contract, version, conFirmas) {
  const blocks = [
    { text: contract.nombre, bold: true, size: 14 },
    { text: `Versión v${version.numero}` },
    { text: "" },
    { text: version.contenido },
  ];
  if (conFirmas) {
    blocks.push({ text: "" }, { text: "DATOS DE FIRMA", bold: true, size: 12 });
    contract.partesInvitadas
      .filter((p) => p.rol === "Firmante" && p.firma?.estado === "Firmado")
      .forEach((p) => {
        const firmada = contract.versiones.find((v) => v.numero === p.firma.versionFirmada) || version;
        blocks.push(
          { text: "" },
          { text: `Nombre del firmante: ${p.nombre}` },
          { text: `Fecha y hora de la firma: ${formatDateTime(p.firma.fechaEvento)}` },
          { text: `Dirección IP del firmante: ${p.firma.ip}` },
          { text: `Hash de la versión firmada: ${firmada.hash}` }
        );
      });
    blocks.push({ text: "" }, { text: "Documento con firma digital verificada por FirmaYA", bold: true });
  }
  return buildPdf({ title: contract.nombre, blocks, footer: `Hash: ${version.hash}` });
}

// compact: muestra solo el botón "Descargar PDF" (CU-04 paso 16, CU-08 paso 21).
export default function PdfDownload({ contract, usuario, compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | generating | error | done | noFirmado
  const version = contract.versiones[contract.versiones.length - 1];
  const firmado = contract.estado === "Firmado";

  async function descargar(conFirmas) {
    setStatus("generating");
    // Paso 4: indicador de progreso antes de compilar el documento.
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const blob = generarPdf(contract, version, conFirmas);
      const name = conFirmas ? signedFileName(contract, version) : `${safeName(contract.nombre)}_v${version.numero}.pdf`;
      downloadBlob(name, blob);
      await registrarDescarga(contract.id, version.numero, usuario);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function onDescargarPdf() {
    if (!firmado) {
      setStatus("noFirmado");
      return;
    }
    descargar(true);
  }

  const showAlternative = (!compact && !firmado) || status === "noFirmado";

  const feedback = (
    <>
      {status === "generating" && <Message type="info">Generando PDF...</Message>}
      {status === "done" && <Message type="success">El PDF se descargó exitosamente.</Message>}
      {status === "error" && (
        <Message type="error">
          El PDF no pudo ser generado en este momento.
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => descargar(firmado)}>
              <Icon name="refresh" size={14} /> Reintentar
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus("idle")}>
              Cancelar
            </button>
          </div>
        </Message>
      )}
      {showAlternative && (
        <Message type="info">
          {NO_FIRMADO}
          <div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => descargar(false)}>
              <Icon name="download" size={14} /> Descargar versión actual sin firmas
            </button>
          </div>
        </Message>
      )}
    </>
  );

  if (compact) {
    return (
      <div className="stack">
        {!(status === "noFirmado") && (
          <button type="button" className="btn btn-secondary" onClick={onDescargarPdf} disabled={status === "generating"}>
            <Icon name="download" size={16} /> Descargar PDF
          </button>
        )}
        {feedback}
      </div>
    );
  }

  return (
    <div className="card center">
      <span className="title-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
        <Icon name="download" />
      </span>
      <h2>Descargar contrato firmado</h2>
      <p className="small muted">El PDF final incluirá datos de firma, IP, fecha, hora y hash del documento.</p>
      <div className="card contract-header" style={{ width: "100%", textAlign: "left", boxShadow: "none" }}>
        <div>
          <span className="meta-label">Estado</span>
          <StatusBadge value={contract.estado} />
        </div>
        <div>
          <span className="meta-label">Versión</span>
          <span className="meta-value">v{version.numero}</span>
        </div>
        {firmado && (
          <div>
            <span className="meta-label">Archivo</span>
            <span className="meta-value">{signedFileName(contract, version)}</span>
          </div>
        )}
      </div>
      {firmado && (
        <button type="button" className="btn btn-primary" onClick={onDescargarPdf} disabled={status === "generating"}>
          <Icon name="download" size={16} /> Descargar PDF
        </button>
      )}
      <div style={{ width: "100%", textAlign: "left" }}>{feedback}</div>
    </div>
  );
}
