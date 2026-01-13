import db from "../config/db.js";

export const expireMemberships = async () => {
  try {
    await db.query(`
      UPDATE memberships
      SET estado = 'VENCIDA'
      WHERE fecha_fin < CURDATE()
        AND estado = 'ACTIVA'
    `);

    console.log("Membresías vencidas actualizadas");
  } catch (error) {
    console.error("Error venciendo membresías", error);
  }
};
