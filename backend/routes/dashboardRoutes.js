const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Company = require("../models/Company");
const Drive = require("../models/Drive");
const Application = require("../models/Application");

// GET Dashboard Stats
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({
      placementStatus: "Placed",
    });

    const totalCompanies = await Company.countDocuments();

    const activeDrives = await Drive.countDocuments({
      status: "Active",
    });

    const upcomingDrives = await Drive.find({
      driveDate: { $gte: new Date() },
    }).sort({ driveDate: 1 }).limit(5);

    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student drive");

    res.json({
      totalStudents,
      placedStudents,
      totalCompanies,
      activeDrives,
      upcomingDrives,
      recentApplications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;