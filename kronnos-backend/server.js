import dotenv from "dotenv";
import cron from "node-cron";
dotenv.config({ path: ".env" });

import app from "./src/app.js";
import { expireMemberships } from "./src/jobs/expireMemberships.js";

// Todos los días a las 00:05
cron.schedule("5 0 * * *", expireMemberships);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API KRONNOS corriendo en http://localhost:${PORT}`);
});

