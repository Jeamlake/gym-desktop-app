import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import {
  getPromotions,
  createPromotion,
  togglePromotion,
} from "../controllers/promotions.controller.js";

const router = Router();

// 🔒 Solo ADMIN
router.use(authRequired);
router.use(requireRole("ADMIN"));

router.get("/", getPromotions);
router.post("/", createPromotion);
router.patch("/:id/toggle", togglePromotion);

export default router;
