import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.send(401).json({ msg: "No token, Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ msg: "Not authorized" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role !== "admin") {
    res.status(403).json({ msg: "Admin only" });
  }
  next();
};
