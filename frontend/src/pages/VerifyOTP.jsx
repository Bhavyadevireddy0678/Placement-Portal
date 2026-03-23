import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const rollNumberFromState = location.state?.rollNumber || "";

  const [form, setForm] = useState({
    rollNumber: rollNumberFromState,
    otp: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/student/verify-email-otp", form);
      setMessage(res.data.message);
      setTimeout(() => navigate("/student/login"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  const resendOtp = async () => {
    try {
      const res = await API.post("/student/resend-otp", {
        rollNumber: form.rollNumber,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={verifyOtp}>
        <input
          name="rollNumber"
          placeholder="Roll Number"
          value={form.rollNumber}
          onChange={handleChange}
          required
        />
        <input
          name="otp"
          placeholder="Enter OTP"
          value={form.otp}
          onChange={handleChange}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>

      <button onClick={resendOtp}>Resend OTP</button>

      {message && <p>{message}</p>}
    </div>
  );
}