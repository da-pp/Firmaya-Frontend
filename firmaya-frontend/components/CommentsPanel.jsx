"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import { publicarComentario } from "@/lib/services/contracts";
import { puedeComentar } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import { isBlank } from "@/lib/validators";

const MAX = 1000; // CU-06 paso 7

// CU-06 — Añadir comentarios y observaciones (panel lateral).
export default function CommentsPanel({ contract, rol, autor, autorEmail, selectedText, onPublished }) {
  const [adding, setAdding] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const permitido = puedeComentar(rol);
  const archivado = contract.estado === "Archivado";
  const restantes = MAX - texto.length;
  const comentarios = [...contract.comentarios].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  async function publicar() {
    setSuccess("");
    if (isBlank(texto)) {
      setError("El comentario no puede estar vacío");
      return;
    }
    await publicarComentario(contract.id, { texto: texto.trim(), textoSeleccionado: selectedText }, autor, autorEmail);
    setTexto("");
    setError("");
    setAdding(false);
    setSuccess("Comentario publicado con éxito");
    onPublished?.();
  }

  return (
    <div className="card">
      <h2>Comentarios</h2>

      {!permitido && <Message type="info">No puede añadir comentarios con su rol actual.</Message>}
      <Message type="success">{success}</Message>

      {permitido && !archivado && !adding && (
        <button type="button" className="btn btn-primary btn-block" onClick={() => setAdding(true)}>
          <Icon name="message" size={16} /> Añadir comentario
        </button>
      )}

      {permitido && !archivado && adding && (
        <div className="stack">
          {selectedText && (
            <div className="field">
              <span className="label">Texto seleccionado</span>
              <div className="fragment">&ldquo;{selectedText}&rdquo;</div>
            </div>
          )}
          <div className="field">
            <label className="label" htmlFor="comentario">
              Nuevo comentario<span className="required">*</span>
            </label>
            {error && <span className="helper-error">{error}</span>}
            <textarea
              id="comentario"
              className={`textarea ${error ? "is-invalid" : ""}`}
              value={texto}
              maxLength={MAX}
              onChange={(e) => {
                setTexto(e.target.value.slice(0, MAX));
                if (error) setError("");
              }}
              placeholder="Escribí una observación sobre el contrato."
            />
            <span className={`small ${restantes === 0 ? "counter-limit" : "muted"}`}>
              {restantes} caracteres restantes
            </span>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={publicar}>
            <Icon name="message" size={16} /> Publicar comentario
          </button>
        </div>
      )}

      <div className="stack">
        {comentarios.map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.autor}</strong>
            <span className="small muted">{formatDateTime(c.fecha)}</span>
            {c.textoSeleccionado && <span className="small fragment">&ldquo;{c.textoSeleccionado}&rdquo;</span>}
            <span>{c.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
