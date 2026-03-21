import { Enrollment } from "../models/Enrollment.js";
import { Request } from "../models/Request.js";
import { StatusLog } from "../models/StatusLog.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/auth.js";

const buildEnrollmentPayload = async () => {
  const [enrollments, advisors, hods] = await Promise.all([
    Enrollment.find().sort({ createdAt: -1 }),
    Enrollment.find({ role: "faculty", isActive: true }).sort({ createdAt: -1 }).select("name employeeId department email convertedToUser"),
    Enrollment.find({ role: "hod", isActive: true }).sort({ createdAt: -1 }).select("name employeeId department email convertedToUser")
  ]);

  return { enrollments, advisors, hods };
};

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const enrollUser = async (req, res) => {
  const payload = cleanPayload({
    role: req.body.role,
    name: req.body.name,
    department: req.body.department,
    classYear: req.body.role === "student" ? req.body.classYear : undefined,
    batch: req.body.role === "student" ? req.body.batch : undefined,
    rollNo: req.body.role === "student" ? req.body.rollNo?.toUpperCase() : undefined,
    employeeId: req.body.role !== "student" ? req.body.employeeId?.toUpperCase() : undefined,
    email: req.body.role !== "student" ? req.body.email?.toLowerCase() : undefined,
    enrolledByAdmin: req.user._id
  });

  const enrollment = await Enrollment.create(payload);
  const lists = await buildEnrollmentPayload();
  res.status(201).json({ enrollment, ...lists });
};

export const assignStudentWorkflow = async (req, res) => {
  const { enrollmentId, advisorEnrollmentId, hodEnrollmentId } = req.body;
  const enrollment = await Enrollment.findById(enrollmentId);

  if (!enrollment || enrollment.role !== "student") {
    return res.status(404).json({ message: "Student enrollment not found." });
  }

  const [advisorUser, hodUser] = await Promise.all([
    User.findOne({ enrollmentRef: advisorEnrollmentId }),
    User.findOne({ enrollmentRef: hodEnrollmentId })
  ]);

  enrollment.assignedAdvisorEnrollment = advisorEnrollmentId;
  enrollment.assignedHodEnrollment = hodEnrollmentId;
  enrollment.assignedAdvisor = advisorUser?._id;
  enrollment.assignedHod = hodUser?._id;
  await enrollment.save();

  await User.updateOne(
    { enrollmentRef: enrollmentId },
    {
      advisorEnrollmentId,
      hodEnrollmentId,
      advisorId: advisorUser?._id,
      hodId: hodUser?._id
    }
  );

  res.json(enrollment);
};

export const getAdminDashboard = async (_req, res) => {
  const [students, faculty, hods, requests, completed] = await Promise.all([
    Enrollment.countDocuments({ role: "student" }),
    Enrollment.countDocuments({ role: "faculty" }),
    Enrollment.countDocuments({ role: "hod" }),
    Request.countDocuments(),
    Request.countDocuments({ status: "completed" })
  ]);

  res.json({
    summary: { students, faculty, hods, requests, completed }
  });
};

export const listEnrollments = async (_req, res) => {
  res.json(await buildEnrollmentPayload());
};

export const bootstrapAdmin = async (req, res) => {
  const exists = await User.findOne({ role: "admin" });
  if (exists) {
    return res.status(409).json({ message: "Admin already exists." });
  }

  const admin = await User.create({
    role: "admin",
    name: req.body.name || "System Admin",
    employeeId: (req.body.employeeId || "ADMIN001").toUpperCase(),
    email: (req.body.email || "admin@digitalflow.edu").toLowerCase(),
    password: await hashPassword(req.body.password || "Admin@123"),
    department: req.body.department || "Administration",
    enrolledByAdmin: true
  });

  res.status(201).json(admin);
};

export const removeEnrollmentOrUser = async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found." });
  }

  const user = await User.findOne({ enrollmentRef: enrollment._id });

  if (enrollment.role === "student" && user) {
    const requests = await Request.find({ studentId: user._id }).select("_id");
    const requestIds = requests.map((item) => item._id);
    await StatusLog.deleteMany({ requestId: { $in: requestIds } });
    await Request.deleteMany({ studentId: user._id });
  }

  if ((enrollment.role === "faculty" || enrollment.role === "hod") && user) {
    const requests = await Request.find({
      $or: [{ facultyId: user._id }, { hodId: user._id }]
    }).select("_id");
    const requestIds = requests.map((item) => item._id);
    await StatusLog.deleteMany({ requestId: { $in: requestIds } });
    await Request.deleteMany({
      $or: [{ facultyId: user._id }, { hodId: user._id }]
    });
  }

  if (user) {
    await User.deleteOne({ _id: user._id });
  }

  await Enrollment.deleteOne({ _id: enrollment._id });
  res.json({ message: "Enrollment and linked account removed." });
};
