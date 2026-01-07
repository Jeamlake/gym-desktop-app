const API_URL = "http://localhost:3001/api/memberships";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getMemberships = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al listar membresías");

  return data;
};

export const createMembership = async (payload) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear membresía");

  return data;
};

export const renewMembership = async (payload) => {
  const res = await fetch(`${API_URL}/renew`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al renovar membresía");

  return data;
};

export const getMembershipHistory = async (memberId) => {
  const res = await fetch(`${API_URL}/history/${memberId}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener historial");

  return data;
};

