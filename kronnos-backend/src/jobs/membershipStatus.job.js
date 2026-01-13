import db from "../config/db.js";

export const updateExpiredMemberships = async () => {
  await db.query(`
    UPDATE memberships
    SET estado = 'VENCIDA'
    WHERE fecha_fin < CURDATE()
      AND estado != 'VENCIDA'
  `);

  console.log("✔ Membresías vencidas actualizadas");
};
