"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import ContractHeader from "@/components/ContractHeader";
import ContractWithComments from "@/components/ContractWithComments";
import Icon from "@/components/Icon";
import Message from "@/components/Message";
import PdfDownload from "@/components/PdfDownload";
import { formatDateTime } from "@/lib/format";
import { useData } from "@/lib/useData";
import { accederPorToken, obtenerPorTokenAcceso } from "@/lib/services/contracts";

const INACTIVIDAD_MS = 60 * 60 * 1000; // CU-04 paso 19
const AVISO_MS = 5 * 60 * 1000; // CU-04 camino alternativo: "expirar en 5 minutos"

const INVALID = "El enlace de acceso no es válido o ha expirado. Solicite un nuevo enlace al dueño del contrato.";

// CU-04 — Ver contrato como parte invitada
export default function AccesoPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | OK | INVALIDO | NO_DISPONIBLE | EXPIRADO
  const [warning, setWarning] = useState(false);
  const { data } = useData(() => obtenerPorTokenAcceso(token), [token]);
  const idleTimer = useRef(null);
  const expireTimer = useRef(null);

  // Pasos 2–4: validación del token, del contrato y registro del acceso.
  useEffect(() => {
    let active = true;
    accederPorToken(token).then((result) => {
      if (active) setStatus(result.estado);
    });
    return () => {
      active = false;
    };
  }, [token]);

  // Pasos 18–20: sesión mantenida por el token y aviso por inactividad.
  useEffect(() => {
    if (status !== "OK") return undefined;

    function startIdle() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setWarning(true);
        expireTimer.current = setTimeout(() => {
          setWarning(false);
          setStatus("EXPIRADO");
        }, AVISO_MS);
      }, INACTIVIDAD_MS);
    }

    function onActivity() {
      if (!expireTimer.current) startIdle();
    }

    startIdle();
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(expireTimer.current);
      expireTimer.current = null;
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [status]);

  function continuar() {
    clearTimeout(expireTimer.current);
    expireTimer.current = null;
    setWarning(false);
    window.dispatchEvent(new Event("click"));
  }

  function salir() {
    clearTimeout(expireTimer.current);
    expireTimer.current = null;
    setWarning(false);
    setStatus("EXPIRADO");
  }

  if (status === "loading" || (status === "OK" && !data)) return null;
  if (status === "INVALIDO" || status === "EXPIRADO") return <Message type="error">{INVALID}</Message>;
  if (status === "NO_DISPONIBLE") return <Message type="error">Este contrato ya no está disponible.</Message>;

  const { contrato, parte } = data;
  const puedeFirmar = parte.rol === "Firmante" && contrato.estado === "Listo para firmar";

  return (
    <>
      <div className="sticky-top">
        <ContractHeader
          contract={contrato}
          fullHash
          extra={[
            { label: "Fecha de última modificación", value: formatDateTime(contrato.fechaModificacion) },
            { label: "Rol asignado", value: parte.rol },
            { label: "Comentarios", value: contrato.comentarios.length },
          ]}
        />
      </div>

      <div className="row">
        {puedeFirmar && (
          <Link href={`/firmar/${token}`} className="btn btn-primary">
            <Icon name="key" size={16} /> Firmar contrato
          </Link>
        )}
        <PdfDownload contract={contrato} usuario={parte.email} compact />
      </div>

      <ContractWithComments contract={contrato} rol={parte.rol} autor={parte.nombre} autorEmail={parte.email} />

      <ConfirmModal
        open={warning}
        message="Su sesión está por expirar en 5 minutos. ¿Desea continuar?"
        actions={[
          { label: "Continuar", variant: "primary", onClick: continuar },
          { label: "Salir", onClick: salir },
        ]}
      />
    </>
  );
}
