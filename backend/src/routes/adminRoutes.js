import { Router } from "express";
import {
  assignStudentWorkflow,
  bootstrapAdmin,
  enrollUser,
  getAdminDashboard,
  listEnrollments,
  removeEnrollmentOrUser
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/bootstrap", asyncHandler(bootstrapAdmin));
router.use(authenticate, authorize("admin"));
router.get("/dashboard", asyncHandler(getAdminDashboard));
router.get("/enrollments", asyncHandler(listEnrollments));
router.post("/enroll", asyncHandler(enrollUser));
router.post("/assign", asyncHandler(assignStudentWorkflow));
router.delete("/enrollments/:enrollmentId", asyncHandler(removeEnrollmentOrUser));

export default router;
