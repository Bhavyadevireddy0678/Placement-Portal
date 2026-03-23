import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    package: "",
    requiredSkills: "",
    description: "",
    minCGPA: "",
    allowedBranches: "",
    maxBacklogs: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchDrives = async () => {
    try {
      const res = await API.get("/drives");
      setDrives(res.data);
    } catch (err) {
      setMessage("Failed to fetch drives");
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createDrive = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/drives", form);
      setForm({
        companyName: "",
        role: "",
        package: "",
        requiredSkills: "",
        description: "",
        minCGPA: "",
        allowedBranches: "",
        maxBacklogs: "",
      });
      setMessage("Drive created successfully");
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create drive");
    }
  };

  const deleteDrive = async (id) => {
    try {
      await API.delete(`/drives/${id}`);
      setMessage("Drive deleted successfully");
      fetchDrives();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete drive");
    }
  };

  return (
    <div>
      <h2>Drives</h2>
      {message && <p>{message}</p>}

      <form onSubmit={createDrive} style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
        <input
          name="companyName"
          placeholder="Company"
          value={form.companyName}
          onChange={handleChange}
          required
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
          required
        />
        <input
          name="package"
          placeholder="Package"
          value={form.package}
          onChange={handleChange}
          required
        />
        <input
          name="requiredSkills"
          placeholder="Skills required comma separated"
          value={form.requiredSkills}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Job description (optional)"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="minCGPA"
          placeholder="Minimum CGPA"
          value={form.minCGPA}
          onChange={handleChange}
        />
        <input
          name="allowedBranches"
          placeholder="Allowed branches comma separated"
          value={form.allowedBranches}
          onChange={handleChange}
        />
        <input
          name="maxBacklogs"
          placeholder="Max backlogs"
          value={form.maxBacklogs}
          onChange={handleChange}
        />
        <button type="submit">Create Drive</button>
      </form>

      {drives.map((d) => (
        <div
          key={d._id}
          style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "12px" }}
        >
          <p><strong>{d.companyName}</strong></p>
          <p>Role: {d.role}</p>
          <p>Package: {d.package}</p>
          <p>
            Skills: {Array.isArray(d.requiredSkills) ? d.requiredSkills.join(", ") : ""}
          </p>
          <p>Description: {d.description || "No description"}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={() => navigate(`/admin/drives/${d._id}`)}>
              View Applicants
            </button>
            <button onClick={() => deleteDrive(d._id)}>
              Delete Drive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}