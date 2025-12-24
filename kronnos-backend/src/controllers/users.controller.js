import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import crypto from "crypto";


/**
 * GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE active = 1"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/**
 * POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (role === "ADMIN") {
      return res.status(403).json({
        message: "No está permitido crear usuarios administradores",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, role]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

/**
 * PUT /api/users/:id
 * ❌ No puede editarse a sí mismo
 */
export const updateUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    if (req.user.id === targetId) {
      return res.status(403).json({
        message: "No puedes editar tu propio usuario",
      });
    }

    const { name, email } = req.body;

    await pool.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [
      name,
      email,
      targetId,
    ]);

    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

/**
 * PATCH /api/users/:id/role
 * ❌ No puede cambiarse su propio rol
 */
export const updateUserRole = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Rol requerido" });
    }

    if (role === "ADMIN") {
      return res.status(403).json({
        message: "No está permitido asignar el rol de administrador",
      });
    }

    if (req.user.id === targetId) {
      return res.status(403).json({
        message: "No puedes cambiar tu propio rol",
      });
    }

    await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      targetId,
    ]);

    res.json({ message: "Rol actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar rol" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    // ❌ no puede resetearse a sí mismo
    if (req.user.id === targetId) {
      return res.status(403).json({
        message: "No puedes resetear tu propia contraseña",
      });
    }

    // generar password temporal
    const tempPassword = crypto.randomBytes(4).toString("hex"); // ej: a3f9c2e1
    const hash = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password_hash = ?, must_change_password = 1
      WHERE id = ?
      `,
      [hash, targetId]
    );

    // ⚠️ se devuelve SOLO UNA VEZ
    res.json({
      tempPassword,
      message: "Contraseña reseteada. Se debe cambiar al iniciar sesión.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al resetear contraseña" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Contraseña inválida ya que tiene que tener mas de 6 caracteres" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?",
      [hash, req.user.id]
    );

    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
};

