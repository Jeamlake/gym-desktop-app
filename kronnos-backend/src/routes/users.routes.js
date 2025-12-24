import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  resetPassword,
  changePassword,
} from "../controllers/users.controller.js";

const router = Router();

/* =========================
   🔐 RUTAS GENERALES
   ========================= */

// 🔑 Cambio obligatorio de contraseña (CUALQUIER usuario autenticado)
router.post("/change-password", authRequired, changePassword);

/* =========================
   🔒 RUTAS SOLO ADMIN
   ========================= */

router.use(authRequired);
router.use(requireRole("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/role", updateUserRole);
router.post("/:id/reset-password", resetPassword);

export default router;
