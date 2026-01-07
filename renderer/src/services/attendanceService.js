// renderer/src/services/attendanceService.js

const API_URL = "http://localhost:3001/api/attendance";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAttendance = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al listar asistencias");
  }

  return data;
};

export const registerAttendance = async ({ member_id, date }) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ member_id, date }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al registrar asistencia");
  }

  return data;
};
