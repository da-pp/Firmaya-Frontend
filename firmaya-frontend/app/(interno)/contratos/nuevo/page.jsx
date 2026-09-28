"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/lib/session";
import { useData } from "@/lib/useData";
import { setFlash } from "@/lib/flash";
import { puedeCrearContratos } from "@/lib/permissions";
import { parseDDMMAAAA, startOfToday } from "@/lib/format";
import { isBlank } from "@/lib/validators";
import { listarPlantillasActivas, TIPOS_CONTRATO } from "@/lib/services/templates";
import { crearContrato } from "@/lib/services/contracts";

const REQUIRED = "Este campo es obligatorio";
const DATE_ERROR = "La fecha debe tener el formato DD/MM/AAAA y no puede ser anterior a la fecha de hoy";

const EMPTY = { nombre: "", partes: "", fechaInicio: "", fechaExpiracion: "", descripcionPropiedad: "" };

function validDate(text) {
  const date = parseDDMMAAAA(text);
  return date && date >= startOfToday() ? date : null;
}

// CU-01 — Crear contrato desde plantilla
export default function NuevoContratoPage() {
  const user = useSession();
  const router = useRouter();
  const { data: plantillas } = useData(() => listarPlantillasActivas(), []);
  const [tipo, setTipo] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const permitido = puedeCrearContratos(user);

  // Camino alternativo: no hay plantillas disponibles (paso 2).
  useEffect(() => {
    if (!permitido) {
      router.replace("/panel");
      return;
    }
    if (plantillas && plantillas.length === 0) {
      setFlash("error", "No hay plantillas disponibles. Contacte al administrador del sistema.");
      router.replace("/panel");
    }
  }, [permitido, plantillas, router]);

  const tiposDisponibles = useMemo(
    () => TIPOS_CONTRATO.filter((t) => plantillas?.some((p) => p.tipo === t)),
    [plantillas]
  );
  const plantilla = plantillas?.find((p) => p.tipo === tipo);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const next = {};
    if (isBlank(form.nombre)) next.nombre = REQUIRED;
    if (isBlank(form.partes)) next.partes = REQUIRED;
    if (isBlank(form.fechaInicio)) next.fechaInicio = REQUIRED;
    else if (!validDate(form.fechaInicio)) next.fechaInicioFormato = DATE_ERROR;
    if (!isBlank(form.fechaExpiracion) && !validDate(form.fechaExpiracion)) next.fechaExpiracionFormato = DATE_ERROR;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const contract = await crearContrato(
      {
        nombre: form.nombre,
        partes: form.partes,
        fechaInicio: validDate(form.fechaInicio).toISOString(),
        fechaExpiracion: form.fechaExpiracion ? validDate(form.fechaExpiracion).toISOString() : null,
        descripcionPropiedad: form.descripcionPropiedad,
      },
      plantilla,
      user
    );
    setFlash("success", "Contrato creado exitosamente");
    router.push(`/contratos/${contract.id}/editar`);
  }

  if (!permitido || !plantillas || plantillas.length === 0) return null;

  return (
    <>
      <PageTitle icon="file" title="Crear contrato desde plantilla" />
      <div className="grid-side-left">
        <div className="card">
          <h2>1. Selección de plantilla</h2>
          <FormField label="Tipo de plantilla" htmlFor="tipo" required>
            <select id="tipo" className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Seleccionar</option>
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          {plantilla && <p className="small muted">Plantilla: {plantilla.nombre}</p>}
        </div>

        {plantilla && (
          <form className="card" onSubmit={onSubmit} noValidate>
            <h2>2. Datos iniciales del contrato</h2>
            <div className="field-row">
              <FormField label="Nombre del Contrato" htmlFor="nombre" required error={errors.nombre}>
                <input
                  id="nombre"
                  className={`input ${errors.nombre ? "is-invalid" : ""}`}
                  maxLength={200}
                  value={form.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                />
              </FormField>
              <FormField label="Partes Involucradas" htmlFor="partes" required error={errors.partes}>
                <input
                  id="partes"
                  className={`input ${errors.partes ? "is-invalid" : ""}`}
                  maxLength={1000}
                  value={form.partes}
                  onChange={(e) => update("partes", e.target.value)}
                />
              </FormField>
            </div>
            <div className="field-row">
              <div className="field">
                {errors.fechaInicioFormato && <span className="helper-error">{errors.fechaInicioFormato}</span>}
                <FormField label="Fecha de Inicio" htmlFor="fechaInicio" required error={errors.fechaInicio}>
                  <input
                    id="fechaInicio"
                    className={`input ${errors.fechaInicio || errors.fechaInicioFormato ? "is-invalid" : ""}`}
                    placeholder="DD/MM/AAAA"
                    value={form.fechaInicio}
                    onChange={(e) => {
                      update("fechaInicio", e.target.value);
                      setErrors((er) => ({ ...er, fechaInicioFormato: undefined }));
                    }}
                  />
                </FormField>
              </div>
              <div className="field">
                {errors.fechaExpiracionFormato && (
                  <span className="helper-error">{errors.fechaExpiracionFormato}</span>
                )}
                <FormField label="Fecha de Expiración" htmlFor="fechaExpiracion">
                  <input
                    id="fechaExpiracion"
                    className={`input ${errors.fechaExpiracionFormato ? "is-invalid" : ""}`}
                    placeholder="DD/MM/AAAA"
                    value={form.fechaExpiracion}
                    onChange={(e) => {
                      update("fechaExpiracion", e.target.value);
                      setErrors((er) => ({ ...er, fechaExpiracionFormato: undefined }));
                    }}
                  />
                </FormField>
              </div>
            </div>
            <FormField label="Descripción de la Propiedad" htmlFor="descripcion">
              <textarea
                id="descripcion"
                className="textarea"
                maxLength={2000}
                value={form.descripcionPropiedad}
                onChange={(e) => update("descripcionPropiedad", e.target.value)}
              />
            </FormField>
            <div className="row-end">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                + Crear Contrato
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
