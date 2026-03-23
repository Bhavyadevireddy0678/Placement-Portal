import { useEffect, useState } from "react";
import API from "../api/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    rollNumber: "",
    password: "",
    name: "",
    branch: "",
    cgpa: "",
    backlogs: "",
    year: "",
    skills: "",
    workExperience: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin-management/students-with-applications");
      setStudents(res.data);
    } catch (err) {
      setMessage("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin-management/students", form);
      setForm({
        rollNumber: "",
        password: "",
        name: "",
        branch: "",
        cgpa: "",
        backlogs: "",
        year: "",
        skills: "",
        workExperience: "",
      });
      setMessage("Student added successfully");
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await API.delete(`/admin-management/students/${id}`);
      setMessage("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete student");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status });
      setMessage(`Application marked as ${status}`);
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update application status");
    }
  };

  const statusButtonStyle = (currentStatus, buttonStatus) => ({
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    cursor: "pointer",
    backgroundColor: currentStatus === buttonStatus ? "#dbeafe" : "#f8f8f8",
    fontWeight: currentStatus === buttonStatus ? "bold" : "normal",
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students</h2>

      {message && <p style={{ marginBottom: "16px" }}>{message}</p>}

      <form
        onSubmit={addStudent}
        style={{
          marginBottom: "24px",
          display: "grid",
          gap: "10px",
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "10px",
        }}
      >
        <input
          name="rollNumber"
          placeholder="Roll Number"
          value={form.rollNumber}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="branch"
          placeholder="Department / Branch"
          value={form.branch}
          onChange={handleChange}
        />
        <input
          name="cgpa"
          placeholder="CGPA"
          value={form.cgpa}
          onChange={handleChange}
        />
        <input
          name="backlogs"
          placeholder="Backlogs"
          value={form.backlogs}
          onChange={handleChange}
        />
        <input
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <input
          name="skills"
          placeholder="Skills comma separated"
          value={form.skills}
          onChange={handleChange}
        />
        <input
          name="workExperience"
          placeholder="Work Experience"
          value={form.workExperience}
          onChange={handleChange}
        />
        <button type="submit">Add Student</button>
      </form>

      {students.map((s) => (
        <div
          key={s._id}
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "10px",
          }}
        >
          <p><strong>{s.name || "No Name"}</strong></p>
          <p>Roll No: {s.rollNumber}</p>
          <p>Department: {s.branch}</p>
          <p>CGPA: {s.cgpa}</p>
          <p>Skills: {Array.isArray(s.skills) ? s.skills.join(", ") : ""}</p>
          <p>Status: {s.placementStatus}</p>

          <button onClick={() => deleteStudent(s._id)} style={{ marginBottom: "14px" }}>
            Delete
          </button>

          <div>
            <h4>Applications</h4>

            {!s.applications || s.applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              s.applications.map((app) => (
                <div
                  key={app._id}
                  style={{
                    border: "1px solid #eee",
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    background: "#fafafa",
                  }}
                >
                  <p><strong>{app.drive?.companyName || "Unknown Company"}</strong></p>
                  <p>Role: {app.drive?.role || "N/A"}</p>
                  <p>Package: {app.drive?.package || "N/A"}</p>
                  <p>
                    Application Status: <strong>{app.status}</strong>
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => updateApplicationStatus(app._id, "Shortlisted")}
                      style={statusButtonStyle(app.status, "Shortlisted")}
                    >
                      Shortlisted
                    </button>

                    <button
                      onClick={() => updateApplicationStatus(app._id, "Selected")}
                      style={statusButtonStyle(app.status, "Selected")}
                    >
                      Selected
                    </button>

                    <button
                      onClick={() => updateApplicationStatus(app._id, "Rejected")}
                      style={statusButtonStyle(app.status, "Rejected")}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}