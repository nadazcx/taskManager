import express from "express";
const router = express.Router();
import db from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ACTIONS from "../Actions/Actions";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

// User Authentication api
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate user credentials
    const [user]: any = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);

    // Compare password hashes
    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user[0].userId, username: user[0].username },
      SECRET_KEY || "",
      { expiresIn: "7d" }
    );

    user[0].password = "";
    res.json({ token, user: user[0] });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error });
  }
});

// User registration api
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const [existingUser]: any = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in the database
    await db
      .promise()
      .query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
