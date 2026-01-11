import Loan from "../models/Loan.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

export const getLoans = async (req, res, next) => {
  try {
    const { status, user, book, overdue, fromDate, toDate } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (user) {
      filter.user = user;
    }

    if (book) {
      filter.book = book;
    }

    if (overdue === "true") {
      filter.status = "overdue";
      filter.dueDate = { $lt: new Date() };
    }

    if (fromDate || toDate) {
      filter.loanDate = {};
      if (fromDate) filter.loanDate.$gte = new Date(fromDate);
      if (toDate) filter.loanDate.$lte = new Date(toDate);
    }

    const loans = await Loan.find(filter)
      .populate("user", "name email")
      .populate("book", "title author isbn coverImage")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (err) {
    next(err);
  }
};

export const getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("user", "name email role")
      .populate("book", "title author isbn year description coverImage");

    if (!loan) {
      const error = new Error("Požičanie nenájdené");
      error.status = 404;
      throw error;
    }

    res.json(loan);
  } catch (err) {
    next(err);
  }
};

export const createLoan = async (req, res, next) => {
  try {
    const { user, book, dueDate, loanDate, notes } = req.body;

    if (!user || !book || !dueDate) {
      const error = new Error("Užívateľ, kniha a dátum vrátenia sú povinné");
      error.status = 400;
      throw error;
    }

    const userExists = await User.findById(user);
    if (!userExists) {
      const error = new Error("Užívateľ neexistuje");
      error.status = 404;
      throw error;
    }

    const bookExists = await Book.findById(book);
    if (!bookExists) {
      const error = new Error("Kniha neexistuje");
      error.status = 404;
      throw error;
    }

    if (bookExists.availableCopies <= 0) {
      const error = new Error("Kniha nie je dostupná na požičanie");
      error.status = 400;
      throw error;
    }

    const existingLoan = await Loan.findOne({
      user,
      book,
      status: { $in: ["active", "overdue"] },
    });

    if (existingLoan) {
      const error = new Error("Užívateľ už má túto knihu požičanú");
      error.status = 400;
      throw error;
    }

    const loanData = {
      user,
      book,
      dueDate: new Date(dueDate),
      loanDate: loanDate ? new Date(loanDate) : new Date(),
      notes: notes || null,
    };

    const loan = await Loan.create(loanData);

    bookExists.availableCopies -= 1;
    await bookExists.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate("user", "name email")
      .populate("book", "title author isbn");

    res.status(201).json(populatedLoan);
  } catch (err) {
    next(err);
  }
};

export const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      const error = new Error("Požičanie nenájdené");
      error.status = 404;
      throw error;
    }

    const { returnDate, status, fine, notes, dueDate } = req.body;

    if (returnDate !== undefined) {
      loan.returnDate = returnDate ? new Date(returnDate) : null;
    }

    if (dueDate !== undefined) {
      loan.dueDate = new Date(dueDate);
    }

    if (status !== undefined) {
      loan.status = status;
    }

    if (fine !== undefined) {
      loan.fine = parseFloat(fine);
    }

    if (notes !== undefined) {
      loan.notes = notes || null;
    }

    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate("user", "name email")
      .populate("book", "title author isbn");

    res.json(updatedLoan);
  } catch (err) {
    next(err);
  }
};

export const returnLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("book");

    if (!loan) {
      const error = new Error("Požičanie nenájdené");
      error.status = 404;
      throw error;
    }

    if (loan.status === "returned") {
      const error = new Error("Kniha už bola vrátená");
      error.status = 400;
      throw error;
    }

    loan.returnDate = new Date();
    loan.status = "returned";

    loan.calculateFine();

    await loan.save();

    const book = await Book.findById(loan.book._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    const returnedLoan = await Loan.findById(loan._id)
      .populate("user", "name email")
      .populate("book", "title author isbn");

    res.json(returnedLoan);
  } catch (err) {
    next(err);
  }
};

export const extendLoan = async (req, res, next) => {
  try {
    const { days } = req.body;

    if (!days || days <= 0) {
      const error = new Error("Počet dní musí byť kladné číslo");
      error.status = 400;
      throw error;
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      const error = new Error("Požičanie nenájdené");
      error.status = 404;
      throw error;
    }

    if (loan.status === "returned") {
      const error = new Error("Vrátené požičanie nemožno predĺžiť");
      error.status = 400;
      throw error;
    }

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(days));
    loan.dueDate = newDueDate;

    if (loan.status === "overdue") {
      loan.status = "active";
    }

    await loan.save();

    const extendedLoan = await Loan.findById(loan._id)
      .populate("user", "name email")
      .populate("book", "title author isbn");

    res.json(extendedLoan);
  } catch (err) {
    next(err);
  }
};

export const getUserLoans = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      const error = new Error("Užívateľ neexistuje");
      error.status = 404;
      throw error;
    }

    const loans = await Loan.find({ user: userId })
      .populate("book", "title author isbn coverImage")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (err) {
    next(err);
  }
};

export const getBookLoans = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      const error = new Error("Kniha neexistuje");
      error.status = 404;
      throw error;
    }

    const loans = await Loan.find({ book: bookId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (err) {
    next(err);
  }
};

export const getLoanStats = async (req, res, next) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const overdueLoans = await Loan.countDocuments({ status: "overdue" });
    const returnedLoans = await Loan.countDocuments({ status: "returned" });

    const totalFines = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: "$fine" } } },
    ]);

    const stats = {
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
      totalFines: totalFines.length > 0 ? totalFines[0].total : 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("book");

    if (!loan) {
      const error = new Error("Požičanie nenájdené");
      error.status = 404;
      throw error;
    }

    if (loan.status !== "returned" && loan.book) {
      const book = await Book.findById(loan.book._id);
      if (book) {
        book.availableCopies += 1;
        await book.save();
      }
    }

    await Loan.findByIdAndDelete(req.params.id);
    res.json({ message: "Požičanie vymazané" });
  } catch (err) {
    next(err);
  }
};
