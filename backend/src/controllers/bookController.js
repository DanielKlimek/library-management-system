import Book from "../models/Book.js";
import Review from "../models/Review.js";
import fs from "fs";

export const getBooks = async (req, res, next) => {
  try {
    const { search, yearFrom, yearTo, minRating, availability } = req.query;

    let filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    if (yearFrom || yearTo) {
      filter.year = {};
      if (yearFrom) filter.year.$gte = parseInt(yearFrom);
      if (yearTo) filter.year.$lte = parseInt(yearTo);
    }

    if (availability) {
      if (availability === "available") {
        filter.availableCopies = { $gt: 0 };
      } else if (availability === "unavailable") {
        filter.availableCopies = 0;
      }
    }

    let books = await Book.find(filter).sort({ createdAt: -1 });

    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      const booksWithRatings = await Promise.all(
        books.map(async (book) => {
          const reviews = await Review.find({ book: book._id });
          const avgRating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;
          return { ...book.toObject(), avgRating };
        })
      );
      books = booksWithRatings.filter((book) => book.avgRating >= minRatingNum);
    }

    res.json(books);
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const error = new Error("Kniha nenájdená");
      error.status = 404;
      throw error;
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, year, description, totalCopies } = req.body;

    if (!title || !author || !isbn || !year || !totalCopies) {
      const error = new Error("Všetky povinné polia musia byť vyplnené");
      error.status = 400;
      throw error;
    }

    const bookData = {
      title,
      author,
      isbn,
      year: parseInt(year),
      description,
      totalCopies: parseInt(totalCopies),
      availableCopies: parseInt(totalCopies),
      coverImage: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const book = await Book.create(bookData);
    res.status(201).json(book);
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const error = new Error("Kniha nenájdená");
      error.status = 404;
      throw error;
    }

    const { title, author, isbn, year, description, totalCopies } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (year) book.year = parseInt(year);
    if (description !== undefined) book.description = description;
    if (totalCopies) {
      const diff = parseInt(totalCopies) - book.totalCopies;
      book.totalCopies = parseInt(totalCopies);
      book.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    if (req.file) {
      if (book.coverImage) {
        const oldPath = `.${book.coverImage}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      book.coverImage = `/uploads/${req.file.filename}`;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const error = new Error("Kniha nenájdená");
      error.status = 404;
      throw error;
    }

    const Loan = (await import("../models/Loan.js")).default;
    const activeLoans = await Loan.find({
      book: req.params.id,
      status: { $in: ["active", "overdue"] },
    });

    if (activeLoans.length > 0) {
      const error = new Error(
        "Knihu nie je možné vymazať, pretože je momentálne požičaná"
      );
      error.status = 400;
      throw error;
    }

    if (book.coverImage) {
      const imagePath = `.${book.coverImage}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Review.deleteMany({ book: req.params.id });
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Kniha vymazaná" });
  } catch (err) {
    next(err);
  }
};
