"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import FormField from "@/components/FormField";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { useSession } from "@/lib/session";
import { useData } from "@/lib/useData";
import { isBlank } from "@/lib/validators";
import {
  ESTADOS_PLANTILLA,
  TIPOS_CONTRATO,
  detectarCampos,
  guardarPlantilla,
  listarPlantillas,
  tieneContratosActivos,
} from "@/lib/services/templates";

const EMPTY = { nombre: "", tipo: "", descripcion: "", cuerpo: "", estado: "" };
const REQUIRED = "Este campo es obligatorio";

// CU-16 — Gestionar plantillas de contrato
export default function PlantillasPage() {
  const admin = useSession();
  const { data: plantillas } = useData(() => listarPlantillas(), []);
  const [editor, setEditor] = useState(null); // { id?, nuevaVersion }
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState(null); // "activos" | "sinCampos"
  const [pendingEdit, setPendingEdit] = useState(null);

  const campos = detectarCampos(form.cuerpo);

  function openNew() {
    setEditor({ nuevaVersion: false });
    setForm(EMPTY);
    setErrors({});
    setMessage("");
  }

  function startEdit(template, nuevaVersion) {
    setEditor({ id: template.id, nuevaVersion });
    setForm({
      nombre: template.nombre,
      tipo: template.tipo,
      descripcion: template.descripcion,
      cuerpo: template.cuerpo,
      estado: template.estado,
    });
    setErrors({});
    setMessage("");
  }

  // Flujo alternativo "Editar plantilla con contratos activos".
  async function onEdit(template) {
    if (await tieneContratosActivos(template.id)) {
      setPendingEdit(template);
      setDialog("activos");
      return;
    }
    startEdit(template, false);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function save() {
    setDialog(null);
    await guardarPlantilla({ ...form, id: editor.id }, { nuevaVersion: editor.nuevaVersion }, admin);
    setMessage("Plantilla guardada exitosamente.");
    setEditor(null);
  }

  function onSubmit(event) {
    event.preventDefault();
    // Paso 17
    const next = {};
    if (isBlank(form.nombre)) next.nombre = REQUIRED;
    if (!form.tipo) next.tipo = REQUIRED;
    if (isBlank(form.cuerpo)) next.cuerpo = REQUIRED;
    if (!form.estado) next.estado = REQUIRED;
    setErrors(next);
    if (Object.keys(next).length) return;
    // Paso 18
    if (campos.length === 0) {
      setDialog("sinCampos");
      return;
    }
    save();
  }

  return (
    <>
      <PageTitle icon="layers" title="Gestionar plantillas de contratos" />
      <Message type="success">{message}</Message>

      <div className="grid-side-left">
        <div className="card">
          <div className="card-header">
            <h2>Plantillas</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
              + Nueva Plantilla
            </button>
          </div>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Versión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plantillas?.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td className="muted">{p.tipo}</td>
                    <td>
                      <StatusBadge value={p.estado} />
                    </td>
                    <td className="muted">{p.version}</td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(p)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editor && (
          <form className="card" onSubmit={onSubmit} noValidate>
            <h2>Editor de plantilla</h2>
            <div className="field-row">
              <FormField label="Nombre de la plantilla" htmlFor="nombre" required error={errors.nombre}>
                <input
                  id="nombre"
                  className={`input ${errors.nombre ? "is-invalid" : ""}`}
                  maxLength={200}
                  value={form.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                />
              </FormField>
              <FormField label="Tipo de contrato" htmlFor="tipo" required error={errors.tipo}>
                <select
                  id="tipo"
                  className={`select ${errors.tipo ? "is-invalid" : ""}`}
                  value={form.tipo}
                  onChange={(e) => update("tipo", e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {TIPOS_CONTRATO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Descripción de uso" htmlFor="descripcion">
              <textarea
                id="descripcion"
                className="textarea"
                style={{ minHeight: 64 }}
                maxLength={500}
                value={form.descripcion}
                onChange={(e) => update("descripcion", e.target.value)}
              />
            </FormField>
            <FormField label="Plantilla" htmlFor="cuerpo" required error={errors.cuerpo}>
              <textarea
                id="cuerpo"
                className={`textarea ${errors.cuerpo ? "is-invalid" : ""}`}
                style={{ minHeight: 200 }}
                placeholder="Entre {{locador}} y {{locatario}}..."
                value={form.cuerpo}
                onChange={(e) => update("cuerpo", e.target.value)}
              />
            </FormField>
            <div className="alert">
              <strong className="small">Campos dinámicos detectados</strong>
              <div className="row">
                {campos.map((c) => (
                  <span key={c} className="badge">{`{{${c}}}`}</span>
                ))}
              </div>
            </div>
            <FormField label="Estado" required error={errors.estado}>
              <div className="choice-group">
                {ESTADOS_PLANTILLA.map((s) => (
                  <label key={s} className="choice">
                    <input
                      type="radio"
                      name="estadoPlantilla"
                      value={s}
                      checked={form.estado === s}
                      onChange={() => update("estado", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </FormField>
            <div>
              <button type="submit" className="btn btn-primary">
                <Icon name="file" size={16} /> Guardar Plantilla
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmModal
        open={dialog === "sinCampos"}
        message="La plantilla no tiene campos dinámicos definidos. ¿Desea guardarla de todos modos?"
        actions={[
          { label: "Guardar sin campos", variant: "primary", onClick: save },
          { label: "Volver a editar", onClick: () => setDialog(null) },
        ]}
      />
      <ConfirmModal
        open={dialog === "activos"}
        message="Esta plantilla tiene contratos activos. Los cambios no afectarán a los contratos ya creados. ¿Desea continuar?"
        actions={[
          {
            label: "Continuar",
            variant: "primary",
            onClick: () => {
              setDialog(null);
              startEdit(pendingEdit, true);
            },
          },
          { label: "Cancelar", onClick: () => setDialog(null) },
        ]}
      />
    </>
  );
}
