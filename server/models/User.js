const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: Schema.Types.ObjectId, ref: "Role" },
    message: { type: String },
    city: { type: String },
    phoneNumber: { type: Number },
    dateOfBirth: { type: Date },
    status: { type: String },
    companyProfile: { type: Schema.Types.ObjectId, ref: "CompanyProfile" },
    cvProfile: { type: Schema.Types.ObjectId, ref: "CVProfile" },
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    packages: [{ type: Schema.Types.ObjectId, ref: "Package" }],
    favouriteJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
