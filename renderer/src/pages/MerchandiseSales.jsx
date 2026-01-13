import { useEffect, useState } from "react";
import { getProducts } from "../services/productsService";
import { createSale } from "../services/salesService";
import { getMembers } from "../services/membersService";
import { createCreditCharge } from "../services/creditService";

export default function MerchandiseSales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 MÉTODO DE PAGO (USA SOLO ESTE)
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  // 🔹 SOCIO (SOLO PARA CRÉDITO)
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.filter((p) => p.stock_actual > 0));
    } catch (err) {
      console.error(err);
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar socios");
    }
  };

  useEffect(() => {
    loadProducts();
    loadMembers();
  }, []);

  const addToCart = (product) => {
    const exists = cart.find((i) => i.product_id === product.id);

    if (exists) {
      if (exists.cantidad + 1 > product.stock_actual) return;

      setCart(
        cart.map((i) =>
          i.product_id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          nombre: product.nombre,
          precio: product.precio_venta,
          cantidad: 1,
        },
      ]);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  const confirmSale = async () => {
    if (cart.length === 0) return alert("Carrito vacío");

    try {
      // 🔹 SI ES CRÉDITO
      if (paymentMethod === "CREDITO") {
        if (!selectedMember) {
          return alert("Debes seleccionar un socio");
        }

        await createCreditCharge({
          member_id: selectedMember.id,
          items: cart.map((i) => ({
            product_id: i.product_id,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
          })),
          motivo: "FIADO DE MERCADERÍA",
        });
      }
      // 🔹 SI ES VENTA NORMAL
      else {
        await createSale({
          items: cart.map((i) => ({
            product_id: i.product_id,
            cantidad: i.cantidad,
          })),
          metodo_pago: paymentMethod,
        });
      }

      setCart([]);
      setSelectedMember(null);
      loadProducts();
      alert("Operación registrada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al registrar operación");
    }
  };

  if (loading) {
    return <div className="text-gray-300">Cargando...</div>;
  }

  const increaseQty = (id, stock) => {
    setCart(
      cart.map((i) =>
        i.product_id === id && i.cantidad < stock
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((i) =>
          i.product_id === id ? { ...i, cantidad: i.cantidad - 1 } : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  const filteredMembers = members.filter((m) => {
    const q = memberQuery.toLowerCase();
    return (
      m.nombres.toLowerCase().includes(q) ||
      m.apellidos.toLowerCase().includes(q) ||
      (m.dni && m.dni.includes(q))
    );
  });

  return (
    <div className="text-white grid grid-cols-3 gap-4">
      {/* PRODUCTOS */}
      <div className="col-span-2">
        <h2 className="font-bold mb-2">Productos</h2>

        <div className="grid grid-cols-3 gap-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="p-3 border border-white/10 rounded hover:bg-white/10 text-left"
            >
              <div className="font-semibold">{p.nombre}</div>
              <div className="text-sm text-gray-400">
                Stock: {p.stock_actual}
              </div>
              <div className="font-bold">S/ {p.precio_venta}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CARRITO */}
      <div className="border border-white/10 p-4 rounded">
        <h2 className="font-bold mb-2">Venta</h2>

        {cart.length === 0 && (
          <div className="text-gray-400 text-sm">Carrito vacío</div>
        )}

        {cart.map((i) => {
          const stock =
            products.find((p) => p.id === i.product_id)?.stock_actual || 0;

          return (
            <div
              key={i.product_id}
              className="flex justify-between items-center text-sm mb-2"
            >
              <span className="w-28">{i.nombre}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(i.product_id)}
                  className="px-2 bg-red-600 rounded"
                >
                  −
                </button>

                <span>{i.cantidad}</span>

                <button
                  onClick={() => increaseQty(i.product_id, stock)}
                  className="px-2 bg-green-600 rounded"
                >
                  +
                </button>
              </div>

              <span>S/ {(i.precio * i.cantidad).toFixed(2)}</span>
            </div>
          );
        })}

        <div className="border-t border-white/10 mt-3 pt-2 font-bold">
          Total: S/ {total.toFixed(2)}
        </div>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mt-3 w-full p-2 bg-black/40 border border-white/10 rounded"
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="CREDITO">Crédito</option>
        </select>

        {paymentMethod === "CREDITO" && (
          <div className="mt-3 relative">
            <label className="text-sm text-gray-400">Socio</label>

            <input
              type="text"
              placeholder="Buscar socio por nombre o DNI"
              value={memberQuery}
              onChange={(e) => {
                setMemberQuery(e.target.value);
                setShowMemberResults(true);
              }}
              className="mt-1 w-full p-2 bg-black/40 border border-white/10 rounded"
            />

            {showMemberResults && memberQuery && (
              <div className="absolute z-10 mt-1 w-full bg-black border border-white/10 rounded max-h-48 overflow-y-auto">
                {filteredMembers.length === 0 && (
                  <div className="p-2 text-sm text-gray-400">
                    No se encontraron socios
                  </div>
                )}

                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setMemberQuery(`${m.nombres} ${m.apellidos}`);
                      setShowMemberResults(false);
                    }}
                    className="p-2 text-sm hover:bg-white/10 cursor-pointer"
                  >
                    <div className="font-semibold">
                      {m.nombres} {m.apellidos}
                    </div>
                    <div className="text-xs text-gray-400">
                      DNI: {m.dni || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={confirmSale}
          disabled={cart.length === 0}
          className="mt-4 w-full bg-kronnos-gold text-black py-2 rounded font-semibold disabled:opacity-50"
        >
          Confirmar venta
        </button>
      </div>
    </div>
  );
}
