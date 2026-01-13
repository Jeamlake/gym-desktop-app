const API_URL = "http://localhost:3001/api/attendance";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* 📡 Scan */
export const scanAttendance = async (member_id) => {
  const res = await fetch(`${API_URL}/scan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ member_id }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message); 
  return data;
};

/* 🖱️ Manual */
export const markAttendanceManual = async ({ member_id, date }) => {
  const res = await fetch(`${API_URL}/manual`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ member_id, date }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/* 📊 Historial */
export const getAttendanceByMember = async (memberId) => {
  const res = await fetch(`${API_URL}/member/${memberId}`, {
    headers: headers(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
