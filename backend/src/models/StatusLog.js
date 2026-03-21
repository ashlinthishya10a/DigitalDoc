import mongoose from "mongoose";

const statusLogSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "student", "faculty", "hod"], required: true },
    status: { type: String, required: true },
    remarks: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const StatusLog = mongoose.model("StatusLog", statusLogSchema);
