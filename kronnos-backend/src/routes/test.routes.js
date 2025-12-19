import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/admin", authRequired, requireRole("ADMIN"), (req, res) => {
  res.json({
    message: "Acceso ADMIN concedido",
    user: req.user,
  });
});

export default router;
