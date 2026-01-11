import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Užívateľ je povinný"],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Kniha je povinná"],
    },
    loanDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Dátum vrátenia je povinný"],
      validate: {
        validator: function (value) {
          return value > this.loanDate;
        },
        message: "Dátum vrátenia musí byť po dátume požičania",
      },
    },
    returnDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (value === null) return true;
          return value >= this.loanDate;
        },
        message: "Dátum vrátenia nemôže byť pred dátumom požičania",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "returned", "overdue"],
        message: "Stav musí byť: active, returned alebo overdue",
      },
      default: "active",
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, "Pokuta nemôže byť záporná"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Poznámky môžu mať max 500 znakov"],
      default: null,
    },
  },
  { timestamps: true }
);

loanSchema.index({ user: 1, status: 1 });
loanSchema.index({ book: 1, status: 1 });
loanSchema.index({ dueDate: 1, status: 1 });

loanSchema.pre("save", function (next) {
  if (this.status === "active" && this.dueDate < new Date() && !this.returnDate) {
    this.status = "overdue";
  }
  next();
});

loanSchema.methods.calculateFine = function () {
  if (this.status === "returned" && this.returnDate > this.dueDate) {
    const daysLate = Math.ceil(
      (this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24)
    );
    this.fine = daysLate * 1;
  }
  return this.fine;
};

export default mongoose.model("Loan", loanSchema);
