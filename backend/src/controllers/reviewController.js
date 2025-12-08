import Review from "../models/Review.js";
import Book from "../models/Book.js";

export const getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;

    if (!bookId || !rating) {
      const error = new Error("ID knihy a hodnotenie sú povinné");
      error.status = 400;
      throw error;
    }

    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("Kniha nenájdená");
      error.status = 404;
      throw error;
    }

    const review = await Review.create({
      book: bookId,
      user: req.userId,
      rating: parseInt(rating),
      comment,
    });

    const populated = await Review.findById(review._id).populate(
      "user",
      "name"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      const error = new Error("Recenzia nenájdená");
      error.status = 404;
      throw error;
    }

    if (review.user.toString() !== req.userId) {
      const error = new Error("Nemáte oprávnenie upraviť túto recenziu");
      error.status = 403;
      throw error;
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = parseInt(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();
    const populated = await Review.findById(review._id).populate(
      "user",
      "name"
    );
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      const error = new Error("Recenzia nenájdená");
      error.status = 404;
      throw error;
    }

    if (review.user.toString() !== req.userId) {
      const error = new Error("Nemáte oprávnenie vymazať túto recenziu");
      error.status = 403;
      throw error;
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Recenzia vymazaná" });
  } catch (err) {
    next(err);
  }
};
