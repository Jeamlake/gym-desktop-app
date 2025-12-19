import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";

export default function MainLayout({ user, onLogout, onNavigate, children }) {
  return (
    <div className="flex min-h-screen bg-kronnos-dark text-kronnos-text">
      <Sidebar role={user.role} onNavigate={onNavigate} />

      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-kronnos-muted">Rol: {user.role}</span>

            <button onClick={onLogout} className="btn-danger">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Contenido */}
        <section className="card">{children}</section>
      </main>
    </div>
  );
}
