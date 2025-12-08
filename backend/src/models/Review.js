import mongoose from "mongoose";
import Book from "./Book.js";

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Hodnotenie je povinné"],
      min: [1, "Minimálne 1 hviezdička"],
      max: [5, "Maximálne 5 hviezdičiek"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Komentár môže mať max 500 znakov"],
    },
  },
  { timestamps: true }
);

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

async function updateBookRating(bookId) {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
  await Book.findByIdAndUpdate(bookId, {
    ratingAvg: avg,
    ratingCount: result.length > 0 ? result[0].count : 0,
  });
}

reviewSchema.post("save", (doc) => updateBookRating(doc.book));
reviewSchema.post("findOneAndUpdate", async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) await updateBookRating(doc.book);
});
reviewSchema.post("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) await updateBookRating(doc.book);
});

export default mongoose.model("Review", reviewSchema);
