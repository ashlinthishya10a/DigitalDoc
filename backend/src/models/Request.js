import mongoose from "mongoose";

const signatureBoxSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, default: 180 },
    height: { type: Number, default: 80 },
    page: { type: Number, default: 1 },
    previewWidth: { type: Number },
    previewHeight: { type: Number }
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hodId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["leave_letter", "permission_letter", "department_letter", "other"],
      required: true
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    documentUrl: { type: String },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_faculty_review",
        "rejected_by_faculty",
        "faculty_approved",
        "under_hod_review",
        "rejected_by_hod",
        "cancelled_by_student",
        "completed"
      ],
      default: "submitted"
    },
    facultySignatureBox: { type: signatureBoxSchema, required: true },
    hodSignatureBox: { type: signatureBoxSchema, required: true },
    facultyRemarks: { type: String, trim: true },
    hodRemarks: { type: String, trim: true },
    finalDocumentBuffer: { type: Buffer },
    finalDocumentMime: { type: String },
    finalDocumentName: { type: String }
  },
  { timestamps: true }
);

export const Request = mongoose.model("Request", requestSchema);
