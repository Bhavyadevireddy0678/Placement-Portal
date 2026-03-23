const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

/* =========================
   STUDENTS
========================= */

// get all students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add student
router.post("/students", async (req, res) => {
  try {
    const {
      rollNumber,
      password,
      name,
      branch,
      cgpa,
      backlogs,
      year,
      skills,
      workExperience,
    } = req.body;

    const existing = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parsedSkills =
      typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(skills)
        ? skills
        : [];

    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      password: hashedPassword,
      name,
      branch,
      cgpa: Number(cgpa),
      backlogs: Number(backlogs),
      year: Number(year),
      skills: parsedSkills,
      workExperience,
      profileCompleted: true,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete student
router.delete("/students/:id", async (req, res) => {
  try {
    await Application.deleteMany({ student: req.params.id });
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   COMPANIES
========================= */

// get companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await Drive.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add company entry
router.post("/companies", async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, role, package, eligibility } = req.body;

    const company = await Company.create({
      companyName,
      contactPerson,
      email,
      phone,
      role,
      package,
      eligibility,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete company
router.delete("/companies/:id", async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   REPORTS
========================= */

router.get("/reports", async (req, res) => {
  try {
    const departmentPlacements = await Student.aggregate([
      {
        $group: {
          _id: "$branch",
          total: { $sum: 1 },
          placed: {
            $sum: {
              $cond: [{ $eq: ["$placementStatus", "Placed"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const packageDistribution = await Application.aggregate([
      { $match: { status: "Selected" } },
      {
        $lookup: {
          from: "drives",
          localField: "drive",
          foreignField: "_id",
          as: "driveData",
        },
      },
      { $unwind: "$driveData" },
      {
        $group: {
          _id: "$driveData.package",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: "Placed" });

    const placementRate = totalStudents === 0 ? 0 : (placedStudents / totalStudents) * 100;

    res.json({
      departmentPlacements,
      packageDistribution,
      placementRate,
      totalStudents,
      placedStudents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// get all students with their applications
router.get("/students-with-applications", async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const applications = await Application.find()
      .populate("student", "_id")
      .populate("drive", "companyName role package")
      .sort({ createdAt: -1 })
      .lean();

    const studentMap = {};

    students.forEach((student) => {
      studentMap[String(student._id)] = {
        ...student,
        applications: [],
      };
    });

    applications.forEach((app) => {
      const studentId = String(app.student?._id || app.student);
      if (studentMap[studentId]) {
        studentMap[studentId].applications.push(app);
      }
    });

    res.json(Object.values(studentMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;