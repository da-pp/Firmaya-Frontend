"use client";

// Diálogo modal con los botones definidos por cada caso de uso.
// actions: [{ label, onClick, variant: "primary" | "secondary", disabled }]
export default function ConfirmModal({ open, message, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        {message && <p>{message}</p>}
        {children}
        <div className="row-end">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`btn ${action.variant === "primary" ? "btn-primary" : "btn-secondary"}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
