import { Router } from "express";
import {
  downloadFinalDocument,
  facultyReview,
  getFacultyQueue,
  getHodQueue,
  hodReview,
  updateSignatureProfile
} from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/faculty/queue", authorize("faculty"), asyncHandler(getFacultyQueue));
router.patch("/faculty/requests/:requestId", authorize("faculty"), asyncHandler(facultyReview));
router.get("/hod/queue", authorize("hod"), asyncHandler(getHodQueue));
router.patch("/hod/requests/:requestId", authorize("hod"), asyncHandler(hodReview));
router.patch("/signature-profile", authorize("faculty", "hod"), asyncHandler(updateSignatureProfile));
router.get("/requests/:requestId/download", asyncHandler(downloadFinalDocument));

export default router;
