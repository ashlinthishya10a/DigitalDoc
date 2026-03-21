import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "student", "faculty", "hod"],
      required: true
    },
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, trim: true, uppercase: true },
    employeeId: { type: String, trim: true, uppercase: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    department: { type: String, trim: true },
    classYear: { type: String, trim: true },
    batch: { type: String, enum: ["N", "P", "Q"] },
    enrolledByAdmin: { type: Boolean, default: false },
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hodId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    advisorEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    hodEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    signatureImage: { type: String },
    drawnSignatureData: { type: String },
    enrollmentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" }
  },
  { timestamps: true }
);

userSchema.index(
  { rollNo: 1 },
  {
    name: "rollNo_unique",
    unique: true,
    partialFilterExpression: { rollNo: { $type: "string" } }
  }
);
userSchema.index(
  { employeeId: 1 },
  {
    name: "employeeId_unique",
    unique: true,
    partialFilterExpression: { employeeId: { $type: "string" } }
  }
);
userSchema.index(
  { email: 1 },
  {
    name: "user_email_unique",
    unique: true,
    partialFilterExpression: { email: { $type: "string" } }
  }
);

export const User = mongoose.model("User", userSchema);
