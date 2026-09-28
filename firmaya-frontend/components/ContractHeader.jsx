import StatusBadge from "@/components/StatusBadge";
import { shortHash } from "@/lib/format";

// Barra de metadatos del contrato (CONTRATO · ESTADO · VERSIÓN · HASH) presente en los prototipos.
// extra: metadatos adicionales exigidos por un CU concreto (ej. CU-04, CU-06).
export default function ContractHeader({ contract, fullHash = false, extra = [] }) {
  const current = contract.versiones[contract.versiones.length - 1];
  return (
    <div className="card contract-header">
      <div>
        <span className="meta-label">Contrato</span>
        <span className="meta-value">{contract.nombre}</span>
      </div>
      <div>
        <span className="meta-label">Estado</span>
        <StatusBadge value={contract.estado} />
      </div>
      <div>
        <span className="meta-label">Versión</span>
        <span className="meta-value">v{current.numero}</span>
      </div>
      <div style={fullHash ? { gridColumn: "span 2" } : undefined}>
        <span className="meta-label">Hash</span>
        <span className={fullHash ? "hash" : "hash-short"} title={current.hash}>
          {fullHash ? current.hash : shortHash(current.hash)}
        </span>
      </div>
      {extra.map((item) => (
        <div key={item.label}>
          <span className="meta-label">{item.label}</span>
          <span className="meta-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
