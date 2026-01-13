import { Router } from "express";
import {
  getProducts,
  createProduct,
  addStock,
  adjustStock,
  getProductMovements
} from "../controllers/products.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, getProducts);
router.post("/", authRequired, requireRole("ADMIN"), createProduct);
router.post("/stock", authRequired, requireRole("ADMIN"), addStock);
router.post("/adjust", authRequired, requireRole("ADMIN"), adjustStock);
router.get("/:id/movements", authRequired, requireRole("ADMIN"), getProductMovements);


export default router;
