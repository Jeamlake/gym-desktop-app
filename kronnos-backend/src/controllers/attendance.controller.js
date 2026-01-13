import db from "../config/db.js";

/* ===============================
   📡 SCAN (QR / lector)
================================ */
export const scanAttendance = async (req, res) => {
  const { member_id } = req.body;
  const userId = req.user.id;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const [[membership]] = await db.query(
      `
      SELECT id
      FROM memberships
      WHERE member_id = ?
        AND DATE(fecha_inicio) <= DATE(?)
        AND DATE(fecha_fin) >= DATE(?)
      ORDER BY fecha_fin DESC
      LIMIT 1
      `,
      [member_id, today, today]
    );

    if (!membership) {
      return res.status(403).json({
        message: "No existe una membresía válida para hoy",
      });
    }

    const [[lastLog]] = await db.query(
      `
      SELECT action
      FROM attendance_logs
      WHERE member_id = ?
        AND DATE(scanned_at) = DATE(?)
      ORDER BY scanned_at DESC
      LIMIT 1
      `,
      [member_id, today]
    );

    const nextAction = lastLog?.action === "IN" ? "OUT" : "IN";

    await db.query(
      `
      INSERT INTO attendance_logs
        (member_id, membership_id, action, created_by)
      VALUES (?, ?, ?, ?)
      `,
      [member_id, membership.id, nextAction, userId]
    );

    await db.query(
      `
      INSERT IGNORE INTO attendance (member_id, date, recorded_by)
      VALUES (?, ?, ?)
      `,
      [member_id, today, userId]
    );

    res.json({ action: nextAction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};

/* ===============================
   🖱️ ASISTENCIA MANUAL (calendario)
================================ */
export const markAttendanceManual = async (req, res) => {
  const { member_id, date } = req.body;
  const userId = req.user.id;

  try {
    const [[membership]] = await db.query(
      `
      SELECT id
      FROM memberships
      WHERE member_id = ?
        AND DATE(fecha_inicio) <= DATE(?)
        AND DATE(fecha_fin) >= DATE(?)
      ORDER BY fecha_fin DESC
      LIMIT 1
      `,
      [member_id, date, date]
    );

    if (!membership) {
      return res.status(403).json({
        message: "No existe membresía válida para esta fecha",
      });
    }

    await db.query(
      `
      INSERT INTO attendance (member_id, date, recorded_by)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE recorded_by = recorded_by
      `,
      [member_id, date, userId]
    );

    const scannedAt = `${date} 12:00:00`; // HORA SEGURA

    await db.query(
      `
      INSERT INTO attendance_logs
        (member_id, membership_id, action, scanned_at, created_by)
      VALUES (?, ?, 'IN', ?, ?)
      `,
      [member_id, membership.id, scannedAt, userId]
    );

    res.json({ message: "Asistencia registrada manualmente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al marcar asistencia" });
  }
};

/* ===============================
   📊 HISTORIAL POR SOCIO
================================ */
export const getAttendanceByMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        DATE(scanned_at) AS fecha,
        COUNT(*) AS marcas,
        MAX(scanned_at) AS ultima_marca,
        MAX(action) AS estado_actual
      FROM attendance_logs
      WHERE member_id = ?
      GROUP BY DATE(scanned_at)
      ORDER BY fecha DESC
      `,
      [memberId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencia" });
  }
};
