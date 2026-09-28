"use client";

// Paginación documentada en CU-17 (20 por página) y CU-18 (50 por página).
export default function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`btn btn-sm ${n === page ? "btn-primary" : "btn-secondary"}`}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </button>
      ))}
    </nav>
  );
}
