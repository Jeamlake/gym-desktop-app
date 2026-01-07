import React, { useEffect, useMemo, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ChangePassword from "./pages/ChangePassword";
import MainLayout from "./layouts/MainLayout";
import Promotions from "./pages/Promotions";
import Memberships from "./pages/Memberships";
import Payments from "./pages/Payments";
import Attendance from "./pages/Attendance";
import Members from "./pages/Members";

const PagePlaceholder = ({ title }) => (
  <div className="text-gray-300">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-sm text-gray-400">En construcción.</p>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("dashboard");
  };

  // 👇 SIEMPRE se ejecuta
  const ROUTES = useMemo(
    () => ({
      dashboard: {
        title: "Dashboard",
        roles: ["ADMIN", "RECEPCION", "ENTRENADOR"],
        element: <Dashboard />,
      },
      users: {
        title: "Usuarios",
        roles: ["ADMIN"],
        element: <Users />,
      },
      promotions: {
        title: "Promociones",
        roles: ["ADMIN"],
        element: <Promotions />,
      },
      members: {
        title: "Socios",
        roles: ["ADMIN", "RECEPCION"],
        element: <Members />,
      },
      memberships: {
        title: "Membresías",
        roles: ["ADMIN", "RECEPCION"],
        element: <Memberships />,
      },
      payments: {
        title: "Pagos",
        roles: ["ADMIN", "RECEPCION"],
        element: <Payments />,
      },
      attendance: {
        title: "Asistencia",
        roles: ["ADMIN", "RECEPCION"],
        element: <Attendance />,
      },
      "trainer-members": {
        title: "Mis Socios",
        roles: ["ENTRENADOR", "ADMIN"],
        element: <PagePlaceholder title="Mis Socios" />,
      },
    }),
    []
  );

  // 👇 AHORA SÍ returns condicionales
  if (!user) return <Login onLogin={setUser} />;

  if (user.mustChangePassword) {
    return (
      <ChangePassword
        onSuccess={() => {
          const updatedUser = { ...user, mustChangePassword: false };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }}
      />
    );
  }

  const route = ROUTES[page] || ROUTES.dashboard;
  const allowed = route.roles.includes(user.role);

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      onNavigate={setPage}
      currentPage={page}
      title={route.title}
    >
      {allowed ? (
        React.cloneElement(route.element, { user })
      ) : (
        <div className="text-red-500 font-semibold">Acceso denegado</div>
      )}
    </MainLayout>
  );
}

export default App;
