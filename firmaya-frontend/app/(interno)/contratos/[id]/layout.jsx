"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ContractProvider } from "@/components/ContractContext";
import { useSession } from "@/lib/session";
import { useData } from "@/lib/useData";
import { puedeGestionarContrato } from "@/lib/permissions";
import { obtenerContrato } from "@/lib/services/contracts";

// "Contrato — Editor y pestañas" del mapa de navegación.
// Cada pestaña corresponde a una opción nombrada en los casos de uso.
export default function ContratoLayout({ children }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession();
  const { data: contract, loading } = useData(() => obtenerContrato(id), [id]);

  const permitido = puedeGestionarContrato(user, contract);

  useEffect(() => {
    if (!loading && !permitido) router.replace("/panel");
  }, [loading, permitido, router]);

  if (loading || !permitido) return null;

  const base = `/contratos/${id}`;
  const tabs = [
    { href: base, label: "Contrato", exact: true },
    { href: `${base}/editar`, label: "Editar" },
    contract.estado !== "Archivado" && { href: `${base}/invitar`, label: "Invitar a las partes" }, // CU-03 precondición
    { href: `${base}/estado`, label: "Cambiar estado" },
    contract.estado === "Listo para firmar" && { href: `${base}/solicitar-firmas`, label: "Solicitar firmas" }, // CU-07 precondición
    { href: `${base}/firmas`, label: "Estado de Firmas" },
    { href: `${base}/versiones`, label: "Historial de versiones" },
    { href: `${base}/integridad`, label: "Verificar integridad" },
    { href: `${base}/pdf`, label: "Descargar PDF" },
  ].filter(Boolean);

  return (
    <ContractProvider value={contract}>
      <nav className="tabs" aria-label="Opciones del contrato">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </ContractProvider>
  );
}
