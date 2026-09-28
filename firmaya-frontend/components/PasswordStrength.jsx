import { passwordChecks } from "@/lib/validators";

// CU-21 paso 14 y camino alternativo: indicador visual de fortaleza en tiempo real
// (rojo/amarillo mientras falten requisitos) y requisitos no cumplidos.
export default function PasswordStrength({ value }) {
  const checks = passwordChecks(value);
  const ok = checks.filter((c) => c.ok).length;
  const color = ok === checks.length ? "var(--success)" : ok >= 2 ? "#ca8a04" : "var(--danger)";

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="progress">
        <span style={{ width: `${(ok / checks.length) * 100}%`, background: color }} />
      </div>
      <ul className="list-plain small">
        {checks.map((c) => (
          <li key={c.id} style={{ color: c.ok ? "var(--success)" : "var(--danger)" }}>
            {c.ok ? "✓" : "✗"} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
