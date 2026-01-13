const API = "http://localhost:3001/api/credits";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getCreditAccount = async (memberId) => {
  const res = await fetch(`${API}/${memberId}`, { headers: headers() });
  return res.json();
};

export const getCreditHistory = async (memberId) => {
  const res = await fetch(`${API}/${memberId}/history`, {
    headers: headers(),
  });
  return res.json();
};

export const registerCreditPayment = async (data) => {
  const res = await fetch(`${API}/payment`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createCreditCharge = async (data) => {
  const res = await fetch(`${API}/charge`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMembersWithDebt = async () => {
  const res = await fetch(`${API}/debtors`, {
    headers: headers(),
  });
  return res.json();
};
