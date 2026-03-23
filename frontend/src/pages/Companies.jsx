import { useEffect, useState } from "react";
import API from "../api/api";

export default function Companies() {
  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async () => {
    const res = await API.get("/admin-management/companies");
    setCompanies(res.data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div>
      <h2>Companies</h2>

      {companies.map((c) => (
        <div key={c._id} style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "10px" }}>
          <p><strong>{c.companyName}</strong></p>
          <p>Role: {c.role}</p>
          <p>Package: {c.package}</p>
          <p>
            Skills Required:{" "}
            {Array.isArray(c.requiredSkills) ? c.requiredSkills.join(", ") : ""}
          </p>
          <p>Description: {c.description || "No description"}</p>
        </div>
      ))}
    </div>
  );
}