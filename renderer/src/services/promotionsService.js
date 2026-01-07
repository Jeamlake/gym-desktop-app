const API_URL = "http://localhost:3001/api/promotions";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getPromotions = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener promociones");
  }

  return data;
};

export const createPromotion = async (promotion) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(promotion),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al crear promoción");
  }

  return data;
};

export const togglePromotionStatus = async (id, active) => {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ active }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar estado");
  }

  return data;
};
