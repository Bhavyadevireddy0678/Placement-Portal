const express = require("express");
const Drive = require("../models/Drive");
const Student = require("../models/Student");
const { verifyToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// Create drive
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const {
      companyName,
      role,
      package,
      description,
      minCGPA,
      allowedBranches,
      maxBacklogs,
      requiredSkills,
    } = req.body;

    const drive = await Drive.create({
      companyName,
      role,
      package,
      description,
      minCGPA: Number(minCGPA),
      allowedBranches: Array.isArray(allowedBranches)
        ? allowedBranches
        : allowedBranches.split(",").map((b) => b.trim()).filter(Boolean),
      maxBacklogs: Number(maxBacklogs),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
    });

    res.status(201).json({
      message: "Drive created successfully",
      drive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all drives
router.get("/", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    const drives = await Drive.find().sort({ createdAt: -1 });

    const filteredDrives = drives.map((drive) => {
      let isEligible = true;

      if (drive.minCGPA && student.cgpa < drive.minCGPA) {
        isEligible = false;
      }

      if (
        drive.maxBacklogs !== undefined &&
        student.backlogs > drive.maxBacklogs
      ) {
        isEligible = false;
      }

      if (
        drive.allowedBranches &&
        drive.allowedBranches.length > 0 &&
        !drive.allowedBranches.includes(student.branch)
      ) {
        isEligible = false;
      }

      return {
        ...drive.toObject(),
        isEligible,
      };
    });

    res.json(filteredDrives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete drive
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await Drive.findByIdAndDelete(req.params.id);
    res.json({ message: "Drive deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;