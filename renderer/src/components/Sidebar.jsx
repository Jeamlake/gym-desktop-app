import logo from "../assets/Kronnos_gym_logo.png";

const MENU = [
  {
    section: "General",
    items: [
      {
        label: "Dashboard",
        route: "dashboard",
        roles: ["ADMIN", "RECEPCION", "ENTRENADOR"],
      },
    ],
  },
  {
    section: "Administración",
    items: [
      { label: "Usuarios", route: "users", roles: ["ADMIN"] },
      { label: "Promociones", route: "promotions", roles: ["ADMIN"] },
      { label: "Reportes", route: "reports", roles: ["ADMIN"] },
      // más adelante: Inventario, Productos, Ventas...
    ],
  },
  {
    section: "Recepción",
    items: [
      { label: "Socios", route: "members", roles: ["ADMIN", "RECEPCION"] },
      { label: "Pagos", route: "payments", roles: ["ADMIN", "RECEPCION"] },
      {
        label: "Membresías",
        route: "memberships",
        roles: ["ADMIN", "RECEPCION"],
      },
      {
        label: "Asistencia",
        route: "attendance",
        roles: ["ADMIN", "RECEPCION"],
      },
    ],
  },
  {
    section: "Entrenador",
    items: [
      {
        label: "Mis Socios",
        route: "trainer-members",
        roles: ["ENTRENADOR", "ADMIN"],
      },
    ],
  },
];

export default function Sidebar({ role, currentPage, onNavigate }) {
  const navButton = (label, route) => (
    <button
      key={route}
      onClick={() => onNavigate(route)}
      className={`relative w-full text-left px-4 py-2 rounded transition flex items-center
        ${
          currentPage === route
            ? "bg-kronnos-gold text-black font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-black"
            : "text-gray-300 hover:bg-white/10"
        }`}
    >
      {label}
    </button>
  );

  const canSee = (item) => item.roles.includes(role);

  return (
    <aside className="w-64 min-h-screen bg-kronnos-sidebar text-white flex flex-col">
      {/* ===== BRANDING ===== */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <img src={logo} alt="Kronnos Gym" className="h-9 w-auto" />
        <div className="leading-tight">
          <h1 className="text-yellow-400 font-extrabold tracking-wide">
            KRONNOS
          </h1>
          <span className="text-xs text-gray-400">GYM</span>
        </div>
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU.map((group) => {
          const visibleItems = group.items.filter(canSee);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.section}>
              <p className="px-4 text-xs uppercase tracking-wider text-gray-500 mb-2">
                {group.section}
              </p>
              {visibleItems.map((i) => navButton(i.label, i.route))}
              <div className="h-4" />
            </div>
          );
        })}
      </nav>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 py-3 text-xs text-gray-500 border-t border-white/10">
        KRONNOS GYM © 2025
      </footer>
    </aside>
  );
}
