import { useEffect, useState } from "react";
import {
    getAttendance,
    registerAttendance,
} from "../services/attendanceService";
import { getMembers } from "../services/membersService";

export default function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);


  const [form, setForm] = useState({
    member_id: "",
    date: new Date().toISOString().slice(0, 10), // hoy
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [attData, memData] = await Promise.all([
        getAttendance(),
        getMembers(),
      ]);
      setAttendance(attData);
      setMembers(memData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        setError(null);
        setSuccess(null);
        setLoading(true);

        await registerAttendance(form);

        setSuccess("Ingreso registrado correctamente");

        setForm({
          ...form,
          member_id: "",
        });

        loadAll();
      } catch (err) {
        if (err.status === 403) {
          setError("Membresía vencida o inexistente");
        } else if (err.status === 409) {
          setError("El socio ya registró asistencia hoy");
        } else {
          setError("Error del sistema");
        }
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Registro de Asistencia</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <select
            className="input col-span-2"
            value={form.member_id}
            onChange={(e) => {
              setForm({ ...form, member_id: e.target.value });
              setError(null);
              setSuccess(null);
            }}
            required
          >
            <option value="">Seleccione socio</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Registrando..." : "Registrar asistencia"}
        </button>
      </form>

      {success && <div className="text-green-400">{success}</div>}
      {error && <div className="text-red-500">{error}</div>}
      {loading && <div className="text-gray-400">Cargando...</div>}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Socio</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.socio}</td>
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
