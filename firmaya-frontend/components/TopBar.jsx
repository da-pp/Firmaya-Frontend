"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import { esAdministrador, puedeConfigurarNotificaciones } from "@/lib/permissions";
import { initials } from "@/lib/format";

// Barra superior del área interna según el mapa de navegación:
// Panel principal · BackOffice (solo Administrador) · Mi perfil (avatar/nombre, CU-20 paso 1).
export default function TopBar() {
  const user = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => (pathname.startsWith(href) ? "active" : "");

  return (
    <header className="topbar">
      <div className="row" style={{ gap: 16 }}>
        <span className="topbar-brand">FirmaYA</span>
        <nav className="topbar-nav">
          <Link href="/panel" className={isActive("/panel") || isActive("/contratos")}>
            Panel principal
          </Link>
          {esAdministrador(user) && (
            <Link href="/backoffice" className={isActive("/backoffice")}>
              BackOffice
            </Link>
          )}
        </nav>
      </div>
      <div className="user-menu">
        <button
          type="button"
          className="user-menu-button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          disabled={!puedeConfigurarNotificaciones(user)}
          style={!puedeConfigurarNotificaciones(user) ? { cursor: "default", opacity: 1 } : undefined}
        >
          <span className="avatar">{initials(user.nombre, user.apellido)}</span>
          <span>
            {user.nombre} {user.apellido}
          </span>
        </button>
        {open && puedeConfigurarNotificaciones(user) && (
          <div className="user-menu-list" onClick={() => setOpen(false)}>
            <Link href="/perfil">Mi Perfil</Link>
          </div>
        )}
      </div>
    </header>
  );
}
