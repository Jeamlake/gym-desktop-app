import Sidebar from "../components/Sidebar";

export default function MainLayout({ user, onLogout, onNavigate, children }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar role={user.role} onNavigate={onNavigate} />

      <main className="flex-1 p-6">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Rol: {user.role}
            </span>

            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Contenido */}
        <section className="bg-gray-800 rounded-lg p-6">
          {children}
        </section>
      </main>
    </div>
  );
}
