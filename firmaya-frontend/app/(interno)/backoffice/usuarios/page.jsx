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
import { isBlank, isLettersAndSpaces, isValidEmail } from "@/lib/validators";
import {
  ESTADOS_USUARIO,
  ROLES_USUARIO,
  actualizarUsuario,
  crearUsuario,
  emailRegistrado,
  listarUsuarios,
} from "@/lib/services/users";

const EMPTY = { nombre: "", apellido: "", email: "", rol: "", estado: "" };
const EMAIL_FORMAT = "Ingrese un correo electrónico válido (ej. nombre@dominio.com)";
const EMAIL_TAKEN = "Este Email ya está registrado en el sistema.";

// CU-15 — Gestionar usuarios y roles
export default function UsuariosPage() {
  const admin = useSession();
  const { data: usuarios } = useData(() => listarUsuarios(), []);
  const [mode, setMode] = useState(null); // null | "new" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  function openNew() {
    setMode("new");
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setMessage(null);
  }

  function openEdit(user) {
    setMode("edit");
    setEditing(user);
    setForm({ nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol, estado: user.estado });
    setErrors({});
    setMessage(null);
  }

  // Paso 13: validación en tiempo real del Email (formato y unicidad).
  async function onEmailChange(value) {
    setForm((f) => ({ ...f, email: value }));
    if (!value) {
      setErrors((e) => ({ ...e, email: undefined }));
      return;
    }
    if (!isValidEmail(value)) {
      setErrors((e) => ({ ...e, email: EMAIL_FORMAT }));
      return;
    }
    const taken = await emailRegistrado(value, editing?.id);
    setErrors((e) => ({ ...e, email: taken ? EMAIL_TAKEN : undefined }));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Paso 17
  async function validate() {
    const next = {};
    for (const [field, label] of [
      ["nombre", "Nombre"],
      ["apellido", "Apellido"],
    ]) {
      if (isBlank(form[field])) next[field] = `El campo ${label} es obligatorio`;
      else if (!isLettersAndSpaces(form[field])) next[field] = `El campo ${label} solo admite letras y espacios`;
    }
    if (isBlank(form.email)) next.email = "El campo Email es obligatorio";
    else if (!isValidEmail(form.email)) next.email = EMAIL_FORMAT;
    else if (await emailRegistrado(form.email, editing?.id)) next.email = EMAIL_TAKEN;
    if (!form.rol) next.rol = "El campo Rol es obligatorio";
    if (!form.estado) next.estado = "El campo Estado es obligatorio";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setMessage(null);
    if (!(await validate())) return;
    if (mode === "new") {
      await crearUsuario(form, admin);
      setMessage("Usuario creado exitosamente. Se envió un correo de activación.");
      setMode(null);
      return;
    }
    if (editing.estado === "Activo" && form.estado === "Inactivo") {
      setConfirmDeactivate(true);
      return;
    }
    await actualizarUsuario(editing.id, form, admin);
    setMode(null);
  }

  async function confirmarDesactivacion() {
    setConfirmDeactivate(false);
    await actualizarUsuario(editing.id, form, admin);
    setMessage("Usuario desactivado exitosamente.");
    setMode(null);
  }

  return (
    <>
      <PageTitle icon="users" title="Gestionar usuarios y roles" />
      <Message type="success">{message}</Message>

      <div className="grid-side">
        <div className="card">
          <div className="card-header">
            <h2>Usuarios</h2>
            <button type="button" className="btn btn-primary" onClick={openNew}>
              + Nuevo Usuario
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios?.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <span className="badge">{u.rol}</span>
                    </td>
                    <td>
                      <StatusBadge value={u.estado} />
                    </td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {mode && (
          <form className="card" onSubmit={onSubmit} noValidate>
            <h2>Alta / edición</h2>
            <FormField label="Nombre" htmlFor="nombre" required error={errors.nombre}>
              <input
                id="nombre"
                className={`input ${errors.nombre ? "is-invalid" : ""}`}
                maxLength={100}
                value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
              />
            </FormField>
            <FormField label="Apellido" htmlFor="apellido" required error={errors.apellido}>
              <input
                id="apellido"
                className={`input ${errors.apellido ? "is-invalid" : ""}`}
                maxLength={100}
                value={form.apellido}
                onChange={(e) => update("apellido", e.target.value)}
              />
            </FormField>
            <FormField label="Email" htmlFor="email" required error={errors.email}>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? "is-invalid" : ""}`}
                maxLength={254}
                placeholder="usuario@dominio.com"
                value={form.email}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </FormField>
            <FormField label="Rol" htmlFor="rol" required error={errors.rol}>
              <select
                id="rol"
                className={`select ${errors.rol ? "is-invalid" : ""}`}
                value={form.rol}
                onChange={(e) => update("rol", e.target.value)}
              >
                <option value="">Seleccionar</option>
                {ROLES_USUARIO.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Estado" required error={errors.estado}>
              <div className="choice-group">
                {ESTADOS_USUARIO.map((s) => (
                  <label key={s} className="choice">
                    <input
                      type="radio"
                      name="estado"
                      value={s}
                      checked={form.estado === s}
                      onChange={() => update("estado", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </FormField>
            <button type="submit" className="btn btn-primary btn-block" disabled={errors.email === EMAIL_TAKEN}>
              <Icon name="file" size={16} /> {mode === "new" ? "Guardar Usuario" : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>

      <ConfirmModal
        open={confirmDeactivate}
        message={
          editing
            ? `¿Confirma la desactivación de ${editing.nombre} ${editing.apellido}? El usuario no podrá iniciar sesión.`
            : ""
        }
        actions={[
          { label: "Confirmar", variant: "primary", onClick: confirmarDesactivacion },
          { label: "Cancelar", onClick: () => setConfirmDeactivate(false) },
        ]}
      />
    </>
  );
}
