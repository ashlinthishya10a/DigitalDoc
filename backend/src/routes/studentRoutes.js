import { Router } from "express";
import { cancelRequest, getMyRequests, getRequestLogs, getStudentDashboard, submitRequest } from "../controllers/studentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, authorize("student"));
router.get("/dashboard", asyncHandler(getStudentDashboard));
router.get("/requests", asyncHandler(getMyRequests));
router.get("/requests/:requestId/logs", asyncHandler(getRequestLogs));
router.patch("/requests/:requestId/cancel", asyncHandler(cancelRequest));
router.post("/requests", upload.single("document"), asyncHandler(submitRequest));

export default router;
