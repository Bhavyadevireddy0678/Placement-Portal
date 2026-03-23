import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adminId: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/admin/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/admin/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          name="adminId"
          placeholder="Admin ID"
          value={form.adminId}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      <p>Default admin: <strong>admin01</strong> / <strong>admin123</strong></p>
      {message && <p className="message">{message}</p>}
    </div>
  );
}