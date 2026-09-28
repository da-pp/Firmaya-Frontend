"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/lib/session";
import { puedeConfigurarNotificaciones } from "@/lib/permissions";
import { guardarPreferencias, obtenerPreferencias } from "@/lib/services/users";

// Eventos mostrados en el prototipo de CU-20 (el texto del CU no los enumera).
const EVENTOS = [
  { id: "nuevaVersion", label: "Nueva versión publicada" },
  { id: "firmaRecibida", label: "Firma recibida" },
  { id: "listoParaFirmar", label: "Contrato listo para firmar" },
  { id: "nuevoComentario", label: "Nuevo comentario" },
  { id: "cambioEstado", label: "Cambio de estado" },
  { id: "proximoAVencer", label: "Contrato próximo a vencer" },
];

const CANALES = ["Correo Electrónico", "Notificación de Plataforma"]; // CU-20 paso 6

// Mi Perfil → sección Notificaciones (CU-20 — Configurar notificaciones)
export default function PerfilPage() {
  const user = useSession();
  const router = useRouter();
  const permitido = puedeConfigurarNotificaciones(user);
  const [seccion, setSeccion] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [guardadas, setGuardadas] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    if (!permitido) {
      router.replace("/panel");
      return undefined;
    }
    let active = true;
    obtenerPreferencias(user.id).then((p) => {
      if (!active) return;
      setPrefs(p);
      setGuardadas(p);
    });
    return () => {
      active = false;
    };
  }, [permitido, user.id, router]);

  function toggleEvento(id) {
    setPrefs((p) => ({ ...p, eventos: { ...p.eventos, [id]: !p.eventos[id] } }));
    setSuccess("");
  }

  function toggleCanal(canal) {
    setPrefs((p) => ({
      ...p,
      canales: p.canales.includes(canal) ? p.canales.filter((c) => c !== canal) : [...p.canales, canal],
    }));
    setError("");
    setSuccess("");
  }

  async function guardar(next = prefs) {
    setWarning(false);
    const saved = await guardarPreferencias(user.id, next);
    setGuardadas(saved);
    setSuccess("Preferencias de notificación guardadas exitosamente.");
  }

  function onGuardar() {
    // Paso 12
    if (prefs.canales.length === 0) {
      setError("Debe seleccionar al menos un canal de notificación.");
      return;
    }
    // Camino alternativo: todos los eventos desactivados.
    if (EVENTOS.every((e) => !prefs.eventos[e.id])) {
      setWarning(true);
      return;
    }
    guardar();
  }

  function activarTodo() {
    setWarning(false);
    setPrefs((p) => ({ ...p, eventos: Object.fromEntries(EVENTOS.map((e) => [e.id, true])) }));
  }

  if (!permitido || !prefs) return null;

  return (
    <>
      <PageTitle icon="bell" title="Mi Perfil" />
      <nav className="tabs" aria-label="Secciones del perfil">
        <a
          href="#notificaciones"
          className={seccion === "notificaciones" ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            setSeccion("notificaciones");
          }}
        >
          Notificaciones
        </a>
      </nav>

      {seccion === "notificaciones" && (
        <>
          <Message type="success">{success}</Message>
          <div className="card" id="notificaciones">
            <div className="card-header">
              <div>
                <h2>Configurar notificaciones</h2>
                <span className="small muted">Elegí qué eventos querés recibir y por qué canal.</span>
              </div>
              <button type="button" className="btn btn-primary" onClick={onGuardar} disabled={prefs.canales.length === 0}>
                <Icon name="file" size={16} /> Guardar Preferencias
              </button>
            </div>

            <div className="grid-2">
              {EVENTOS.map((e) => (
                <div key={e.id} className="option-card">
                  <span>{e.label}</span>
                  <button
                    type="button"
                    role="switch"
                    className="toggle"
                    aria-checked={prefs.eventos[e.id]}
                    aria-label={e.label}
                    onClick={() => toggleEvento(e.id)}
                  />
                </div>
              ))}
            </div>

            <div className="field">
              <span className="label">
                Canal de notificación preferido<span className="required">*</span>
              </span>
              <div className="choice-group">
                {CANALES.map((c) => (
                  <label key={c} className="choice">
                    <input type="checkbox" checked={prefs.canales.includes(c)} onChange={() => toggleCanal(c)} />
                    {c}
                  </label>
                ))}
              </div>
              {(error || prefs.canales.length === 0) && (
                <span className="helper-error">Debe seleccionar al menos un canal de notificación.</span>
              )}
            </div>

            {guardadas && (
              <div className="alert">
                <strong className="small">Configuración guardada</strong>
                <div className="row">
                  {guardadas.canales.map((c) => (
                    <span key={c} className="badge badge-success">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="row">
                  {EVENTOS.filter((e) => guardadas.eventos[e.id]).map((e) => (
                    <span key={e.id} className="badge">
                      {e.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div>
        <Link href="/panel" className="btn btn-secondary">
          Atrás
        </Link>
      </div>

      <ConfirmModal
        open={warning}
        message="Tiene todas las notificaciones desactivadas. No recibirá alertas de actividad en sus contratos. ¿Confirma esta configuración?"
        actions={[
          { label: "Confirmar", variant: "primary", onClick: () => guardar() },
          { label: "Activar Todo", onClick: activarTodo },
        ]}
      />
    </>
  );
}
