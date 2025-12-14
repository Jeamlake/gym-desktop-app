import { useState } from "react";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import Users from "./pages/Users";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  let content = <p>Bienvenido al sistema del gimnasio.</p>;

  if (user.role === "ADMIN" && view === "users") {
    content = <Users />;
  }

  return (
    <MainLayout
      user={user}
      onLogout={() => setUser(null)}
      onNavigate={setView}
    >
      {content}
    </MainLayout>
  );
}

export default App;
