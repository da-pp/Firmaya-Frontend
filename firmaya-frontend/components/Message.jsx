// Mensajes de éxito, error, advertencia e información.
export default function Message({ type = "info", children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
