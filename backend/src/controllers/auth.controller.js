import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || name.trim().length < 2) {
    res.status(400).json({ msg: "Invalid name" });
  }
  if (
    !email ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    res.status(400).json({ msg: "Invalid or empty email" });
  }
  if (!password || password.trim().length < 4) {
    res.status(400).json({
      msg: "empty password or password must be at least 4 characters",
    });
  }
  if (password !== confirmPassword) {
    res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Tento email je už zaregistrovaný" });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password, // → automaticky sa zahashuje v pre("save")
      role: email === "admin@kniznica.sk" ? "admin" : "customer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Chyba servera pri registracii", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ msg: "Missing email or password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
    }

    const isPasswordValid = await user.comparePasswords(password);
    if (!isPasswordValid) {
      res.status(401).json({ msg: "Invalid password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
