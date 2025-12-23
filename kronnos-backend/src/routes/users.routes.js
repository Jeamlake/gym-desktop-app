import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  resetPassword,
} from "../controllers/users.controller.js";

const router = Router();

// 🔒 Todas estas rutas requieren ADMIN
router.use(authRequired);
router.use(requireRole("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/role", updateUserRole);

// ✅ RESET PASSWORD (YA PROTEGIDA POR router.use arriba)
router.post("/:id/reset-password", resetPassword);

export default router;
