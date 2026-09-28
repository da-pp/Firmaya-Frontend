"use client";

import { useContract } from "@/components/ContractContext";
import PageTitle from "@/components/PageTitle";
import PdfDownload from "@/components/PdfDownload";
import { useSession } from "@/lib/session";

// CU-10 — Descargar contrato firmado en PDF
export default function DescargarPdfPage() {
  const contract = useContract();
  const user = useSession();

  return (
    <>
      <PageTitle icon="download" title="Descargar contrato firmado en PDF" />
      <PdfDownload contract={contract} usuario={user.email} />
    </>
  );
}
