import { pool } from "../config/db.js";

/**
 * 🔒 Lógica central para crear membresía con pago
 */
const createMembershipInternal = async ({
  member_id,
  promotion_id,
  payment_id,
  fecha_inicio,
  userId,
  evento = "CREACION",
}) => {
  // 1️⃣ Validar pago
  const [pay] = await pool.query(
    "SELECT id FROM payments WHERE id = ? AND member_id = ?",
    [payment_id, member_id]
  );

  if (pay.length === 0) {
    throw new Error("Pago inválido o no pertenece al socio");
  }

  // 2️⃣ Validar pago no usado
  const [used] = await pool.query(
    "SELECT id FROM memberships WHERE payment_id = ?",
    [payment_id]
  );

  if (used.length > 0) {
    throw new Error("Este pago ya fue utilizado");
  }

  // 3️⃣ Validar promoción
  const [promo] = await pool.query(
    "SELECT duracion_dias FROM promotions WHERE id = ? AND active = 1",
    [promotion_id]
  );

  if (promo.length === 0) {
    throw new Error("Promoción inválida");
  }

  // 4️⃣ Calcular fecha fin (hasta 23:59:59 del último día)
  const fechaInicio = new Date(fecha_inicio);
  fechaInicio.setHours(0, 0, 0, 0);

  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + promo[0].duracion_dias);
  fechaFin.setSeconds(fechaFin.getSeconds() - 1); // 23:59:59 del día anterior

  // 5️⃣ Insertar membresía
  const [result] = await pool.query(
    `INSERT INTO memberships
(member_id, promotion_id, payment_id, fecha_inicio, fecha_fin, estado, evento, created_by)
VALUES (?, ?, ?, ?, ?, 'ACTIVA', ?, ?)`,
    [
      member_id,
      promotion_id,
      payment_id,
      fecha_inicio,
      fechaFin,
      evento,
      userId,
    ]
  );

  return result.insertId;
};

// ✅ Crear membresía
export const createMembership = async (req, res) => {
  const { member_id, promotion_id, payment_id, fecha_inicio } = req.body;
  const userId = req.user.id;

  try {
    // ❗ No permitir doble activa
    const [active] = await pool.query(
      "SELECT id FROM memberships WHERE member_id = ? AND estado = 'ACTIVA'",
      [member_id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: "El socio ya tiene una membresía activa. Use renovación.",
      });
    }

    await createMembershipInternal({
      member_id,
      promotion_id,
      payment_id,
      fecha_inicio,
      userId,
    });

    res.status(201).json({ message: "Membresía creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Listar membresías
export const getMemberships = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        mem.id AS member_id,
        mem.nombres,
        mem.apellidos,
        mem.dni,
        mem.celular,
        mem.direccion,
        mem.fecha_nacimiento,
        p.nombre AS promocion,
        m.fecha_inicio,
        m.fecha_fin,
        m.estado
      FROM memberships m
      JOIN members mem ON mem.id = m.member_id
      JOIN promotions p ON p.id = m.promotion_id
      ORDER BY m.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar membresías" });
  }
};

// ✅ Renovar membresía
export const renewMembership = async (req, res) => {
  const { member_id, promotion_id, payment_id, fecha_inicio } = req.body;
  const userId = req.user.id;

  try {
    // ❗ Verificar que exista una membresía previa
    const [prev] = await pool.query(
      "SELECT id FROM memberships WHERE member_id = ?",
      [member_id]
    );

    if (prev.length === 0) {
      return res.status(400).json({
        message: "No se puede renovar: el socio no tiene membresías previas",
      });
    }

    // 1️⃣ Vencer activa
    await pool.query(
      "UPDATE memberships SET estado = 'VENCIDA' WHERE member_id = ? AND estado = 'ACTIVA'",
      [member_id]
    );

    const id = await createMembershipInternal({
      member_id,
      promotion_id,
      payment_id,
      fecha_inicio,
      userId,
      evento: "RENOVACION",
    });

    res.status(201).json({
      message: "Membresía renovada correctamente",
      membership_id: id,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// GET /memberships/summary
export const getMembershipsSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        mem.id AS member_id,
        mem.nombres,
        mem.apellidos,
        mem.dni,
        p.nombre AS promocion,
        m.fecha_inicio,
        m.fecha_fin,
        m.estado
      FROM memberships m
      JOIN members mem ON mem.id = m.member_id
      JOIN promotions p ON p.id = m.promotion_id
      WHERE m.id IN (
        SELECT MAX(id)
        FROM memberships
        GROUP BY member_id
      )
      ORDER BY m.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al listar resumen de membresías" });
  }
};

// GET /memberships/history/:memberId
export const getMembershipHistory = async (req, res) => {
  const { memberId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
  m.id,
  p.nombre AS promocion,
  m.fecha_inicio,
  m.fecha_fin,
  m.estado,
  m.evento,
  pay.monto,
  pay.metodo,
  m.created_at
FROM memberships m
JOIN promotions p ON p.id = m.promotion_id
JOIN payments pay ON pay.id = m.payment_id
WHERE m.member_id = ?
ORDER BY m.created_at ASC
    `,
      [memberId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener historial" });
  }
};
