const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Student signup
router.post("/signup", async (req, res) => {
  try {
    const { rollNumber, password, email } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Roll number and password are required" });
    }

    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      password: hashedPassword,
      email: email ? email.toLowerCase() : "",
      emailVerified: true,
    });

    res.status(201).json({
      message: "Student account created successfully",
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student login
router.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: "student",
      student: {
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        branch: student.branch,
        profileCompleted: student.profileCompleted,
        placementStatus: student.placementStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current student
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password -otpCode -otpExpires");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete / update profile
router.put("/profile", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { name, branch, cgpa, backlogs, year, skills, workExperience } = req.body;

    const parsedSkills =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : [];

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        cgpa: Number(cgpa) || 0,
        backlogs: Number(backlogs) || 0,
        year: Number(year) || 0,
        skills: parsedSkills,
        workExperience,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password -otpCode -otpExpires");

    res.json({
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get eligible drives
router.get("/eligible-drives", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.profileCompleted) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    const [drives, applications] = await Promise.all([
      Drive.find().sort({ createdAt: -1 }),
      Application.find({ student: req.user.id }).select("drive"),
    ]);

    const appliedDriveIds = new Set(applications.map((app) => String(app.drive)));
    const studentBranch = (student.branch || "").trim().toLowerCase();
    const studentSkills = (student.skills || []).map((s) => String(s).trim().toLowerCase());

    const eligibleDrives = drives
      .filter((drive) => {
        const cgpaOk = Number(student.cgpa || 0) >= Number(drive.minCGPA || 0);
        const backlogOk = Number(student.backlogs || 0) <= Number(drive.maxBacklogs ?? 99);

        const allowedBranches = Array.isArray(drive.allowedBranches)
          ? drive.allowedBranches.map((b) => String(b).trim().toLowerCase()).filter(Boolean)
          : [];
        const branchOk = allowedBranches.length === 0 || allowedBranches.includes(studentBranch);

        const requiredSkills = Array.isArray(drive.requiredSkills)
          ? drive.requiredSkills.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
          : [];
        const skillsOk = requiredSkills.length === 0 || requiredSkills.some((skill) => studentSkills.includes(skill));

        return cgpaOk && backlogOk && branchOk && skillsOk;
      })
      .map((drive) => ({
        ...drive.toObject(),
        hasApplied: appliedDriveIds.has(String(drive._id)),
      }));

    res.json(eligibleDrives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;