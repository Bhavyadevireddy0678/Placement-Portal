import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        height: "100vh",
        padding: "20px"
      }}>
        <h2>Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/companies">Companies</Link>
          <Link to="/admin/drives">Drives</Link>
          <Link to="/admin/reports">Reports</Link>
        </nav>
      </div>

      {/* PAGE CONTENT */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}