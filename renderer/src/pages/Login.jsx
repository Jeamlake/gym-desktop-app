import { useState } from "react";
import logo from "../assets/Kronnos_gym_logo.png";
import { loginRequest } from "../services/authService";

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RECEPCION");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginRequest({
        identifier,
        password,
        role,
      });

      onLogin(user); // 🔑 avisamos a App.jsx que ya inició sesión
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kronnos-dark">
      <div className="w-full max-w-md card">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Kronnos Gym" className="h-21 w-auto" />
          <p className="text-sm text-white-100">Sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario o correo"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input w-full"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input w-full"
          >
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCION">Recepción</option>
            <option value="ENTRENADOR">Entrenador</option>
          </select>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
