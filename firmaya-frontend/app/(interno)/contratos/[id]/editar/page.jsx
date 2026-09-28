"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommentsPanel from "@/components/CommentsPanel";
import ConfirmModal from "@/components/ConfirmModal";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import FlashMessage from "@/components/FlashMessage";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/lib/session";
import { ESTADOS_EDITABLES, guardarVersion } from "@/lib/services/contracts";

const MIN_CARACTERES = 100; // CU-02 paso 15
const CONTENT_ERROR = "El contenido del contrato debe tener al menos 100 caracteres";

// CU-02 — Editar contrato en línea
export default function EditarContratoPage() {
  const contract = useContract();
  const user = useSession();
  const router = useRouter();
  const current = contract.versiones[contract.versiones.length - 1];

  const [contenido, setContenido] = useState(current.contenido);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState("");
  const [pendingHref, setPendingHref] = useState(null);
  const editorRef = useRef(null);

  const editable = ESTADOS_EDITABLES.includes(contract.estado);
  const dirty = editable && contenido !== current.contenido;

  // Camino alternativo "Usuario intenta salir sin guardar" (pasos 9–11).
  useEffect(() => {
    if (!dirty) return undefined;
    function onClick(event) {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  async function guardar() {
    setSuccess("");
    // Pasos 14–15
    if (contenido.trim().length < MIN_CARACTERES) {
      setError(CONTENT_ERROR);
      return false;
    }
    setError("");
    const result = await guardarVersion(contract.id, contenido, comentario, user);
    if (!result.ok) return false;
    setComentario("");
    setSuccess(`Versión guardada exitosamente — v${result.version.numero} · Hash: ${result.version.hash}`);
    return true;
  }

  function captureSelection() {
    const el = editorRef.current;
    if (!el) return;
    const text = el.value.slice(el.selectionStart, el.selectionEnd).trim();
    if (text) setSelected(text);
  }

  if (!editable) {
    return (
      <>
        <PageTitle icon="edit" title="Editar contrato en línea" />
        <Message type="warning">
          Este contrato no puede ser editado en su estado actual.
          <div>
            <Link href={`/contratos/${contract.id}`} className="btn btn-secondary btn-sm">
              Ver Contrato
            </Link>
          </div>
        </Message>
      </>
    );
  }

  return (
    <>
      <PageTitle icon="edit" title="Editar contrato en línea" />
      <FlashMessage />
      <ContractHeader contract={contract} fullHash />
      <Message type="success">{success}</Message>

      <div className="grid-side">
        <div className="card">
          {error && <span className="helper-error">{error}</span>}
          <textarea
            ref={editorRef}
            aria-label="Contenido del contrato"
            className={`textarea contract-editor ${error ? "is-invalid" : ""}`}
            value={contenido}
            onChange={(e) => {
              setContenido(e.target.value);
              setSuccess("");
            }}
            onSelect={captureSelection}
          />
        </div>

        <div className="stack">
          <div className="card">
            <h2>Guardar nueva versión</h2>
            <div className="field">
              <label className="label" htmlFor="comentarioVersion">
                Comentario de Versión
              </label>
              <textarea
                id="comentarioVersion"
                className="textarea"
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={guardar}>
              <Icon name="file" size={16} /> Guardar Versión
            </button>
          </div>
          <CommentsPanel
            contract={contract}
            rol={user.rol}
            autor={`${user.nombre} ${user.apellido}`}
            autorEmail={user.email}
            selectedText={selected}
            onPublished={() => setSelected("")}
          />
        </div>
      </div>

      <ConfirmModal
        open={Boolean(pendingHref)}
        message="¿Desea guardar los cambios antes de salir?"
        actions={[
          {
            label: "Guardar",
            variant: "primary",
            onClick: async () => {
              setPendingHref(null);
              await guardar();
            },
          },
          {
            label: "Descartar",
            onClick: () => {
              const href = pendingHref;
              setContenido(current.contenido);
              setPendingHref(null);
              router.push(href);
            },
          },
          { label: "Cancelar", onClick: () => setPendingHref(null) },
        ]}
      />
    </>
  );
}
