"use client";

import Icon from "@/components/Icon";
import { copyToClipboard } from "@/lib/download";

// Botón de copia rápida del hash (CU-11 pasos 8 y 11).
export default function HashCopyButton({ hash, onCopied }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      title="Copiar hash"
      aria-label="Copiar hash"
      onClick={async (event) => {
        event.stopPropagation();
        if (await copyToClipboard(hash)) onCopied?.();
      }}
    >
      <Icon name="copy" size={14} />
    </button>
  );
}
