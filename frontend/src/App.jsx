import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import RoleSelect from "./pages/RoleSelect";
import StudentSignup from "./pages/StudentSignup";
import StudentLogin from "./pages/StudentLogin";
import VerifyOTP from "./pages/VerifyOTP";
import StudentProfile from "./pages/StudentProfile";
import StudentDashboard from "./pages/StudentDashboard";
import AdminLogin from "./pages/AdminLogin";

import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Companies from "./pages/Companies";
import Drives from "./pages/Drives";
import DriveDetails from "./pages/DriveDetails";
import Reports from "./pages/Reports";
import StudentDrives from "./pages/StudentDrives";

import ChatBot from "./components/ChatBot"; // ✅ ADD THIS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/role" element={<RoleSelect />} />

        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/student/verify-otp" element={<VerifyOTP />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/drives" element={<StudentDrives />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="companies" element={<Companies />} />
          <Route path="drives" element={<Drives />} />
          <Route path="drives/:id" element={<DriveDetails />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ THIS IS THE IMPORTANT PART */}
      <ChatBot />

    </BrowserRouter>
  );
}

export default App;
