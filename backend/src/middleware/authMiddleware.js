import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      const error = new Error("Token chýba");
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    next(err);
  }
};

export const admin = (req, res, next) => {
  if (req.userRole !== "admin") {
    const error = new Error("Prístup odmietnutý - iba admin");
    error.status = 403;
    return next(error);
  }
  next();
};
