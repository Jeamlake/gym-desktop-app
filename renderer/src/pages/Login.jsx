import { useState } from "react";
import logo from "../assets/Kronnos_gym_logo.png";

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RECEPCION");

  const handleSubmit = (e) => {
    e.preventDefault();

    onLogin({
      identifier,
      role,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kronnos-dark">
      <div className="w-full max-w-md card">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Kronnos Gym" className="h-21 w-auto" />
          <p className="text-sm text-white-100 ">Sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario o correo"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input w-full"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
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

          <button type="submit" className="btn-primary w-full">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
