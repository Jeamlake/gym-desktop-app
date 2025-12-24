import { useState } from "react";

export default function ChangePassword({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onSuccess(); // desbloquea el sistema
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kronnos-dark">
      <form onSubmit={handleSubmit} className="card space-y-4 max-w-sm">
        <h2 className="text-lg font-bold">Cambio obligatorio de contraseña</h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full">Cambiar contraseña</button>
      </form>
    </div>
  );
}
