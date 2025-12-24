import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import MainLayout from "./layouts/MainLayout";
import ChangePassword from "./pages/ChangePassword";


function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  // 🔁 Restaurar sesión al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🚪 Logout real
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("dashboard");
  };

  // 🔐 Si no hay usuario → Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 🔐 Cambio de contraseña obligatorio
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

  // 🔒 Protección por rol
  let content = null;

  if (page === "dashboard") {
    content = <Dashboard role={user.role} />;
  }

  if (page === "users") {
    if (user.role !== "ADMIN") {
      content = <div className="card text-red-500">Acceso denegado</div>;
    } else {
      content = <Users />;
    }
  }

  return (
    <MainLayout user={user} onLogout={handleLogout} onNavigate={setPage}>
      {content}
    </MainLayout>
  );
}

export default App;
