import path from "path";
import { Request } from "../models/Request.js";
import { StatusLog } from "../models/StatusLog.js";
import { createStatusLog } from "../services/statusLogService.js";

export const submitRequest = async (req, res) => {
  if (!req.user.advisorId || !req.user.hodId) {
    return res.status(400).json({ message: "Admin must assign your advisor and HOD before you can submit requests." });
  }

  const documentUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : undefined;
  const request = await Request.create({
    studentId: req.user._id,
    facultyId: req.user.advisorId,
    hodId: req.user.hodId,
    type: req.body.type,
    title: req.body.title,
    content: req.body.content,
    documentUrl,
    status: "under_faculty_review",
    facultySignatureBox: JSON.parse(req.body.facultySignatureBox),
    hodSignatureBox: JSON.parse(req.body.hodSignatureBox)
  });

  await createStatusLog({
    requestId: request._id,
    changedBy: req.user._id,
    role: "student",
    status: "under_faculty_review",
    remarks: "Request submitted by student."
  });

  res.status(201).json(request);
};

export const getStudentDashboard = async (req, res) => {
  const requests = await Request.find({ studentId: req.user._id }).select("-finalDocumentBuffer").sort({ createdAt: -1 });
  const counts = requests.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  res.json({ counts, requests });
};

export const getMyRequests = async (req, res) => {
  const requests = await Request.find({ studentId: req.user._id })
    .select("-finalDocumentBuffer")
    .populate("facultyId", "name email")
    .populate("hodId", "name email")
    .sort({ createdAt: -1 });
  res.json(requests);
};

export const getRequestLogs = async (req, res) => {
  const request = await Request.findOne({ _id: req.params.requestId, studentId: req.user._id }).select("_id");
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  const logs = await StatusLog.find({ requestId: req.params.requestId }).sort({ createdAt: 1 });
  res.json(logs);
};

export const cancelRequest = async (req, res) => {
  const request = await Request.findOne({ _id: req.params.requestId, studentId: req.user._id });
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  if (request.status !== "under_faculty_review") {
    return res.status(400).json({ message: "Only requests still under faculty review can be cancelled." });
  }

  request.status = "cancelled_by_student";
  await request.save();

  await createStatusLog({
    requestId: request._id,
    changedBy: req.user._id,
    role: "student",
    status: "cancelled_by_student",
    remarks: "Request cancelled by student."
  });

  res.json(request);
};
