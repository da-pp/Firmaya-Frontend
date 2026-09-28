"use client";

import { useState } from "react";
import Link from "next/link";
import ContractHeader from "@/components/ContractHeader";
import { useContract } from "@/components/ContractContext";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/lib/session";
import { isHex64 } from "@/lib/validators";
import { registrarVerificacion } from "@/lib/services/contracts";

const FORMAT_ERROR = "El hash debe tener exactamente 64 caracteres hexadecimales (0-9, a-f).";

// CU-13 — Verificar integridad por hash
export default function IntegridadPage() {
  const contract = useContract();
  const user = useSession();
  const [valor, setValor] = useState("");
  const [result, setResult] = useState(null); // { coincide, ingresado }

  const actual = contract.versiones[contract.versiones.length - 1].hash;
  const formatoValido = isHex64(valor);
  const mostrarError = valor.length > 0 && !formatoValido;

  async function verificar() {
    // Pasos 9–12 y 16
    const coincide = valor === actual;
    setResult({ coincide, ingresado: valor });
    await registrarVerificacion(contract.id, coincide, user.email);
  }

  return (
    <>
      <PageTitle icon="shield" title="Verificar integridad por hash" />
      <ContractHeader contract={contract} />
      <div className="grid-2">
        <div className="card">
          <h2>Verificación de integridad</h2>
          <div>
            <span className="meta-label">Hash de la versión activa</span>
            <span className="hash">{actual}</span>
          </div>
          <p className="small muted">
            Ingrese el hash que aparece en su copia del contrato o en la notificación que recibió.
          </p>
          <div className="field">
            <label className="label" htmlFor="hash">
              Hash a verificar<span className="required">*</span>
            </label>
            {mostrarError && <span className="helper-error">{FORMAT_ERROR}</span>}
            <textarea
              id="hash"
              className={`textarea hash ${mostrarError ? "is-invalid" : ""}`}
              style={{ minHeight: 70 }}
              placeholder="64 caracteres hexadecimales"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value.trim());
                setResult(null);
              }}
            />
          </div>
          <div>
            <button type="button" className="btn btn-primary" onClick={verificar} disabled={!formatoValido}>
              <Icon name="shield" size={16} /> Verificar
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Resultado</h2>
          {result && (
            <>
              <div className={`alert ${result.coincide ? "alert-success" : "alert-error"}`}>
                {result.coincide
                  ? "Integridad verificada. El documento no ha sido alterado."
                  : "Los hashes no coinciden. El documento puede haber sido modificado o está examinando una versión diferente."}
              </div>
              <div>
                <span className="meta-label">Hash ingresado</span>
                <span className="hash">{result.ingresado}</span>
              </div>
              <div>
                <span className="meta-label">Hash almacenado de la versión activa</span>
                <span className="hash">{actual}</span>
              </div>
              <Link href={`/contratos/${contract.id}/versiones`} className="btn btn-secondary">
                <Icon name="history" size={16} /> Ver historial de versiones
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
