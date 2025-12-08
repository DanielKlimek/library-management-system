import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/book/:bookId", getBookReviews);
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
