import "dotenv/config";
import { connectDatabase } from "../config/db.js";
import { Enrollment } from "../models/Enrollment.js";
import { Request } from "../models/Request.js";
import { buildFinalDocumentPdf } from "../services/pdfService.js";
import { StatusLog } from "../models/StatusLog.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/auth.js";

const facultySignature =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='120'><rect width='100%' height='100%' fill='white'/><text x='18' y='78' font-size='36' fill='%230f4c81' font-family='Georgia, serif'>Dr. Meena</text></svg>";
const hodSignature =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='120'><rect width='100%' height='100%' fill='white'/><text x='18' y='78' font-size='36' fill='%230b3b2e' font-family='Georgia, serif'>Prof. Kumar</text></svg>";

const upsertUser = async (filter, payload) => {
  const existing = await User.findOne(filter);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return User.create(payload);
};

const upsertEnrollment = async (filter, payload) => {
  const existing = await Enrollment.findOne(filter);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return Enrollment.create(payload);
};

const createLog = async (requestId, changedBy, role, status, remarks) => {
  const exists = await StatusLog.findOne({ requestId, status, remarks });
  if (!exists) {
    await StatusLog.create({ requestId, changedBy, role, status, remarks });
  }
};

const run = async () => {
  await connectDatabase();

  const admin = await upsertUser(
    { role: "admin", employeeId: "ADMIN001" },
    {
      role: "admin",
      name: "System Admin",
      employeeId: "ADMIN001",
      email: "admin@digitalflow.edu",
      password: await hashPassword("Admin@123"),
      department: "Administration",
      enrolledByAdmin: true
    }
  );

  const facultyEnrollment = await upsertEnrollment(
    { role: "faculty", employeeId: "FAC1001" },
    {
      role: "faculty",
      name: "Dr. Meena Raj",
      employeeId: "FAC1001",
      email: "meena.raj@digitalflow.edu",
      department: "Computer Science",
      enrolledByAdmin: admin._id,
      convertedToUser: true
    }
  );

  const hodEnrollment = await upsertEnrollment(
    { role: "hod", employeeId: "HOD2001" },
    {
      role: "hod",
      name: "Prof. Arjun Kumar",
      employeeId: "HOD2001",
      email: "arjun.kumar@digitalflow.edu",
      department: "Computer Science",
      enrolledByAdmin: admin._id,
      convertedToUser: true
    }
  );

  const faculty = await upsertUser(
    { role: "faculty", employeeId: "FAC1001" },
    {
      role: "faculty",
      name: "Dr. Meena Raj",
      employeeId: "FAC1001",
      email: "meena.raj@digitalflow.edu",
      password: await hashPassword("Faculty@123"),
      department: "Computer Science",
      enrolledByAdmin: true,
      enrollmentRef: facultyEnrollment._id,
      signatureImage: facultySignature
    }
  );

  const hod = await upsertUser(
    { role: "hod", employeeId: "HOD2001" },
    {
      role: "hod",
      name: "Prof. Arjun Kumar",
      employeeId: "HOD2001",
      email: "arjun.kumar@digitalflow.edu",
      password: await hashPassword("Hod@123"),
      department: "Computer Science",
      enrolledByAdmin: true,
      enrollmentRef: hodEnrollment._id,
      signatureImage: hodSignature
    }
  );

  const studentOneEnrollment = await upsertEnrollment(
    { role: "student", rollNo: "23CSE001" },
    {
      role: "student",
      name: "Ananya S",
      rollNo: "23CSE001",
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "N",
      assignedAdvisor: faculty._id,
      assignedHod: hod._id,
      enrolledByAdmin: admin._id,
      convertedToUser: true
    }
  );

  const studentTwoEnrollment = await upsertEnrollment(
    { role: "student", rollNo: "23CSE002" },
    {
      role: "student",
      name: "Rahul K",
      rollNo: "23CSE002",
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "P",
      assignedAdvisor: faculty._id,
      assignedHod: hod._id,
      enrolledByAdmin: admin._id,
      convertedToUser: true
    }
  );

  const studentThreeEnrollment = await upsertEnrollment(
    { role: "student", rollNo: "23CSE003" },
    {
      role: "student",
      name: "Nivetha P",
      rollNo: "23CSE003",
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "Q",
      assignedAdvisor: faculty._id,
      assignedHod: hod._id,
      enrolledByAdmin: admin._id,
      convertedToUser: true
    }
  );

  const studentOne = await upsertUser(
    { role: "student", rollNo: "23CSE001" },
    {
      role: "student",
      name: "Ananya S",
      rollNo: "23CSE001",
      password: await hashPassword("Student@123"),
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "N",
      enrolledByAdmin: true,
      advisorId: faculty._id,
      hodId: hod._id,
      enrollmentRef: studentOneEnrollment._id
    }
  );

  const studentTwo = await upsertUser(
    { role: "student", rollNo: "23CSE002" },
    {
      role: "student",
      name: "Rahul K",
      rollNo: "23CSE002",
      password: await hashPassword("Student@123"),
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "P",
      enrolledByAdmin: true,
      advisorId: faculty._id,
      hodId: hod._id,
      enrollmentRef: studentTwoEnrollment._id
    }
  );

  const studentThree = await upsertUser(
    { role: "student", rollNo: "23CSE003" },
    {
      role: "student",
      name: "Nivetha P",
      rollNo: "23CSE003",
      password: await hashPassword("Student@123"),
      department: "Computer Science",
      classYear: "III CSE A",
      batch: "Q",
      enrolledByAdmin: true,
      advisorId: faculty._id,
      hodId: hod._id,
      enrollmentRef: studentThreeEnrollment._id
    }
  );

  const completedRequest =
    (await Request.findOne({ title: "Leave Request - Symposium Participation", studentId: studentOne._id })) ||
    (await Request.create({
      studentId: studentOne._id,
      facultyId: faculty._id,
      hodId: hod._id,
      type: "leave_letter",
      title: "Leave Request - Symposium Participation",
      content:
        "Respected Sir/Madam,\n\nI request leave permission on March 25, 2026 to participate in the inter-college symposium.\n\nThank you.",
      status: "completed",
      facultySignatureBox: { x: 90, y: 360, width: 180, height: 80, page: 1 },
      hodSignatureBox: { x: 360, y: 360, width: 180, height: 80, page: 1 },
      finalDocumentName: "Leave_Request_Symposium_signed.pdf",
      finalDocumentMime: "application/pdf"
    }));

  completedRequest.finalDocumentBuffer = await buildFinalDocumentPdf({
    request: completedRequest,
    student: studentOne,
    faculty,
    hod,
    facultySignature,
    hodSignature
  });
  await completedRequest.save();

  const facultyPending =
    (await Request.findOne({ title: "Permission Letter - Library Research", studentId: studentTwo._id })) ||
    (await Request.create({
      studentId: studentTwo._id,
      facultyId: faculty._id,
      hodId: hod._id,
      type: "permission_letter",
      title: "Permission Letter - Library Research",
      content:
        "I request permission to use the university research library during external project hours on March 27, 2026.",
      status: "under_faculty_review",
      facultySignatureBox: { x: 110, y: 330, width: 180, height: 80, page: 1 },
      hodSignatureBox: { x: 380, y: 330, width: 180, height: 80, page: 1 }
    }));

  const hodPending =
    (await Request.findOne({ title: "Department Letter - Industrial Visit", studentId: studentThree._id })) ||
    (await Request.create({
      studentId: studentThree._id,
      facultyId: faculty._id,
      hodId: hod._id,
      type: "department_letter",
      title: "Department Letter - Industrial Visit",
      content:
        "Requesting department approval for industrial visit participation and attendance consideration on March 29, 2026.",
      status: "under_hod_review",
      facultySignatureBox: { x: 120, y: 340, width: 180, height: 80, page: 1 },
      hodSignatureBox: { x: 390, y: 340, width: 180, height: 80, page: 1 },
      facultyRemarks: "Recommended for approval."
    }));

  await createLog(completedRequest._id, studentOne._id, "student", "under_faculty_review", "Request submitted by student.");
  await createLog(completedRequest._id, faculty._id, "faculty", "under_hod_review", "Approved by faculty.");
  await createLog(completedRequest._id, hod._id, "hod", "completed", "Approved and signed by HOD.");

  await createLog(facultyPending._id, studentTwo._id, "student", "under_faculty_review", "Request submitted by student.");

  await createLog(hodPending._id, studentThree._id, "student", "under_faculty_review", "Request submitted by student.");
  await createLog(hodPending._id, faculty._id, "faculty", "under_hod_review", "Approved by faculty and forwarded to HOD.");

  console.log("Demo data ready.");
  console.log("Admin   -> admin@digitalflow.edu / Admin@123");
  console.log("Faculty -> FAC1001 / Faculty@123");
  console.log("HOD     -> HOD2001 / Hod@123");
  console.log("Student -> 23CSE001 / Student@123");
  console.log("Student -> 23CSE002 / Student@123");
  console.log("Student -> 23CSE003 / Student@123");
  process.exit(0);
};

run();
