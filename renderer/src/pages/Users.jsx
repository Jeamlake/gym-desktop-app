import { useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([
    { id: 1, name: "Admin", email: "admin@gym.com", role: "ADMIN" },
    { id: 2, name: "Recepción", email: "recepcion@gym.com", role: "RECEPCION" },
  ]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "RECEPCION",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    setUsers([...users, { id: Date.now(), ...form }]);
    setForm({ name: "", email: "", role: "RECEPCION" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Usuarios</h2>

      {/* Formulario */}
      <form onSubmit={handleAddUser} className="card space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="input"
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            className="input"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCION">Recepción</option>
            <option value="ENTRENADOR">Entrenador</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Crear usuario
        </button>
      </form>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-kronnos-surface hover:bg-kronnos-surface"
              >
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
