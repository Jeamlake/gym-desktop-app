// src/controllers/products.controller.js
import db from "../config/db.js";

export const getProducts = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM products WHERE active = 1 ORDER BY nombre"
  );
  res.json(rows);
};

export const createProduct = async (req, res) => {
  const { nombre, categoria, precio_venta, costo } = req.body;

  const [result] = await db.query(
    `INSERT INTO products (nombre, categoria, precio_venta, costo)
     VALUES (?, ?, ?, ?)`,
    [nombre, categoria, precio_venta, costo]
  );

  res.status(201).json({ id: result.insertId });
};

export const addStock = async (req, res) => {
  const { product_id, cantidad, motivo } = req.body;

  await db.query(
    `INSERT INTO inventory_movements 
     (product_id, tipo, cantidad, motivo, created_by)
     VALUES (?, 'IN', ?, ?, ?)`,
    [product_id, cantidad, motivo, req.user.id]
  );

  await db.query(
    `UPDATE products 
     SET stock_actual = stock_actual + ?
     WHERE id = ?`,
    [cantidad, product_id]
  );

  res.json({ message: "Stock ingresado correctamente" });
};

export const adjustStock = async (req, res) => {
  const { product_id, cantidad, motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({ message: "Motivo requerido" });
  }

  const [[product]] = await db.query(
    "SELECT stock_actual FROM products WHERE id = ?",
    [product_id]
  );

  if (!product || product.stock_actual < cantidad) {
    return res.status(400).json({ message: "Stock insuficiente" });
  }

  await db.query(
    `INSERT INTO inventory_movements
     (product_id, tipo, cantidad, motivo, created_by)
     VALUES (?, 'OUT', ?, ?, ?)`,
    [product_id, cantidad, motivo, req.user.id]
  );

  await db.query(
    `UPDATE products
     SET stock_actual = stock_actual - ?
     WHERE id = ?`,
    [cantidad, product_id]
  );

  res.json({ message: "Stock ajustado correctamente" });
};

export const getProductMovements = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `
    SELECT 
      im.tipo,
      im.cantidad,
      im.motivo,
      im.created_at,
      u.username
    FROM inventory_movements im
    LEFT JOIN users u ON im.created_by = u.id
    WHERE im.product_id = ?
    ORDER BY im.created_at DESC
    `,
    [id]
  );

  res.json(rows);
};
