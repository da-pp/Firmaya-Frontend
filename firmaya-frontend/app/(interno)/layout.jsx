"use client";

import { SessionProvider } from "@/lib/session";
import TopBar from "@/components/TopBar";

// Área interna: requiere sesión activa (CU-19).
export default function InternoLayout({ children }) {
  return (
    <SessionProvider>
      <TopBar />
      <main className="page">{children}</main>
    </SessionProvider>
  );
}
