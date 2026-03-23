import { useEffect, useState } from "react";
import API from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const [data, setData] = useState({
    departmentPlacements: [],
    packageDistribution: [],
    placementRate: 0,
    totalStudents: 0,
    placedStudents: 0,
  });

  useEffect(() => {
    API.get("/admin-management/reports").then((res) => {
      setData(res.data);
    });
  }, []);

  const pieData = [
    { name: "Placed", value: data.placedStudents },
    { name: "Not Placed", value: data.totalStudents - data.placedStudents },
  ];

  return (
    <div>
      <h2>Reports</h2>
      <p>Placement Rate: {data.placementRate.toFixed(2)}%</p>

      <div style={{ width: "100%", height: 300, marginBottom: "40px" }}>
        <h3>Department-wise Placements</h3>
        <ResponsiveContainer>
          <BarChart data={data.departmentPlacements}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="placed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 300, marginBottom: "40px" }}>
        <h3>Package Distribution</h3>
        <ResponsiveContainer>
          <BarChart data={data.packageDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <h3>Placement Ratio</h3>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}