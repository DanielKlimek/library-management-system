import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book is required"],
    },
    borrowDate: {
      type: Date,
      default: Date.now,
      required: [true, "Borrow date is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "returned", "overdue", "extended"],
      default: "active",
    },
    isExtended: {
      type: Boolean,
      default: false,
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, "Fine cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

borrowSchema.index({ user: 1, book: 1, status: 1 });

const borrow = mongoose.model("Borrow", borrowSchema);
export default borrow;
