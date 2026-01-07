import { useEffect, useState } from "react";
import {
  getMemberships,
  createMembership,
  renewMembership,
  getMembershipHistory,
} from "../services/membershipsService";
import { getMembers } from "../services/membersService";
import { getPromotions } from "../services/promotionsService";
import { getAvailablePayments } from "../services/paymentsService";
import MembershipHistoryCalendar from "../components/MembershipHistoryCalendar";
 

export default function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [members, setMembers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [payments, setPayments] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyView, setHistoryView] = useState("list"); // "list" | "calendar"

  const [form, setForm] = useState({
    member_id: "",
    promotion_id: "",
    payment_id: "",
    fecha_inicio: "",
    mode: "create", // create | renew
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [mships, mems, promos] = await Promise.all([
        getMemberships(),
        getMembers(),
        getPromotions(),
      ]);

      setMemberships(mships);
      setMembers(mems);
      setPromotions(promos.filter((p) => p.active));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // 🔹 Cargar pagos disponibles cuando cambia el socio
  useEffect(() => {
    if (!form.member_id) {
      setPayments([]);
      setForm((f) => ({ ...f, payment_id: "" }));
      return;
    }

    const loadPayments = async () => {
      try {
        const data = await getAvailablePayments(form.member_id);
        setPayments(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadPayments();
  }, [form.member_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.payment_id) {
      setError("Debe seleccionar un pago");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const payload = {
        member_id: form.member_id,
        promotion_id: form.promotion_id,
        payment_id: form.payment_id,
        fecha_inicio: form.fecha_inicio,
      };

      if (form.mode === "create") {
        await createMembership(payload);
      } else {
        await renewMembership(payload);
      }

      setForm({
        member_id: "",
        promotion_id: "",
        payment_id: "",
        fecha_inicio: "",
        mode: "create",
      });

      setPayments([]);
      loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (member) => {
    try {
      setLoading(true);
      setHistoryMember(member);

      const data = await getMembershipHistory(member.member_id);
      setHistory(data);
      setHistoryOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-PE");
  };

  const filteredMemberships = memberships.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nombres.toLowerCase().includes(q) ||
      m.apellidos.toLowerCase().includes(q) ||
      (m.dni && m.dni.includes(q))
    );
  });

  const activeMembership = memberships.find(
    (m) => m.member_id === selectedMember?.id && m.estado === "ACTIVA"
  );

  const visibleMemberships = Object.values(
    memberships.reduce((acc, m) => {
      // si no existe socio, lo ponemos
      if (!acc[m.dni]) {
        acc[m.dni] = m;
        return acc;
      }

      // si hay una ACTIVA, siempre gana
      if (m.estado === "ACTIVA") {
        acc[m.dni] = m;
        return acc;
      }

      // si no hay activa, dejamos la más reciente
      if (
        acc[m.dni].estado !== "ACTIVA" &&
        new Date(m.fecha_inicio) > new Date(acc[m.dni].fecha_inicio)
      ) {
        acc[m.dni] = m;
      }

      return acc;
    }, {})
  );

  const calendarEvents = history.map((h) => ({
    id: h.id,
    title: `${h.promocion} – S/ ${h.monto}`,
    start: h.fecha_inicio,
    end: new Date(new Date(h.fecha_fin).getTime() + 24 * 60 * 60 * 1000), // incluir último día
    backgroundColor:
      h.estado === "VENCIDA"
        ? "#7f1d1d"
        : h.evento === "RENOVACION"
        ? "#6b21a8"
        : "#1d4ed8",
    borderColor: "transparent",
    extendedProps: {
      metodo: h.metodo,
      evento: h.evento,
      estado: h.estado,
    },
  }));


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Membresías</h2>

      <div className="card space-y-2">
        <label className="text-sm text-gray-400 font-medium">
          Buscar socio
        </label>
        <input
          type="text"
          placeholder="Nombre, apellido o DNI"
          className="input w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <div className="card space-y-2 max-h-64 overflow-y-auto">
          {members
            .filter((m) =>
              `${m.nombres} ${m.apellidos} ${m.dni}`
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((m) => (
              <div
                key={m.id}
                className="p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5"
                onClick={() => {
                  setSelectedMember(m);
                  setForm((f) => ({ ...f, member_id: m.id }));
                  setSearch("");
                }}
              >
                <p className="font-semibold">
                  {m.apellidos} {m.nombres}
                </p>
                <p className="text-xs text-gray-400">DNI: {m.dni}</p>
              </div>
            ))}
        </div>
      )}

      {selectedMember && (
        <div className="card border-l-4 border-kronnos-gold">
          <p className="text-xs text-gray-400">Socio seleccionado</p>
          <p className="font-semibold text-lg">
            {selectedMember.apellidos} {selectedMember.nombres}
          </p>
          <p className="text-sm text-gray-400">DNI: {selectedMember.dni}</p>
        </div>
      )}

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h3 className="text-lg font-semibold text-kronnos-gold">
          Registrar / Renovar Membresía
        </h3>

        {!selectedMember && (
          <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-3">
            ⚠️ Debe seleccionar un socio antes de registrar una membresía
          </div>
        )}
        {selectedMember && !activeMembership && (
          <div className="text-sm text-yellow-400">
            ⚠️ El socio no tiene una membresía activa para renovar
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Promoción:</label>
            <select
              className="input"
              value={form.promotion_id}
              onChange={(e) =>
                setForm({ ...form, promotion_id: e.target.value })
              }
            >
              <option value="">Seleccione promoción</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.duracion_dias} días)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Pago:</label>
            <select
              className="input"
              disabled={!payments.length}
              value={form.payment_id}
              onChange={(e) => setForm({ ...form, payment_id: e.target.value })}
            >
              <option value="">
                {payments.length ? "Seleccione pago" : "Sin pagos disponibles"}
              </option>
              {payments.map((p) => (
                <option key={p.id} value={p.id}>
                  S/ {p.monto} – {p.metodo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Fecha inicio:</label>
            <input
              type="date"
              className="input"
              value={form.fecha_inicio}
              onChange={(e) =>
                setForm({ ...form, fecha_inicio: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedMember}
          >
            {form.mode === "create" ? "Crear membresía" : "Renovar membresía"}
          </button>

          <button
            type="button"
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!activeMembership}
            onClick={() => setForm((f) => ({ ...f, mode: "renew" }))}
          >
            Renovar
          </button>
        </div>
      </form>

      {error && <div className="text-red-500">{error}</div>}
      {loading && <div className="text-gray-400">Cargando...</div>}

      {visibleMemberships.map((m) => {
        const isOpen = expandedId === m.id;
        const isActive = m.estado === "ACTIVA";

        return (
          <div
            key={m.id}
            className="card border-l-4 border-kronnos-gold space-y-4
           hover:bg-white/[0.02] transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Socio</p>
                <p className="font-semibold text-lg">
                  {m.apellidos} {m.nombres}
                </p>
                <p className="text-sm text-gray-400">DNI: {m.dni}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold
      ${
        isActive
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
      }`}
              >
                {m.estado}
              </span>
            </div>

            <div className="flex gap-4 pt-3">
              <button
                className="flex items-center gap-2 text-xs font-semibold
               text-kronnos-gold hover:text-yellow-400
               transition"
                onClick={() => setExpandedId(isOpen ? null : m.id)}
              >
                {isOpen ? "▴ Ocultar detalles" : "▾ Ver detalles"}
              </button>

              <button
                className="flex items-center gap-2 text-xs font-semibold
               text-blue-400 hover:text-blue-300
               transition"
                onClick={() => openHistory(m)}
              >
                📅 Historial
              </button>
            </div>

            {isOpen && (
              <div className="flex gap-6 pt-4 border-t border-white/10">
                <div className="w-28 h-36 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">
                  FOTO
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <p>
                    <b>Celular:</b> {m.celular || "-"}
                  </p>
                  <p>
                    <b>Dirección:</b> {m.direccion || "-"}
                  </p>
                  <p>
                    <b>Nacimiento:</b> {formatDate(m.fecha_nacimiento)}
                  </p>
                  <p>
                    <b>Promoción:</b> {m.promocion}
                  </p>
                  <p>
                    <b>Inicio:</b> {formatDate(m.fecha_inicio)}
                  </p>
                  <p>
                    <b>Fin:</b> {formatDate(m.fecha_fin)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-[700px] max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-kronnos-gold">
                Historial de Membresías
              </h3>

              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs"
                  onClick={() =>
                    setHistoryView(historyView === "list" ? "calendar" : "list")
                  }
                >
                  {historyView === "list"
                    ? "📅 Cambiar a vista calendario"
                    : "📄 Cambiar a vista listado"}
                </button>

                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setHistoryOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              {historyMember?.apellidos} {historyMember?.nombres} – DNI{" "}
              {historyMember?.dni}
            </p>

            {historyView === "list" ? (
              <div className="space-y-3">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="border-l-4 pl-4 py-2 rounded border-kronnos-gold bg-white/5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        {h.promocion}
                      </span>

                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          h.evento === "CREACION"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {h.evento === "CREACION" ? "Creada" : "Renovada"}
                      </span>
                    </div>

                    <p className="text-sm mt-1">
                      📅 {new Date(h.fecha_inicio).toLocaleDateString()} →{" "}
                      {new Date(h.fecha_fin).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-gray-400">
                      💰 S/ {h.monto} – {h.metodo}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <MembershipHistoryCalendar history={history} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
