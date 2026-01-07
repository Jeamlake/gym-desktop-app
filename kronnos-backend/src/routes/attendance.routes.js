import { Router } from "express";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";
import {registerAttendance, getAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.use(authRequired);

router.get("/", requireAnyRole(["ADMIN", "RECEPCION"]), getAttendance);

router.post("/", requireAnyRole(["ADMIN", "RECEPCION"]), registerAttendance);

export default router;
