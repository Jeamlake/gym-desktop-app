import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import app from "./src/app.js";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API KRONNOS corriendo en http://localhost:${PORT}`);
});
