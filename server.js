import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { mongoBDConnect } from "./src/config/db.js";
import router from "./src/route/index.js";
import http from "http";
import socketServer from "./socket.js";

// initialization
const app = express();
dotenv.config();

// set middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://msgr-front.vercel.app/"],
    credentials: true,
  })
);

// set environment vars
const PORT = process.env.PORT || 9090;

// static folder
app.use(express.static("public"));

// routing
app.use(router);

// use error handler
app.use(errorHandler);

const server = http.createServer(app);
socketServer(server, "http://localhost:3000");

// app listen
server.listen(PORT, () => {
  mongoBDConnect();
  console.log(`server is running on port ${PORT}`.bgGreen.black);
});
