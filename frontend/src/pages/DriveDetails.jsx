import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function DriveDetails() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const fetchApplicants = async () => {
    try {
      const res = await API.get(`/applications/drive/${id}`);
      setApplications(res.data);
    } catch (err) {
      setMessage("Failed to fetch applicants");
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const updateStatus = async (applicationId, status) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status });
      setMessage(`Status changed to ${status}`);
      fetchApplicants();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div>
      <h2>Drive Applicants</h2>
      {message && <p>{message}</p>}

      {applications.map((app) => (
        <div
          key={app._id}
          style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "12px" }}
        >
          <p><strong>{app.student?.name || "No Name"}</strong></p>
          <p>Roll No: {app.student?.rollNumber}</p>
          <p>Email: {app.student?.email}</p>
          <p>Branch: {app.student?.branch}</p>
          <p>Current Status: {app.status}</p>

          <button onClick={() => updateStatus(app._id, "Shortlisted")}>Shortlist</button>
          <button onClick={() => updateStatus(app._id, "Selected")}>Select</button>
          <button onClick={() => updateStatus(app._id, "Rejected")}>Reject</button>
        </div>
      ))}
    </div>
  );
}