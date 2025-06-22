// src/index.ts
import express from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

// src/middleware/socketAuth.ts
import jwt from "jsonwebtoken";
async function handleSocketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  const role = socket.handshake.auth?.role;
  if (!token || !role) {
    return next(new Error("Token or role is not available!"));
  }
  const secret_key = role === "user" ? process.env.USER_JWT_SECRET : process.env.CAPTAIN_JWT_SECRET;
  try {
    const payload = jwt.verify(token, secret_key);
    socket.data.user = payload;
    socket.data.role = role;
    return next();
  } catch (error) {
    return next(new Error("Invalid token: " + error.message));
  }
}
var socketAuth_default = handleSocketAuth;

// src/index.ts
dotenv.config();
var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
var app = express();
var httpServer = createServer(app);
var io = new Server(httpServer, {
  cors: corsOptions
});
app.use(cookieParser());
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Hello! Suraj, I am gateway-service");
});
app.use("/user", proxy("http://localhost:4001"));
app.use("/captain", proxy("http://localhost:4002"));
app.use("/rides", proxy("http://localhost:4003"));
app.use("/fare", proxy("http://localhost:4004"));
app.use("/payment", proxy("http://localhost:4005"));
io.use(socketAuth_default);
io.on("connection", (socket) => {
  console.log("socket io connected with: ", socket.id);
  socket.on("disconnect", () => {
    console.log("socket disconnected: ", socket.id);
  });
});
httpServer.listen(Number(process.env.PORT), "0.0.0.0", () => {
  console.log("Gateway is running");
});
