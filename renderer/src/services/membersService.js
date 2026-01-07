const API_URL = "http://localhost:3001/api/members";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getMembers = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener socios");
  }

  return data;
};

export const createMember = async (member) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(member),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al crear socio");
  }

  return data;
};
