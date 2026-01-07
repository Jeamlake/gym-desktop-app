import { Router } from "express";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";
import {
  createPayment,
  getPayments,
  getAvailablePayments,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(authRequired);

// ADMIN y RECEPCION
router.get("/", requireAnyRole(["ADMIN", "RECEPCION"]), getPayments);
router.post("/", requireAnyRole(["ADMIN", "RECEPCION"]), createPayment);

// 🔹 NUEVO: pagos disponibles por socio
router.get(
  "/available",
  requireAnyRole(["ADMIN", "RECEPCION"]),
  getAvailablePayments
);

export default router;
