import { useEffect, useState } from "react";
import { getPayments, createPayment } from "../services/paymentsService";
import { getMembers } from "../services/membersService";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    member_id: "",
    monto: "",
    metodo: "EFECTIVO",
    periodo: "",
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [payData, memData] = await Promise.all([
        getPayments(),
        getMembers(),
      ]);
      setPayments(payData);
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
      setLoading(true);

      await createPayment(form);

      setForm({
        member_id: "",
        monto: "",
        metodo: "EFECTIVO",
        periodo: "",
      });

      loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Registro de Pagos</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <select
            className="input col-span-2"
            value={form.member_id}
            onChange={(e) => setForm({ ...form, member_id: e.target.value })}
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
            type="number"
            step="0.01"
            placeholder="Monto"
            className="input"
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            required
          />

          <select
            className="input"
            value={form.metodo}
            onChange={(e) => setForm({ ...form, metodo: e.target.value })}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>

          <input
            placeholder="Periodo (ej. Mayo 2025)"
            className="input col-span-2"
            value={form.periodo}
            onChange={(e) => setForm({ ...form, periodo: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-primary">
          Registrar pago
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}
      {loading && <div className="text-gray-400">Cargando...</div>}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Socio</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Método</th>
              <th className="p-3">Periodo</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  {p.nombres} {p.apellidos}
                </td>
                <td className="p-3">S/ {p.monto}</td>
                <td className="p-3">{p.metodo}</td>
                <td className="p-3">{p.periodo || "-"}</td>
                <td className="p-3 text-sm text-gray-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const getAvailablePayments = async (req, res) => {
  const { member_id } = req.query;

  if (!member_id) {
    return res.status(400).json({
      message: "member_id es requerido",
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT p.id, p.monto, p.metodo, p.periodo, p.created_at
      FROM payments p
      LEFT JOIN memberships m ON m.payment_id = p.id
      WHERE p.member_id = ?
        AND m.id IS NULL
      ORDER BY p.created_at DESC
      `,
      [member_id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener pagos disponibles",
    });
  }
};

