import { pool } from "../config/db.js";

/**
 * GET /api/promotions
 * Lista promociones activas
 */
export const getPromotions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM promotions WHERE active = 1 ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener promociones" });
  }
};

/**
 * POST /api/promotions
 * Crea una promoción (ADMIN)
 */
export const createPromotion = async (req, res) => {
  try {
    const {
      nombre,
      duracion_dias,
      precio,
      requiere_documento,
      tipo_documento,
      descripcion,
    } = req.body;

    if (!nombre || !duracion_dias || !precio) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    await pool.query(
      `INSERT INTO promotions
        (nombre, duracion_dias, precio, requiere_documento, tipo_documento, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        duracion_dias,
        precio,
        requiere_documento ? 1 : 0,
        tipo_documento || null,
        descripcion || null,
      ]
    );

    res.status(201).json({ message: "Promoción creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear promoción" });
  }
};

/**
 * PATCH /api/promotions/:id/toggle
 * Activa / desactiva promoción (ADMIN)
 */
export const togglePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE promotions SET active = NOT active WHERE id = ?", [
      id,
    ]);

    res.json({ message: "Estado de promoción actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar promoción" });
  }
};
