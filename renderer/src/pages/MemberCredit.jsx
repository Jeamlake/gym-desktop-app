import { useEffect, useState } from "react";
import { getMembers } from "../services/membersService";
import {
  getCreditAccount,
  getCreditHistory,
  registerCreditPayment,
  getMembersWithDebt,
} from "../services/creditService";

export default function MemberCredit() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debtors, setDebtors] = useState([]);

  useEffect(() => {
      getMembers().then(setMembers);
      getMembersWithDebt().then(setDebtors);
  }, []);

  const loadCredit = async (member) => {
    setSelectedMember(member);
    setLoading(true);

    try {
      const account = await getCreditAccount(member.id);
      const movements = await getCreditHistory(member.id);

      // 🔹 DEFENSA
      setSaldo(account ? Number(account.saldo) : 0);
      setHistory(movements);
    } catch (err) {
      console.error(err);
      alert("Error al cargar crédito");
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      return alert("Monto inválido");
    }

    try {
      await registerCreditPayment({
        member_id: selectedMember.id,
        monto: Number(paymentAmount),
      });

      setPaymentAmount("");
      loadCredit(selectedMember);
      alert("Pago registrado");
    } catch (err) {
      console.error(err);
      alert("Error al registrar pago");
    }
  };
  const filteredMembers = members.filter((m) => {
    const q = query.toLowerCase();
    return (
      m.nombres.toLowerCase().includes(q) ||
      m.apellidos.toLowerCase().includes(q) ||
      (m.dni && m.dni.includes(q))
    );
  });

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold mb-4">Crédito de Socios</h1>

      <div className="mb-4 relative">
        <label className="text-sm text-gray-400">Buscar socio</label>

        <input
          type="text"
          placeholder="Nombre o DNI"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          className="mt-1 w-full p-2 bg-black/40 border border-white/10 rounded"
        />

        {showResults && query && (
          <div className="absolute z-10 w-full bg-black border border-white/10 rounded max-h-48 overflow-y-auto">
            {filteredMembers.length === 0 && (
              <div className="p-2 text-sm text-gray-400">
                No se encontraron socios
              </div>
            )}

            {filteredMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  loadCredit(m);
                  setQuery(`${m.nombres} ${m.apellidos}`);
                  setShowResults(false);
                }}
                className="p-2 cursor-pointer hover:bg-white/10"
              >
                <div className="font-semibold">
                  {m.nombres} {m.apellidos}
                </div>
                <div className="text-xs text-gray-400">DNI: {m.dni}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <>
          {/* SALDO */}
          <div className="mb-4">
            <div className="text-sm text-gray-400">Saldo actual</div>
            <div
              className={`text-2xl font-bold ${
                saldo > 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              S/ {Number(saldo).toFixed(2)}
            </div>
          </div>

          {/* REGISTRAR PAGO */}
          <div className="mb-6 flex gap-2">
            <input
              type="number"
              placeholder="Monto a pagar"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="p-2 bg-black/40 border border-white/10 rounded"
            />
            <button
              onClick={submitPayment}
              className="bg-green-600 px-4 rounded"
            >
              Registrar pago
            </button>
          </div>

          {/* HISTORIAL */}
          <h2 className="font-semibold mb-2">Historial</h2>

          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : history.length === 0 ? (
            <div className="text-gray-400 text-sm">Sin movimientos</div>
          ) : (
            <table className="w-full text-sm border border-white/10">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2 text-right">Monto</th>
                  <th className="p-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-white/10">
                    <td className="p-2">
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                    <td
                      className={`p-2 font-bold ${
                        h.tipo === "CARGO" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {h.tipo}
                    </td>
                    <td className="p-2 text-right">
                      S/ {Number(h.monto).toFixed(2)}
                    </td>
                    <td className="p-2">{h.motivo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
          )}
          {/* LISTA DE SOCIOS CON DEUDA */}
{debtors.length > 0 && (
  <div className="mb-6 mt-4 border border-white/10 rounded">
    <div className="px-3 py-2 bg-white/10 text-sm font-semibold">
      Socios con deuda pendiente
    </div>

    <div className="max-h-60 overflow-y-auto">
      {debtors.map((d) => (
        <div
          key={d.id}
          onClick={() => loadCredit(d)}
          className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-white/10 border-t border-white/10"
        >
          <div>
            <div className="font-semibold">
              {d.nombres} {d.apellidos}
            </div>
            <div className="text-xs text-gray-400">
              DNI: {d.dni}
            </div>
          </div>

          <div className="text-red-400 font-bold">
            S/ {Number(d.saldo).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}
