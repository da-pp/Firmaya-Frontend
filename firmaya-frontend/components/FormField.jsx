// Campo de formulario con etiqueta, marca de obligatorio y helper de error.
// errorPosition: "below" (debajo del campo) o "above" (sobre el campo), según indica cada CU.
export default function FormField({ label, htmlFor, required, error, helper, errorPosition = "below", children }) {
  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {error && errorPosition === "above" && <span className="helper-error">{error}</span>}
      {children}
      {error && errorPosition === "below" && <span className="helper-error">{error}</span>}
      {helper && !error && <span className="helper">{helper}</span>}
    </div>
  );
}
