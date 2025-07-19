import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import handleSocketAuth from "./middleware/socketAuth.js";
import startKafka from "./kafka/index.js";
import { InitializeSocket } from "./config/socket.js";
import proxy from "express-http-proxy";
import { CaptainPayload, UserPayload } from "./types/payload.js";
import rateLimitMiddleware from "./middleware/rateLimiter.js";
import locationUpdateRoutes from "./routes/locationUpdates.js";

// dotenv config
dotenv.config();

// cors options
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
}

// server initialization
const app = express();
const httpServer = createServer(app);
const io = InitializeSocket(httpServer, corsOptions);

// middleware configurations
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// test route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello! Suraj, I am gateway-service");
});

// API Routes
app.use("/location-update", locationUpdateRoutes);

// kafka setup
startKafka();

// proxy servers
app.use("/user", rateLimitMiddleware, proxy("http://localhost:4001"));
app.use("/captain", rateLimitMiddleware, proxy("http://localhost:4002"));
app.use("/rides", rateLimitMiddleware, proxy("http://localhost:4003"));
app.use("/fare", rateLimitMiddleware, proxy("http://localhost:4004"));
app.use("/payment", rateLimitMiddleware, proxy("http://localhost:4005"));

// socket authentication
io.use(handleSocketAuth);

// socket io initialization
io.on("connection", (socket) => {
    const payload: UserPayload & CaptainPayload = socket.data.user;

    const { userId, captainId } = payload;

    if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    }

    if (captainId) {
        socket.join(captainId);
        console.log(`Captain ${captainId} joined room`);
    }

    socket.on("disconnect", () => {
        console.log("socket disconnected: ", socket.id);
    })
})

// listening to port
httpServer.listen(Number(process.env.PORT), "0.0.0.0", () => {
    console.log("Gateway is running");
})