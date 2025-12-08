import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../config/multer.js";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBook);
router.post("/", protect, admin, upload.single("coverImage"), createBook);
router.put("/:id", protect, admin, upload.single("coverImage"), updateBook);
router.delete("/:id", protect, admin, deleteBook);

export default router;
