import express, { Request, Response } from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import handleSocketAuth from "./middleware/socketAuth.js";

// dotenv config
dotenv.config();

// cors options
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
}

// server initialization
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: corsOptions
});

// middleware configurations
app.use(cookieParser());
app.use(cors(corsOptions));

// test route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello! Suraj, I am gateway-service");
});

// proxy servers
app.use("/user", proxy("http://localhost:4001"));
app.use("/captain", proxy("http://localhost:4002"));
app.use("/rides", proxy("http://localhost:4003"));
app.use("/fare", proxy("http://localhost:4004"));
app.use("/payment", proxy("http://localhost:4005"));

// socket authentication
io.use(handleSocketAuth);

// socket io initialization
io.on("connection", (socket) => {
    console.log("socket io connected with: ", socket.id);

    socket.on("disconnect", () => {
        console.log("socket disconnected: ", socket.id);
    })
})

// listening to port
httpServer.listen(Number(process.env.PORT), "0.0.0.0", () => {
    console.log("Gateway is running");
})