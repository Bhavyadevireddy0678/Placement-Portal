const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: String,
  contactPerson: String,
  email: String,
  phone: String,
  role: String,
  package: Number,
  eligibility: String,
});

module.exports = mongoose.model("Company", companySchema);