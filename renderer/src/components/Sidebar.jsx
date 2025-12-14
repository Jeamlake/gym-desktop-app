export default function Sidebar({ role, onNavigate }) {

  const commonLinks = [
    { name: "Dashboard" },
  ];

  const adminLinks = [
    { name: "Usuarios" },
    { name: "Reportes" },
  ];

  const recepcionLinks = [
    { name: "Socios" },
    { name: "Pagos" },
  ];

  const entrenadorLinks = [
    { name: "Mis Socios" },
  ];

  let roleLinks = [];

  if (role === "ADMIN") roleLinks = adminLinks;
  if (role === "RECEPCION") roleLinks = recepcionLinks;
  if (role === "ENTRENADOR") roleLinks = entrenadorLinks;

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Gym App</h2>

      <nav className="space-y-2">
        <button
          onClick={() => onNavigate("dashboard")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </button>

        {role === "ADMIN" && (
          <button
            onClick={() => onNavigate("users")}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
          >
            Usuarios
          </button>
        )}
      </nav>
    </aside>
  );
}