"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const db = mysql2_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306,
    connectionLimit: 10
});
db.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        throw err;
    }
    console.log('Connected to MySQL');
    connection.release(); // Release the connection back to the pool
});
exports.default = db;
