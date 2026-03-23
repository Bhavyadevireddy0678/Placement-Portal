import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {/* TOP CARDS */}
      <div style={{ display: "flex", gap: "20px" }}>
        <Card title="Total Students" value={stats.totalStudents} />
        <Card title="Placed Students" value={stats.placedStudents} />
        <Card title="Companies" value={stats.totalCompanies} />
        <Card title="Active Drives" value={stats.activeDrives} />
      </div>

      {/* UPCOMING DRIVES */}
      <h3 style={{ marginTop: "30px" }}>Upcoming Drives</h3>
      {stats.upcomingDrives.map((d) => (
        <div key={d._id}>
          {d.companyName} - {new Date(d.driveDate).toDateString()}
        </div>
      ))}

      {/* RECENT APPLICATIONS */}
      <h3 style={{ marginTop: "30px" }}>Recent Applications</h3>
      {stats.recentApplications.map((app) => (
        <div key={app._id}>
          {app.student?.name} → {app.drive?.companyName} ({app.status})
        </div>
      ))}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h4 style={{ color: "#777" }}>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}