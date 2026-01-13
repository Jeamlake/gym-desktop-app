// src/controllers/sales.controller.js
import db from "../config/db.js";

export const createSale = async (req, res) => {
  const { items, metodo_pago } = req.body;
  // items: [{ product_id, cantidad }]

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;

    for (const item of items) {
      const [[product]] = await conn.query(
        "SELECT precio_venta, stock_actual FROM products WHERE id = ?",
        [item.product_id]
      );

      if (!product || product.stock_actual < item.cantidad) {
        throw new Error("Stock insuficiente");
      }

      total += product.precio_venta * item.cantidad;
    }

    const [saleResult] = await conn.query(
      "INSERT INTO sales (sold_by, total, metodo_pago) VALUES (?, ?, ?)",
      [req.user.id, total, metodo_pago || "EFECTIVO"]
    );

    const saleId = saleResult.insertId;

    for (const item of items) {
      const [[product]] = await conn.query(
        "SELECT precio_venta FROM products WHERE id = ?",
        [item.product_id]
      );

      await conn.query(
        `INSERT INTO sale_items 
         (sale_id, product_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [saleId, item.product_id, item.cantidad, product.precio_venta]
      );

      await conn.query(
        `INSERT INTO inventory_movements
         (product_id, tipo, cantidad, motivo, created_by)
         VALUES (?, 'OUT', ?, 'VENTA', ?)`,
        [item.product_id, item.cantidad, req.user.id]
      );

      await conn.query(
        `UPDATE products
         SET stock_actual = stock_actual - ?
         WHERE id = ?`,
        [item.cantidad, item.product_id]
      );
    }

    await conn.commit();
    res.status(201).json({ saleId, total });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    conn.release();
  }
};
