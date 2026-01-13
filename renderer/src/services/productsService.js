const API = "http://localhost:3001/api/products";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getProducts = async () => {
  const res = await fetch(API, { headers: headers() });
  return res.json();
};

export const addStock = async (data) => {
  const res = await fetch(`${API}/stock`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createProduct = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });

  return res.json();
};

export const adjustStock = async (data) => {
  const res = await fetch(`${API}/adjust`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getProductMovements = async (id) => {
  const res = await fetch(`${API}/${id}/movements`, {
    headers: headers(),
  });
  return res.json();
};



