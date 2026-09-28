"use client";

import { useEffect, useState } from "react";
import { consumeFlash } from "@/lib/flash";
import Message from "@/components/Message";

// Muestra el mensaje dejado por la pantalla anterior antes de redirigir.
export default function FlashMessage() {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const value = consumeFlash();
    if (value) queueMicrotask(() => setFlash(value));
  }, []);

  if (!flash) return null;
  return <Message type={flash.type}>{flash.text}</Message>;
}
