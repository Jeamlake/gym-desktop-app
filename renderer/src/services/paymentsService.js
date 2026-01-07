// renderer/src/services/paymentsService.js

const API_URL = "http://localhost:3001/api/payments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🔹 Lista TODOS los pagos (histórico)
export const getPayments = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al listar pagos");
  }

  return data;
};

// 🔹 Crea un pago (NO toca membresías)
export const createPayment = async (payment) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payment),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al registrar pago");
  }

  return data;
};

// 🔹 NUEVO: pagos disponibles (no usados en membresías)
export const getAvailablePayments = async (member_id) => {
  const res = await fetch(`${API_URL}/available?member_id=${member_id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener pagos disponibles");
  }

  return data;
};
