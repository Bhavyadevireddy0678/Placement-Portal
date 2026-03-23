const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const sendMail = require("../utils/sendMail");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Student signup
router.post("/signup", async (req, res) => {
  try {
    const { rollNumber, password, email } = req.body;

    if (!rollNumber || !password || !email) {
      return res.status(400).json({ message: "Roll number, password, and email are required" });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { rollNumber: rollNumber.toUpperCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      otpCode,
      otpExpires,
      emailVerified: false,
    });

    await sendMail(
      student.email,
      "Verify your email - Placement Portal",
      `Your OTP is ${otpCode}. It is valid for 10 minutes.`,
      `<p>Your OTP is <b>${otpCode}</b>.</p><p>It is valid for 10 minutes.</p>`
    );

    res.status(201).json({
      message: "Signup successful. OTP sent to email.",
      rollNumber: student.rollNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { rollNumber, otp } = req.body;

    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.otpCode || !student.otpExpires) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (student.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (student.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    student.emailVerified = true;
    student.otpCode = null;
    student.otpExpires = null;
    await student.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { rollNumber } = req.body;

    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    student.otpCode = otpCode;
    student.otpExpires = otpExpires;
    await student.save();

    await sendMail(
      student.email,
      "Your new OTP - Placement Portal",
      `Your OTP is ${otpCode}. It is valid for 10 minutes.`,
      `<p>Your new OTP is <b>${otpCode}</b>.</p><p>It is valid for 10 minutes.</p>`
    );

    res.json({ message: "OTP resent successfully" });
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

    if (!student.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        rollNumber: student.rollNumber,
      });
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
        email: student.email,
        name: student.name,
        branch: student.branch,
        placementStatus: student.placementStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student profile update
router.put("/profile", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { name, branch, cgpa, backlogs, year, skills, workExperience } = req.body;

    const parsedSkills =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
        ? skills
        : [];

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        cgpa: Number(cgpa),
        backlogs: Number(backlogs),
        year: Number(year),
        skills: parsedSkills,
        workExperience,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password -otpCode -otpExpires");

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current student
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password -otpCode -otpExpires");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;