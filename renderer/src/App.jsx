import { useState } from "react";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-2xl">
        Welcome {user.role}
      </h1>
    </div>
  );
}

export default App;
