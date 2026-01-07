import { Router } from "express";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";
import {
    createMembership,
    getMemberships,
    renewMembership,
    getMembershipsSummary,
    getMembershipHistory,
} from "../controllers/memberships.controller.js";

const router = Router();

// 🔒 Todas requieren autenticación
router.use(authRequired);

// 📄 Listar membresías
router.get("/", requireAnyRole(["ADMIN", "RECEPCION"]), getMemberships);

// ➕ Crear nueva membresía (obliga payment)
router.post("/", requireAnyRole(["ADMIN", "RECEPCION"]), createMembership);

// 🔁 Renovar membresía existente (nuevo pago)
router.post("/renew", requireAnyRole(["ADMIN", "RECEPCION"]), renewMembership);

// Resumen de membresías
router.get("/summary", requireAnyRole(["ADMIN", "RECEPCION"]), getMembershipsSummary);

// Historial de membresías por socio
router.get("/history/:memberId", requireAnyRole(["ADMIN", "RECEPCION"]), getMembershipHistory);

export default router;
