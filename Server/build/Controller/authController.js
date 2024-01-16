"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
// User Authentication api
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Validate user credentials
        const [user] = yield db_1.default
            .promise()
            .query("SELECT * FROM users WHERE username = ?", [username]);
        if (user.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Compare password hashes
        const passwordMatch = yield bcryptjs_1.default.compare(password, user[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user[0].userId, username: user[0].username }, SECRET_KEY || '', { expiresIn: "7d" });
        user[0].password = "";
        res.json({ token, user: user[0] });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: error });
    }
}));
//User registration api
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Check if the username is already taken
        const [existingUser] = yield db_1.default
            .promise()
            .query("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }
        // Hash the password before storing it in the database
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Store user in the database
        yield db_1.default
            .promise()
            .query("INSERT INTO users (username, password) VALUES (?, ?)", [
            username,
            hashedPassword,
        ]);
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
