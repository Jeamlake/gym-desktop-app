import { Router } from "express";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";
import { getMembers, createMember } from "../controllers/members.controller.js";

const router = Router();

// 🔐 Autenticación obligatoria
router.use(authRequired);

// 🔓 Roles permitidos
router.use(requireAnyRole(["ADMIN", "RECEPCION"]));

// Rutas
router.get("/", getMembers);
router.post("/", createMember);

export default router;
