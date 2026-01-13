import { Router } from "express";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";
import {
  scanAttendance,
  markAttendanceManual,
  getAttendanceByMember,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(authRequired);

/* QR */
router.post("/scan", requireAnyRole(["ADMIN", "RECEPCION"]), scanAttendance);

/* Manual */
router.post(
  "/manual",
  requireAnyRole(["ADMIN", "RECEPCION"]),
  markAttendanceManual
);

/* Historial */
router.get(
  "/member/:memberId",
  requireAnyRole(["ADMIN", "RECEPCION"]),
  getAttendanceByMember
);

export default router;
