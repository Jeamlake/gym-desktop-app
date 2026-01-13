import { Router } from "express";
import { createSale } from "../controllers/sales.controller.js";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authRequired,
  requireAnyRole(["ADMIN", "RECEPCION"]),
  createSale
);

export default router;
