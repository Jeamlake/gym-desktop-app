import { useState } from "react";
import logo from "../assets/Kronnos_gym_logo.png";

export default function Sidebar({ role, onNavigate }) {
  const [active, setActive] = useState("dashboard");

  const handleNavigate = (route) => {
    setActive(route);
    onNavigate(route);
  };

  const navButton = (label, route) => (
    <button
      onClick={() => handleNavigate(route)}
      className={`relative w-full text-left px-4 py-2 rounded transition flex items-center
        ${
          active === route
            ? "bg-kronnos-gold text-black font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-black"
            : "text-gray-300 hover:bg-white/10"
        }`}
    >
      {label}
    </button>
  );

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
        {/* GENERAL */}
        <p className="px-4 text-xs uppercase tracking-wider text-gray-500 mb-2">
          General
        </p>
        {navButton("Dashboard", "dashboard")}

        {/* ADMIN */}
        {role === "ADMIN" && (
          <>
            <p className="px-4 mt-6 text-xs uppercase tracking-wider text-gray-500 mb-2">
              Administración
            </p>
            {navButton("Usuarios", "users")}
            {navButton("Reportes", "reports")}
          </>
        )}

        {/* RECEPCIÓN */}
        {role === "RECEPCION" && (
          <>
            <p className="px-4 mt-6 text-xs uppercase tracking-wider text-gray-500 mb-2">
              Recepción
            </p>
            {navButton("Socios", "socios")}
            {navButton("Pagos", "pagos")}
          </>
        )}

        {/* ENTRENADOR */}
        {role === "ENTRENADOR" && (
          <>
            <p className="px-4 mt-6 text-xs uppercase tracking-wider text-gray-500 mb-2">
              Entrenador
            </p>
            {navButton("Mis Socios", "mis-socios")}
          </>
        )}
      </nav>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 py-3 text-xs text-gray-500 border-t border-white/10">
        KRONNOS GYM © 2025
      </footer>
    </aside>
  );
}
