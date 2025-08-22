import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role, base } = req.body;

    // role-based limits
    const limits = {
      admin: 1,
      commander: 4,
      logistics: 4
    };

    // check if role is valid
    if (!limits[role]) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // check base requirement
    if (role !== "admin" && ![1, 2, 3, 4].includes(base)) {
      return res.status(400).json({ message: "Invalid base" });
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // check count of existing users with that role
    const existingUsers = await User.find({ role });
    if (existingUsers.length >= limits[role]) {
      return res.status(400).json({ message: `Signup limit reached for ${role}` });
    }

    // extra rule: only 1 admin allowed
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }
    }

    // hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role, base });
    await newUser.save();

    // sanitize response (don't send password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      base: newUser.base
    };

    res.status(201).json({ message: "User created successfully", user: userResponse });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    // create JWT token with role and base info
    const token = jwt.sign(
      { id: user._id, role: user.role, base: user.base },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // sanitize user object for response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      base: user.base
    };

    res.json({
      message: "Login successful",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

export default router;
