"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerUsuarioSesion } from "@/lib/services/auth";
import { subscribe } from "@/lib/store";

const SessionContext = createContext(null);

// Sesión autenticada del usuario interno (CU-19 paso 18).
export function SessionProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let active = true;
    const load = () =>
      obtenerUsuarioSesion().then((u) => {
        if (!active) return;
        if (!u) router.replace("/login");
        setUser(u);
      });
    load();
    const unsubscribe = subscribe(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!user) return null;
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
