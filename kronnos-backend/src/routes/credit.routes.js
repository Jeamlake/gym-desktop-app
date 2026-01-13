import { Router } from "express";
import {
  getCreditAccount,
  createCreditCharge,
  registerCreditPayment,
    getCreditHistory,
  getMembersWithDebt,
} from "../controllers/credit.controller.js";
import { authRequired, requireAnyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/debtors",
  authRequired,
  requireAnyRole(["ADMIN", "RECEPCION"]),
  getMembersWithDebt
);

router.get("/:memberId", authRequired, getCreditAccount);
router.get("/:memberId/history", authRequired, getCreditHistory);

router.post(
  "/charge",
  authRequired,
  requireAnyRole(["ADMIN", "RECEPCION"]),
  createCreditCharge
);

router.post(
  "/payment",
  authRequired,
  requireAnyRole(["ADMIN", "RECEPCION"]),
  registerCreditPayment
);



export default router;
