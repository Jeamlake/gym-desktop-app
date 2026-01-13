import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import usersRoutes from "./routes/users.routes.js";
import promotionsRoutes from "./routes/promotions.routes.js";
import membershipsRoutes from "./routes/memberships.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import membersRoutes from "./routes/members.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import productsRoutes from "./routes/products.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import creditRoutes from "./routes/credit.routes.js";
import { updateExpiredMemberships } from "./jobs/membershipStatus.job.js";

const app = express();

app.use(cors());
app.use(express.json());

updateExpiredMemberships(); // Actualiza el estado de las membresías vencidas al iniciar la aplicación

setInterval(updateExpiredMemberships, 1000 * 60 * 60 * 24); // Programa la actualización diaria de membresías vencidas

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/memberships", membershipsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/credits", creditRoutes);

export default app;
