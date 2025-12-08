import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Názov knihy je povinný"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Autor je povinný"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN je povinné"],
      unique: true,
      match: [/^(?:\d{10}|\d{13})$/, "Neplatné ISBN (10 alebo 13 číslic)"],
    },
    year: {
      type: Number,
      required: [true, "Rok vydania je povinný"],
      min: [1000, "Rok je príliš starý"],
      max: [
        new Date().getFullYear() + 5,
        "Rok nesmie byť z ďalekej budúcnosti",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Popis môže mať max 2000 znakov"],
    },
    coverImage: { type: String, default: "" },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, "Musí byť aspoň 1 kus"],
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, "Počet dostupných kusov nemôže byť záporný"],
    },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
