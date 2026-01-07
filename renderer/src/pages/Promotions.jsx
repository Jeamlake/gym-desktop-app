import { useEffect, useState } from "react";
import {
  getPromotions,
  createPromotion,
  togglePromotionStatus,
} from "../services/promotionsService";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    duracion_dias: "",
    precio: "",
    requiere_documento: false,
    tipo_documento: "",
    descripcion: "",
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPromotions();
      setPromotions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await createPromotion(form);

      setForm({
        nombre: "",
        duracion_dias: "",
        precio: "",
        requiere_documento: false,
        tipo_documento: "",
        descripcion: "",
      });

      fetchPromotions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (promo) => {
    try {
      await togglePromotionStatus(promo.id, !promo.active);
      fetchPromotions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestión de Promociones</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="duracion_dias"
            type="number"
            placeholder="Duración (días)"
            value={form.duracion_dias}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="precio"
            type="number"
            step="0.01"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            className="input"
            required
          />

          <label className="flex items-center gap-2 col-span-3">
            <input
              type="checkbox"
              name="requiere_documento"
              checked={form.requiere_documento}
              onChange={handleChange}
            />
            Requiere documento
          </label>

          {form.requiere_documento && (
            <input
              name="tipo_documento"
              placeholder="Tipo de documento"
              value={form.tipo_documento}
              onChange={handleChange}
              className="input col-span-2"
            />
          )}

          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="input col-span-3"
          />
        </div>

        <button type="submit" className="btn-primary">
          Crear promoción
        </button>
      </form>

      {loading && <div className="text-gray-400 text-sm">Cargando...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kronnos-surface">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Duración</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr
                key={p.id}
                className="border-t border-kronnos-surface hover:bg-kronnos-surface"
              >
                <td className="p-3">{p.nombre}</td>
                <td className="p-3">{p.duracion_dias} días</td>
                <td className="p-3">S/ {p.precio}</td>
                <td className="p-3">{p.active ? "Activa" : "Inactiva"}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggle(p)}
                    className={`px-3 py-1.5 text-xs rounded-md ${
                      p.active
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {p.active ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
