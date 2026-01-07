
import { pool } from "../config/db.js";

export const registerAttendance = async (req, res) => {
  const { member_id } = req.body;
  const userId = req.user.id;

  try {
    // 1. Verificar membresía activa
    const [membership] = await pool.query(
      `
      SELECT id FROM memberships
      WHERE member_id = ?
        AND estado = 'ACTIVA'
        AND fecha_fin >= CURDATE()
      `,
      [member_id]
    );

    if (membership.length === 0) {
      return res.status(403).json({
        message: "Membresía vencida o inexistente",
      });
    }

    // 2. Registrar asistencia
    await pool.query(
      `
      INSERT INTO attendance (member_id, date, recorded_by)
      VALUES (?, CURDATE(), ?)
      `,
      [member_id, userId]
    );

    return res.status(201).json({ message: "Ingreso registrado" });
  } catch (error) {
    console.error(error);

    // ✅ AQUÍ va el control de duplicado
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "El socio ya registró asistencia hoy",
      });
    }

    return res.status(500).json({
      message: "Error al registrar asistencia",
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.date,
        CONCAT(m.nombres, ' ', m.apellidos) AS socio
      FROM attendance a
      JOIN members m ON m.id = a.member_id
      ORDER BY a.date DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al registrar asistencia",
    });
  }

};
