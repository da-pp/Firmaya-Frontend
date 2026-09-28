"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { esAdministrador } from "@/lib/permissions";

// BackOffice — solo Administrador (mapa de navegación; precondición de CU-15 a CU-18).
const SECCIONES = [
  { href: "/backoffice/usuarios", label: "Gestión de Usuarios" },
  { href: "/backoffice/plantillas", label: "Gestión de Plantillas" },
  { href: "/backoffice/actividad", label: "Panel de Actividad" },
  { href: "/backoffice/auditoria", label: "Registro de Auditoría" },
];

export default function BackOfficeLayout({ children }) {
  const user = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const admin = esAdministrador(user);

  useEffect(() => {
    if (!admin) router.replace("/panel");
  }, [admin, router]);

  if (!admin) return null;

  return (
    <>
      <nav className="tabs" aria-label="BackOffice">
        {SECCIONES.map((s) => (
          <Link key={s.href} href={s.href} className={pathname.startsWith(s.href) ? "active" : ""}>
            {s.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
