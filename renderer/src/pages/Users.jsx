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

    setUsers([
      ...users,
      {
        id: Date.now(),
        ...form,
      },
    ]);

    setForm({ name: "", email: "", role: "RECEPCION" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Usuarios</h2>

      {/* Formulario */}
      <form
        onSubmit={handleAddUser}
        className="bg-gray-700 p-4 rounded-lg space-y-4"
      >
        <div className="grid grid-cols-3 gap-4">
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-gray-800 text-white"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-gray-800 text-white"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-gray-800 text-white"
          >
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCION">Recepción</option>
            <option value="ENTRENADOR">Entrenador</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Crear usuario
        </button>
      </form>

      {/* Tabla */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-700">
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
