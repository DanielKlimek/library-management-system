import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  returnLoan,
  extendLoan,
  getUserLoans,
  getBookLoans,
  getLoanStats,
  deleteLoan,
} from "../controllers/loanController.js";

const router = express.Router();

router.get("/", protect, getLoans);
router.get("/stats", protect, admin, getLoanStats);
router.get("/:id", protect, getLoan);
router.post("/", protect, createLoan);
router.put("/:id", protect, admin, updateLoan);
router.delete("/:id", protect, admin, deleteLoan);

router.post("/:id/return", protect, admin, returnLoan);
router.post("/:id/extend", protect, admin, extendLoan);

router.get("/user/:userId", protect, getUserLoans);
router.get("/book/:bookId", protect, getBookLoans);

export default router;
