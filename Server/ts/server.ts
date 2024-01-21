import express, { json, text, urlencoded } from "express";
import cors from "cors";
import http from "http";
import db from "./config/db";
import dotenv from "dotenv";
import authController from "./Controller/authController";
import taskController from "./Controller/taskController";

const app = express();
app.use(cors());
app.use(json({ limit: "200mb" }));
app.use(text());
dotenv.config();
app.use(urlencoded({ extended: true, limit: "200mb", parameterLimit: 100000000 }));

console.log("server reached...");
const server = http.createServer(app);

// Remove Socket.io related code

// route
app.use("/Users", authController);
app.use("/Assign", taskController);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
