import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  addStock,
    adjustStock,
  getProductMovements
} from "../services/productsService";

export default function Merchandise() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio_venta: "",
    costo: "",
  });
  const [stockForm, setStockForm] = useState({
    product_id: null,
    tipo: null,
    cantidad: "",
    motivo: "",
  });

  const [movements, setMovements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return <div className="text-gray-300">Cargando productos...</div>;
  }

  const handleCreateProduct = async () => {
    try {
      await createProduct({
        ...form,
        precio_venta: Number(form.precio_venta),
        costo: Number(form.costo),
      });

      setForm({ nombre: "", categoria: "", precio_venta: "", costo: "" });
      setShowForm(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error al crear producto");
    }
  };

  const openStockForm = (product_id, tipo) => {
    setStockForm({
      product_id,
      tipo,
      cantidad: "",
      motivo: tipo === "IN" ? "COMPRA" : "",
    });
  };

  const submitStockChange = async () => {
    const { product_id, tipo, cantidad, motivo } = stockForm;

    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");
    if (!motivo) return alert("Motivo requerido");

    try {
      if (tipo === "IN") {
        await addStock({ product_id, cantidad: Number(cantidad), motivo });
      } else {
        await adjustStock({ product_id, cantidad: Number(cantidad), motivo });
      }

      setStockForm({
        product_id: null,
        tipo: null,
        cantidad: "",
        motivo: "",
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar stock");
    }
    };
    
    const openHistory = async (product) => {
      setSelectedProduct(product);
      setLoadingMovements(true);

      try {
        const data = await getProductMovements(product.id);
        setMovements(data);
      } catch (err) {
        console.error(err);
        alert("Error al cargar historial");
      } finally {
        setLoadingMovements(false);
      }
    };


  return (
    <div className="text-white">
      <h1 className="text-xl font-bold mb-4">Mercadería</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-kronnos-gold text-black px-4 py-2 rounded font-semibold"
      >
        + Nuevo Producto
      </button>

      {showForm && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="p-2 rounded bg-black/40 border border-white/10"
          />
          <input
            placeholder="Categoría"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="p-2 rounded bg-black/40 border border-white/10"
          />
          <input
            placeholder="Precio venta"
            type="number"
            value={form.precio_venta}
            onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
            className="p-2 rounded bg-black/40 border border-white/10"
          />
          <input
            placeholder="Costo"
            type="number"
            value={form.costo}
            onChange={(e) => setForm({ ...form, costo: e.target.value })}
            className="p-2 rounded bg-black/40 border border-white/10"
          />

          <button
            onClick={handleCreateProduct}
            className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Guardar producto
          </button>
        </div>
      )}

      <table className="w-full text-sm border border-white/10">
        <thead className="bg-white/10">
          <tr>
            <th className="p-2 text-left">Producto</th>
            <th className="p-2 text-left">Categoría</th>
            <th className="p-2 text-right">Stock</th>
            <th className="p-2 text-right">Precio</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-white/10">
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">{p.categoria || "-"}</td>
              <td className="p-2 text-right">{p.stock_actual}</td>
              <td className="p-2 text-right">S/ {p.precio_venta}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => openStockForm(p.id, "IN")}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  + Stock
                </button>
                <button
                  onClick={() => openStockForm(p.id, "OUT")}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  − Stock
                </button>
                <button
                  onClick={() => openHistory(p)}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  📜
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stockForm.product_id && (
        <div className="mt-6 p-4 border border-white/10 rounded bg-black/40">
          <h3 className="font-semibold mb-3">
            {stockForm.tipo === "IN" ? "Ingreso de Stock" : "Salida de Stock"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Cantidad"
              value={stockForm.cantidad}
              onChange={(e) =>
                setStockForm({ ...stockForm, cantidad: e.target.value })
              }
              className="p-2 rounded bg-black/40 border border-white/10"
            />

            <input
              placeholder="Motivo"
              value={stockForm.motivo}
              onChange={(e) =>
                setStockForm({ ...stockForm, motivo: e.target.value })
              }
              className="p-2 rounded bg-black/40 border border-white/10"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={submitStockChange}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Confirmar
            </button>

            <button
              onClick={() =>
                setStockForm({
                  product_id: null,
                  tipo: null,
                  cantidad: "",
                  motivo: "",
                })
              }
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="mt-6 p-4 border border-white/10 rounded bg-black/40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">
              Historial — {selectedProduct.nombre}
            </h3>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setMovements([]);
              }}
              className="text-sm text-red-400"
            >
              Cerrar
            </button>
          </div>

          {loadingMovements ? (
            <div className="text-gray-400">Cargando historial...</div>
          ) : movements.length === 0 ? (
            <div className="text-gray-400 text-sm">
              No hay movimientos registrados
            </div>
          ) : (
            <table className="w-full text-sm border border-white/10">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-center">Tipo</th>
                  <th className="p-2 text-right">Cantidad</th>
                  <th className="p-2 text-left">Motivo</th>
                  <th className="p-2 text-left">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="p-2">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td
                      className={`p-2 text-center font-bold ${
                        m.tipo === "IN" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {m.tipo}
                    </td>
                    <td className="p-2 text-right">{m.cantidad}</td>
                    <td className="p-2">{m.motivo}</td>
                    <td className="p-2">{m.username || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
