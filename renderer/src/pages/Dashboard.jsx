// Dashboard.jsx

export default function Dashboard({ user }) {
  const role = user?.role;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="card flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">KRONNOS GYM</h2>
          <p className="text-sm text-gray-400">
            Panel principal · Rol:{" "}
            <span className="text-yellow-400">{role}</span>
          </p>
        </div>

        <span className="text-sm text-green-400 font-semibold">
          Sistema operativo
        </span>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm text-gray-400">Rol activo</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{role}</p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-400">Estado del sistema</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">Operativo</p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-400">Fecha</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-400">Socios activos</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-2">128</p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-400">Ingresos hoy</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">S/ 1,240</p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-400">Entrenadores</h3>
          <p className="text-2xl font-bold text-white mt-2">5</p>
        </div>
      </div>

      {/* ===== WELCOME ===== */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-2">
          Bienvenido al sistema KRONNOS GYM
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Desde este panel podrás acceder a las funcionalidades disponibles
          según tu rol. Utiliza el menú lateral para navegar por el sistema.
        </p>
      </div>
    </div>
  );
}
