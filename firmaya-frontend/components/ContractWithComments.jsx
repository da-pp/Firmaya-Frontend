"use client";

import { useState } from "react";
import CommentsPanel from "@/components/CommentsPanel";

// Contenido del contrato con selección de fragmentos + panel lateral de comentarios (CU-06 pasos 2–4).
export default function ContractWithComments({ contract, rol, autor, autorEmail, contentTitle = "Contrato" }) {
  const [selected, setSelected] = useState("");
  const content = contract.versiones[contract.versiones.length - 1].contenido;

  function captureSelection() {
    const text = window.getSelection()?.toString().trim() || "";
    if (text && content.includes(text)) setSelected(text);
  }

  let body = content;
  if (selected) {
    const index = content.indexOf(selected);
    body = (
      <>
        {content.slice(0, index)}
        <mark className="selected-fragment">{selected}</mark>
        {content.slice(index + selected.length)}
      </>
    );
  }

  return (
    <div className="grid-side">
      <div className="card">
        <h2>{contentTitle}</h2>
        <div className="contract-content" onMouseUp={captureSelection}>
          {body}
        </div>
      </div>
      <CommentsPanel
        contract={contract}
        rol={rol}
        autor={autor}
        autorEmail={autorEmail}
        selectedText={selected}
        onPublished={() => setSelected("")}
      />
    </div>
  );
}
