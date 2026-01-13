import db from "../config/db.js";

/* ===============================
   📌 OBTENER CUENTA DE CRÉDITO
================================ */
export const getCreditAccount = async (req, res) => {
  const { memberId } = req.params;

  const [[account]] = await db.query(
    "SELECT * FROM credit_accounts WHERE member_id = ? AND active = 1",
    [memberId]
  );

  res.json(account || null);
};

/* ===============================
   💳 CREAR CARGO (FIADO)
================================ */
export const createCreditCharge = async (req, res) => {
  const { member_id, items, motivo } = req.body;
  const userId = req.user.id;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[account]] = await conn.query(
      "SELECT * FROM credit_accounts WHERE member_id = ? FOR UPDATE",
      [member_id]
    );

    // total
    let total = 0;
    for (const item of items) {
      total += item.precio_unitario * item.cantidad;
    }

    if (
      account &&
      account.credit_limit > 0 &&
      Number(account.saldo) + total > Number(account.credit_limit)
    ) {
      throw new Error("El socio supera su límite de crédito");
    }

    // movimiento
    const [movement] = await conn.query(
      `INSERT INTO credit_movements (member_id, tipo, monto, motivo, created_by)
       VALUES (?, 'CARGO', ?, ?, ?)`,
      [member_id, total, motivo || "FIADO MERCADERÍA", userId]
    );

    const movementId = movement.insertId;

    // detalle + stock
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_items
         (credit_movement_id, product_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [movementId, item.product_id, item.cantidad, item.precio_unitario]
      );

      await conn.query(
        `UPDATE products
         SET stock_actual = stock_actual - ?
         WHERE id = ?`,
        [item.cantidad, item.product_id]
      );
    }

    // cuenta crédito
    await conn.query(
      `INSERT INTO credit_accounts (member_id, saldo)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE saldo = saldo + ?`,
      [member_id, total, total]
    );

    await conn.commit();
    res.status(201).json({ total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/* ===============================
   💵 REGISTRAR PAGO
================================ */
export const registerCreditPayment = async (req, res) => {
  const { member_id, monto } = req.body;
  const userId = req.user.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO credit_movements
       (member_id, tipo, monto, motivo, created_by)
       VALUES (?, 'PAGO', ?, 'ABONO', ?)`,
      [member_id, monto, userId]
    );

    await conn.query(
      `UPDATE credit_accounts
       SET saldo = saldo - ?
       WHERE member_id = ?`,
      [monto, member_id]
    );

    await conn.commit();
    res.json({ message: "Pago registrado" });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/* ===============================
   📜 HISTORIAL DE CRÉDITO
================================ */
export const getCreditHistory = async (req, res) => {
  const { memberId } = req.params;

  const [rows] = await db.query(
    `
    SELECT cm.*, u.username
    FROM credit_movements cm
    LEFT JOIN users u ON u.id = cm.created_by
    WHERE cm.member_id = ?
    ORDER BY cm.created_at DESC
    `,
    [memberId]
  );

  res.json(rows);
};

export const getMembersWithDebt = async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      m.id,
      m.nombres,
      m.apellidos,
      m.dni,
      ca.saldo
    FROM credit_accounts ca
    JOIN members m ON m.id = ca.member_id
    WHERE ca.saldo > 0
      AND ca.active = 1
    ORDER BY ca.saldo DESC
  `);

  res.json(rows);
};
