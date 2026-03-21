import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "faculty", "hod"],
      required: true
    },
    name: { type: String, trim: true },
    rollNo: { type: String, trim: true, uppercase: true },
    employeeId: { type: String, trim: true, uppercase: true },
    email: { type: String, trim: true, lowercase: true },
    department: { type: String, required: true, trim: true },
    classYear: { type: String, trim: true },
    batch: { type: String, enum: ["N", "P", "Q"] },
    isActive: { type: Boolean, default: true },
    assignedAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedHod: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAdvisorEnrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    assignedHodEnrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    enrolledByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    convertedToUser: { type: Boolean, default: false }
  },
  { timestamps: true }
);

enrollmentSchema.index(
  { role: 1, rollNo: 1 },
  {
    name: "role_rollNo_unique",
    unique: true,
    partialFilterExpression: { rollNo: { $type: "string" } }
  }
);
enrollmentSchema.index(
  { role: 1, employeeId: 1 },
  {
    name: "role_employeeId_unique",
    unique: true,
    partialFilterExpression: { employeeId: { $type: "string" } }
  }
);
enrollmentSchema.index(
  { email: 1 },
  {
    name: "email_unique",
    unique: true,
    partialFilterExpression: { email: { $type: "string" } }
  }
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
