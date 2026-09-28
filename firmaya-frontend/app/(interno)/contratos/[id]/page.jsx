"use client";

import ContractHeader from "@/components/ContractHeader";
import ContractWithComments from "@/components/ContractWithComments";
import { useContract } from "@/components/ContractContext";
import FlashMessage from "@/components/FlashMessage";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/lib/session";

// Vista de solo lectura del contrato (CU-02 camino alternativo "Ver Contrato")
// con panel lateral de comentarios (CU-06).
export default function ContratoPage() {
  const contract = useContract();
  const user = useSession();

  return (
    <>
      <PageTitle icon="file" title={contract.nombre} />
      <FlashMessage />
      <ContractHeader contract={contract} extra={[{ label: "Comentarios", value: contract.comentarios.length }]} />
      <ContractWithComments
        contract={contract}
        rol={user.rol}
        autor={`${user.nombre} ${user.apellido}`}
        autorEmail={user.email}
      />
    </>
  );
}
