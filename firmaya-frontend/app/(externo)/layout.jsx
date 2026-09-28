// Acceso externo mediante enlace con token (mapa de navegación): sin cuenta ni barra interna.
export default function ExternoLayout({ children }) {
  return (
    <>
      <header className="topbar">
        <span className="topbar-brand">FirmaYA</span>
      </header>
      <main className="page">{children}</main>
    </>
  );
}
