import { Request } from "../models/Request.js";
import { processSignatureDataUrl } from "../services/signatureService.js";
import { User } from "../models/User.js";
import { buildFinalDocumentPdf } from "../services/pdfService.js";
import { createStatusLog } from "../services/statusLogService.js";

const getSignatureData = (user) => user.signatureImage || user.drawnSignatureData;

export const getFacultyQueue = async (req, res) => {
  const requests = await Request.find({
    facultyId: req.user._id,
    status: { $in: ["under_faculty_review", "under_hod_review", "completed"] }
  })
    .select("-finalDocumentBuffer")
    .populate("studentId", "name rollNo department classYear batch")
    .populate("facultyId", "name signatureImage drawnSignatureData")
    .populate("hodId", "name signatureImage drawnSignatureData");
  res.json(requests);
};

export const facultyReview = async (req, res) => {
  const request = await Request.findOne({ _id: req.params.requestId, facultyId: req.user._id });
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  const approved = req.body.action === "approve";
  if (approved && !getSignatureData(req.user)) {
    return res.status(400).json({ message: "Please save your faculty signature before approving and signing the document." });
  }

  request.status = approved ? "under_hod_review" : "rejected_by_faculty";
  request.facultyRemarks = req.body.remarks;
  await request.save();

  await createStatusLog({
    requestId: request._id,
    changedBy: req.user._id,
    role: "faculty",
    status: request.status,
    remarks: req.body.remarks
  });

  res.json(request);
};

export const getHodQueue = async (req, res) => {
  const requests = await Request.find({
    hodId: req.user._id,
    status: { $in: ["under_hod_review", "faculty_approved", "completed"] }
  })
    .select("-finalDocumentBuffer")
    .populate("studentId", "name rollNo department classYear batch")
    .populate("facultyId", "name signatureImage drawnSignatureData")
    .populate("hodId", "name signatureImage drawnSignatureData");

  res.json(requests);
};

export const hodReview = async (req, res) => {
  const request = await Request.findOne({ _id: req.params.requestId, hodId: req.user._id }).populate("studentId");
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  const approved = req.body.action === "approve";
  request.hodRemarks = req.body.remarks;

  if (!approved) {
    request.status = "rejected_by_hod";
    await request.save();
    await createStatusLog({
      requestId: request._id,
      changedBy: req.user._id,
      role: "hod",
      status: "rejected_by_hod",
      remarks: req.body.remarks
    });
    return res.json(request);
  }

  if (!getSignatureData(req.user)) {
    return res.status(400).json({ message: "Please save your HOD signature before approving and signing the document." });
  }

  const faculty = await User.findById(request.facultyId);
  const hod = await User.findById(req.user._id);
  const student = request.studentId;

  request.status = "completed";
  request.finalDocumentName = `${request.title.replace(/\s+/g, "_")}_signed.pdf`;
  request.finalDocumentMime = "application/pdf";
  request.finalDocumentBuffer = await buildFinalDocumentPdf({
    request,
    student,
    faculty,
    hod,
    facultySignature: getSignatureData(faculty),
    hodSignature: getSignatureData(hod)
  });
  await request.save();

  await createStatusLog({
    requestId: request._id,
    changedBy: req.user._id,
    role: "hod",
    status: "completed",
    remarks: req.body.remarks || "Approved and signed by HOD."
  });

  res.json(request);
};

export const updateSignatureProfile = async (req, res) => {
  if (req.body.signatureImage) {
    req.user.signatureImage = await processSignatureDataUrl(req.body.signatureImage);
  }

  if (req.body.drawnSignatureData) {
    req.user.drawnSignatureData = await processSignatureDataUrl(req.body.drawnSignatureData);
  }

  await req.user.save();
  res.json(req.user);
};

export const downloadFinalDocument = async (req, res) => {
  const request = await Request.findById(req.params.requestId);
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  const isStudentOwner = String(request.studentId) === String(req.user._id);
  const isAssignedReviewer = [String(request.facultyId), String(request.hodId)].includes(String(req.user._id));

  if (!isStudentOwner && !isAssignedReviewer && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed to download this document." });
  }

  if (request.status === "completed") {
    const student = await User.findById(request.studentId);
    const faculty = await User.findById(request.facultyId);
    const hod = await User.findById(request.hodId);
    request.finalDocumentName = `${request.title.replace(/\s+/g, "_")}_signed.pdf`;
    request.finalDocumentMime = "application/pdf";
    request.finalDocumentBuffer = await buildFinalDocumentPdf({
      request,
      student,
      faculty,
      hod,
      facultySignature: getSignatureData(faculty),
      hodSignature: getSignatureData(hod)
    });
    await request.save();
  }

  if (!request.finalDocumentBuffer) {
    return res.status(404).json({ message: "Final document not available." });
  }

  res.setHeader("Content-Type", request.finalDocumentMime || "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${request.finalDocumentName}"`);
  res.send(request.finalDocumentBuffer);
};
