import { useEffect, useState } from "react";
import API from "../api/api";

export default function StudentDrives() {
  const [drives, setDrives] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDrives = async () => {
    try {
      const res = await API.get("/student/eligible-drives");
      setDrives(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch eligible drives");
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const applyToDrive = async (driveId) => {
    try {
      const res = await API.post("/applications", { driveId });
      setMessage(res.data.message);
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Eligible Drives</h2>

      {message && <p>{message}</p>}

      {drives.length === 0 ? (
        <p>No eligible drives available.</p>
      ) : (
        drives.map((d) => (
          <div
            key={d._id}
            style={{
              border: "1px solid #ddd",
              padding: "14px",
              marginBottom: "14px",
              borderRadius: "8px",
            }}
          >
            <h3>{d.companyName}</h3>
            <p>Role: {d.role}</p>
            <p>Package: {d.package}</p>
            <p>Description: {d.description || "No description provided"}</p>
            <p>Min CGPA: {d.minCGPA}</p>
            <p>Max Backlogs: {d.maxBacklogs}</p>
            <p>
              Allowed Branches: {d.allowedBranches?.length ? d.allowedBranches.join(", ") : "All"}
            </p>
            <p>
              Required Skills: {d.requiredSkills?.length ? d.requiredSkills.join(", ") : "None"}
            </p>

            <button onClick={() => applyToDrive(d._id)} disabled={d.hasApplied}>
              {d.hasApplied ? "Already Applied" : "Apply"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}