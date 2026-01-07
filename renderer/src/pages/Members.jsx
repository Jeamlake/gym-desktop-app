import { useEffect, useState } from "react";
import { getMembers, createMember } from "../services/membersService";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    direccion: "",
    celular: "",
    fecha_nacimiento: "",
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await createMember(form);

      setForm({
        nombres: "",
        apellidos: "",
        dni: "",
        direccion: "",
        celular: "",
        fecha_nacimiento: "",
      });

      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Socios</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            name="nombres"
            placeholder="Nombres"
            value={form.nombres}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="apellidos"
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            className="input"
          />

          <input
            name="celular"
            placeholder="Celular"
            value={form.celular}
            onChange={handleChange}
            className="input"
          />

          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            className="input col-span-2"
          />

          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            className="input"
          />
        </div>

        <button type="submit" className="btn-primary">
          Registrar socio
        </button>
      </form>

      {/* Estados */}
      {loading && <div className="text-gray-400 text-sm">Cargando...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">DNI</th>
              <th className="p-3">Celular</th>
              <th className="p-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-t border-kronnos-surface hover:bg-kronnos-surface"
              >
                <td className="p-3">
                  {m.nombres} {m.apellidos}
                </td>
                <td className="p-3">{m.dni || "-"}</td>
                <td className="p-3">{m.celular || "-"}</td>
                <td className="p-3 text-sm text-gray-400">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
