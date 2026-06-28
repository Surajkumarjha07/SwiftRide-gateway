import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import handleSocketAuth from "./middleware/socketAuth.middleware.js";
import startKafka from "./kafka/index.kafka.js";
import { InitializeSocket } from "./config/socket.js";
import proxy from "express-http-proxy";
import { CaptainPayload, UserPayload } from "./types/payload.type.js";
import rateLimitMiddleware from "./middleware/rateLimiter.middleware.js";
import locationUpdateRoutes from "./routes/locationUpdates.route.js";
import userAuthenticate from "./middleware/userAuth.middleware.js";

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
await startKafka();

const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST || "localhost";
const CAPTAIN_SERVICE_HOST = process.env.CAPTAIN_SERVICE_HOST || "localhost";
const RIDE_SERVICE_HOST = process.env.RIDE_SERVICE_HOST || "localhost";
const FARE_SERVICE_HOST = process.env.FARE_SERVICE_HOST || "localhost";
const PAYMENT_SERVICE_HOST = process.env.PAYMENT_SERVICE_HOST || "localhost";

// proxy servers
app.use("/user", rateLimitMiddleware, proxy(`http://${USER_SERVICE_HOST}:4001`));
app.use("/captain", rateLimitMiddleware, proxy(`http://${CAPTAIN_SERVICE_HOST}:4002`));
app.use("/rides", rateLimitMiddleware, proxy(`http://${RIDE_SERVICE_HOST}:4003`));
app.use("/fare", rateLimitMiddleware, proxy(`http://${FARE_SERVICE_HOST}:4004`));
app.use("/payment", userAuthenticate, rateLimitMiddleware, proxy(`http://${PAYMENT_SERVICE_HOST}:4005`, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {

        console.log("SRC REQ::::::::::: ", srcReq.user)

        if (srcReq.user) {
            proxyReqOpts.headers = {
                ...proxyReqOpts.headers,
                "x-user-payload": JSON.stringify(srcReq.user)
            }
        }

        return proxyReqOpts;
    }
}));

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

    socket.on("initiate-chat", ({ rideData }, callback) => {
        const { rideId } = rideData;

        socket.join(`room-${rideId}`);

        if (callback) callback({
            status: "joined",
            roomId: rideId
        });
    });

    socket.on("message", ({ userName, rideId, message }) => {
        const room = `room-${rideId}`;

        io.to(room).emit("messageArrived", { userName, message });
    });

    socket.on("disconnect", () => {
        console.log("socket disconnected: ", socket.id);
    });
})

// listening to port
httpServer.listen(Number(process.env.PORT), "0.0.0.0", () => {
    console.log("Gateway is running");
})