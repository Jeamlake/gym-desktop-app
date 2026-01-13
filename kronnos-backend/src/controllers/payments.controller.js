import db from "../config/db.js";

export const createPayment = async (req, res) => {
  const { member_id, monto, metodo, periodo } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `INSERT INTO payments
       (member_id, monto, metodo, periodo, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [member_id, monto, metodo, periodo, userId]
    );

    res.status(201).json({
      message: "Pago registrado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar pago" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id,
             m.nombres,
             m.apellidos,
             p.monto,
             p.metodo,
             p.periodo,
             p.created_at
      FROM payments p
      JOIN members m ON m.id = p.member_id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch {
    res.status(500).json({ message: "Error al listar pagos" });
  }
};

export const getAvailablePayments = async (req, res) => {
  const { member_id } = req.query;

  if (!member_id) {
    return res.status(400).json({
      message: "member_id es requerido",
    });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT p.id,
             p.monto,
             p.metodo,
             p.periodo,
             p.created_at
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
