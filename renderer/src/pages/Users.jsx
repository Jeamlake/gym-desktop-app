import { useState, useEffect } from "react";
import { Pencil, Shield } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [roleEdit, setRoleEdit] = useState({});
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECEPCION",
  });

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isSelf = (user) => {
    if (!currentUser) return false;
    return user.id === currentUser.id;
  };

  const startEdit = (user) => {
    if (isSelf(user)) return;

    setEditingId(user.id);
    setEditForm({
      name: user.username,
      email: user.email,
    });

    setRoleEdit({
      ...roleEdit,
      [user.id]: user.role,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "" });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:3001/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Error al cargar usuarios");
      }

      const data = await res.json();
      setUsers(data);

      const roles = {};
      data.forEach((u) => {
        roles[u.id] = u.role;
      });
      setRoleEdit(roles);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 1. actualizar nombre + email
      const resUser = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!resUser.ok) {
        const msg = await resUser.json();
        throw new Error(msg.message || "Error al actualizar usuario");
      }

      // 2. actualizar rol
      const resRole = await fetch(
        `http://localhost:3001/api/users/${id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: roleEdit[id] }),
        }
      );

      if (!resRole.ok) {
        const msg = await resRole.json();
        throw new Error(msg.message || "Error al cambiar rol");
      }

      cancelEdit();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const saveRole = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:3001/api/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: roleEdit[id] }),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Error al cambiar rol");
      }

      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchUsers();
    }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Error al crear usuario");
      }

      // limpiar formulario
      setForm({
        name: "",
        email: "",
        password: "",
        role: "RECEPCION",
      });

      // recargar lista real
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (id) => {
    if (!confirm("¿Seguro que deseas resetear la contraseña?")) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/users/${id}/reset-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(
        `Contraseña temporal (mostrar una sola vez):\n\n${data.tempPassword}`
      );
    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Usuarios</h2>

      {/* Formulario */}
      <form onSubmit={handleAddUser} className="card space-y-4">
        <div className="grid grid-cols-4 gap-4">
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

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="input"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="RECEPCION">Recepción</option>
            <option value="ENTRENADOR">Entrenador</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Crear usuario
        </button>
      </form>

      {/* Estado de carga */}
      {loading && (
        <div className="text-gray-400 text-sm">Cargando usuarios...</div>
      )}

      {/* Error */}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-kronnos-surface hover:bg-kronnos-surface"
              >
                <td className="p-3">
                  {editingId === u.id ? (
                    <input
                      className="input"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    u.username
                  )}
                </td>
                <td className="p-3">
                  {editingId === u.id ? (
                    <input
                      className="input"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="p-3">{u.role}</td>

                <td className="p-3">
                  {editingId === u.id ? (
                    <div className="flex flex-col gap-2">
                      {/* Selector de rol */}
                      <select
                        value={roleEdit[u.id]}
                        onChange={(e) =>
                          setRoleEdit({ ...roleEdit, [u.id]: e.target.value })
                        }
                        className="input text-xs"
                      >
                        <option value="RECEPCION">Recepción</option>
                        <option value="ENTRENADOR">Entrenador</option>
                      </select>

                      {/* Botones */}
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1.5 text-xs rounded-md bg-yellow-500 text-black hover:bg-yellow-400"
                          onClick={() => saveEdit(u.id)}
                        >
                          Guardar cambios
                        </button>

                        <button
                          disabled={isSelf(u)}
                          onClick={() => handleResetPassword(u.id)}
                          className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-500"
                        >
                          Resetear contraseña
                        </button>

                        <button
                          className="px-3 py-1.5 text-xs rounded-md bg-gray-700 text-white hover:bg-gray-600"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={isSelf(u)}
                      onClick={() => startEdit(u)}
                      className={`
        flex items-center gap-1 px-3 py-1.5 text-xs rounded-md
        ${
          isSelf(u)
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-yellow-500 text-black hover:bg-yellow-400"
        }
      `}
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
