import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      enum: [
        "Fiction",
        "Non-Fiction",
        "Science",
        "Biography",
        "History",
        "Fantasy",
        "Mystery",
        "Romance",
        "Technology",
      ],
    },
    year: {
      type: Number,
      required: [true, "Publication year is required"],
      min: [1000, "Year must be after 1000"],
      max: [new Date().getFullYear(), `Year cannot be in the future`],
    },
    pages: {
      type: Number,
      required: [true, "Number of pages is required"],
      min: [1, "Book must have at least 1 page"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    availableCopies: {
      type: Number,
      required: [true, "Available copies is required"],
      min: [0, "Available copies cannot be negative"],
      default: 1,
    },
    totalCopies: {
      type: Number,
      required: [true, "Total copies is required"],
      min: [1, "Total copies must be at least 1"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const book = mongoose.model("Book", bookSchema);
export default book;
