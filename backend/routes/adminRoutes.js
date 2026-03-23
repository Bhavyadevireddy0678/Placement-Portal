const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Application = require("../models/Application");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { adminId, password } = req.body;

    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: "admin",
      admin: {
        _id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin statistics
router.get("/stats", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const selectedCount = await Application.countDocuments({ status: "Selected" });
    const rejectedCount = await Application.countDocuments({ status: "Rejected" });
    const shortlistedCount = await Application.countDocuments({ status: "Shortlisted" });

    const appliedByBranch = await Application.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      { $unwind: "$studentData" },
      {
        $group: {
          _id: "$studentData.branch",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalApplications,
      selectedCount,
      rejectedCount,
      shortlistedCount,
      appliedByBranch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;