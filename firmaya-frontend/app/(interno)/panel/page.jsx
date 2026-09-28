"use client";

import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";
import Icon from "@/components/Icon";
import PageTitle from "@/components/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import { useSession } from "@/lib/session";
import { useData } from "@/lib/useData";
import { puedeCrearContratos } from "@/lib/permissions";
import { listarContratosDeUsuario } from "@/lib/services/contracts";

// Panel principal (mapa de navegación): botón "Nuevo Contrato" (CU-01 paso 1)
// y lista de contratos del usuario con la opción "Editar" (CU-02 paso 1).
export default function PanelPage() {
  const user = useSession();
  const { data: contratos } = useData(() => listarContratosDeUsuario(user.id), [user.id]);
  const gestiona = puedeCrearContratos(user);

  return (
    <>
      <PageTitle icon="grid" title="Panel principal" />
      <FlashMessage />
      {gestiona && (
        <div className="card">
          <div className="card-header">
            <h2>Contratos</h2>
            <Link href="/contratos/nuevo" className="btn btn-primary">
              + Nuevo Contrato
            </Link>
          </div>
          {contratos && contratos.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/contratos/${c.id}`} className="btn-link">
                          {c.nombre}
                        </Link>
                      </td>
                      <td>
                        <StatusBadge value={c.estado} />
                      </td>
                      <td>
                        <Link href={`/contratos/${c.id}/editar`} className="btn btn-secondary btn-sm">
                          <Icon name="edit" size={14} /> Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
