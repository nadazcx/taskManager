import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import {Pool,createPool} from "mysql2/promise";

dotenv.config();

const app = express();

const db =  mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  connectionLimit : 10
});

db.getConnection((err, connection) => {  
  if (err) {
    console.error("Error connecting to MySQL:", err);
    throw err;
  }

  console.log('Connected to MySQL');
  connection.release(); // Release the connection back to the pool
});

export default db;
