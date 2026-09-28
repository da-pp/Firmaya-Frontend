"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/store";

// Carga datos desde los servicios y se actualiza cuando cambian (CU-09 paso 18: panel en tiempo real).
export function useData(loader, deps) {
  const [state, setState] = useState({ data: undefined, loading: true });

  useEffect(() => {
    let active = true;
    const run = () =>
      loader().then((data) => {
        if (active) setState({ data, loading: false });
      });
    run();
    const unsubscribe = subscribe(run);
    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
