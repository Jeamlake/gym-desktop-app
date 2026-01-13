import db from "../config/db.js";

/**
 * GET /api/members
 */
export const getMembers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        nombres,
        apellidos,
        dni,
        direccion,
        celular,
        fecha_nacimiento,
        created_at
      FROM members
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener socios" });
  }
};

/**
 * POST /api/members
 * Crear socio con validaciones fuertes
 */
export const createMember = async (req, res) => {
  const { nombres, apellidos, dni, direccion, celular, fecha_nacimiento } =
    req.body;

  // 🔴 Campos obligatorios
  if (!nombres || !apellidos || !dni || !celular || !fecha_nacimiento) {
    return res.status(400).json({
      message:
        "Nombres, apellidos, DNI, celular y fecha de nacimiento son obligatorios",
    });
  }

  // 🔐 Validar DNI: 8 dígitos numéricos
  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({
      message: "El DNI debe contener exactamente 8 números",
    });
  }

  // 📱 Validar celular: 9 dígitos, empieza con 9
  if (!/^9\d{8}$/.test(celular)) {
    return res.status(400).json({
      message: "El celular debe tener 9 dígitos y empezar con 9",
    });
  }

  try {
    // 🔍 Validar DNI único
    const [existing] = await db.query("SELECT id FROM members WHERE dni = ?", [
      dni,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Ya existe un socio registrado con este DNI",
      });
    }

    // 💾 Insertar socio
    const [result] = await db.query(
      `
      INSERT INTO members
      (nombres, apellidos, dni, direccion, celular, fecha_nacimiento, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombres.trim(),
        apellidos.trim(),
        dni,
        direccion || null,
        celular,
        fecha_nacimiento,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Socio creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear socio" });
  }
};
