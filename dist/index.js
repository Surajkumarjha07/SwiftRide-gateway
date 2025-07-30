// src/index.ts
import express from "express";
import dotenv3 from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

// src/middleware/socketAuth.middleware.ts
import jwt from "jsonwebtoken";
import cookie from "cookie";
async function handleSocketAuth(socket, next) {
  let token;
  const role = socket.handshake.auth?.role;
  if (socket.handshake.auth?.token) {
    token = socket.handshake.auth.token;
  } else if (socket.handshake.headers.cookie) {
    token = cookie.parse(socket.handshake.headers.cookie).authToken;
  }
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
var socketAuth_middleware_default = handleSocketAuth;

// src/kafka/kafkaClient.ts
import { Kafka, logLevel } from "kafkajs";
var kafka = new Kafka({
  clientId: "gateway",
  brokers: ["localhost:9092"],
  connectionTimeout: 1e4,
  requestTimeout: 3e4,
  retry: {
    initialRetryTime: 2e3,
    retries: 10
  },
  logLevel: logLevel.ERROR
});
var kafkaClient_default = kafka;

// src/kafka/consumerInIt.ts
var show_fare_consumer = kafkaClient_default.consumer({ groupId: "show-fare-group" });
var captains_fetched_consumer = kafkaClient_default.consumer({ groupId: "captains-fetched-group" });
var captain_not_available = kafkaClient_default.consumer({ groupId: "captain-not-available" });
var ride_confirmed_notify_user = kafkaClient_default.consumer({ groupId: "ride-confirmed-notify-user-group" });
var ride_cancelled_notify_captain = kafkaClient_default.consumer({ groupId: "ride-cancelled-notify-captain-group" });
var payment_request_notify_user = kafkaClient_default.consumer({ groupId: "payment-request-notify-user-group" });
var payment_processed_notify_captain = kafkaClient_default.consumer({ groupId: "payment-processed-notify-captain" });
async function consumerInit() {
  await Promise.all([
    show_fare_consumer.connect(),
    captains_fetched_consumer.connect(),
    captain_not_available.connect(),
    ride_confirmed_notify_user.connect(),
    ride_cancelled_notify_captain.connect(),
    payment_request_notify_user.connect(),
    payment_processed_notify_captain.connect()
  ]);
}

// src/config/socket.ts
import { Server } from "socket.io";
var io;
function InitializeSocket(httpServer2, corsOptions2) {
  io = new Server(httpServer2, {
    cors: corsOptions2
  });
  return io;
}
function getIO() {
  if (!io) throw new Error(`Socket not initialized!`);
  return io;
}

// src/kafka/handlers/captainNotAvailable.handler.ts
async function captainNotAvailableHandler({ message }) {
  try {
    const { rideData } = JSON.parse(message.value.toString());
    const { userId } = rideData;
    const io3 = getIO();
    io3.to(userId).emit("no-captain-found", { rideData });
  } catch (error) {
    throw new Error("Error in getting captain-not-available handler: " + error.message);
  }
}
var captainNotAvailable_handler_default = captainNotAvailableHandler;

// src/kafka/consumers/captainNotAvailabe.consumer.ts
async function captainNotAvailable() {
  try {
    await captain_not_available.subscribe({ topic: "no-captain-found-notify-gateway", fromBeginning: true });
    await captain_not_available.run({
      eachMessage: captainNotAvailable_handler_default
    });
  } catch (error) {
    throw new Error("Error in getting captain-not-available request: " + error.message);
  }
}
var captainNotAvailabe_consumer_default = captainNotAvailable;

// src/kafka/handlers/captainsFetched.handler.ts
async function captainsFetchedHandler({ message }) {
  try {
    const { captains, rideData } = JSON.parse(message.value.toString());
    console.log("captains: ", captains);
    const io3 = getIO();
    for (const captain of captains) {
      let { captainId } = captain;
      io3.to(captainId).emit("accept-ride", { captain, rideData });
    }
  } catch (error) {
    throw new Error("Error in captains-fetched handler: " + error.message);
  }
}
var captainsFetched_handler_default = captainsFetchedHandler;

// src/kafka/consumers/captainsFetched.consumer.ts
async function captainsFetched() {
  try {
    await captains_fetched_consumer.subscribe({ topic: "captains-fetched", fromBeginning: true });
    await captains_fetched_consumer.run({
      eachMessage: captainsFetched_handler_default
    });
  } catch (error) {
    throw new Error("Error in captains-fetched consumer: " + error.message);
  }
}
var captainsFetched_consumer_default = captainsFetched;

// src/config/redis.ts
import { Redis } from "ioredis";
var redis = new Redis();
var redis_default = redis;

// src/kafka/handlers/paymentProcessedNotifyCaptain.handler.ts
async function paymentProcessedNotifyCaptainHandler({ message }) {
  try {
    const { fare, payment_id, orderId, order, userId, rideId, captainId } = JSON.parse(message.value.toString());
    const io3 = getIO();
    io3.to(captainId).emit("payment-processed", { fare, payment_id, orderId, order, userId, rideId, captainId });
    await redis_default.del(`ride:${rideId}`);
  } catch (error) {
    throw new Error("Error in payment-processed-notify-captain handler: " + error.message);
  }
}
var paymentProcessedNotifyCaptain_handler_default = paymentProcessedNotifyCaptainHandler;

// src/kafka/consumers/paymentProccessedNotifyCaptain.consumer.ts
async function paymentProcessedNotifyCaptain() {
  try {
    await payment_processed_notify_captain.subscribe({ topic: "payment-processed-notify-captain", fromBeginning: true });
    await payment_processed_notify_captain.run({
      eachMessage: paymentProcessedNotifyCaptain_handler_default
    });
  } catch (error) {
    throw new Error("Error in payment-processed-notify-captain: " + error.message);
  }
}
var paymentProccessedNotifyCaptain_consumer_default = paymentProcessedNotifyCaptain;

// src/kafka/handlers/paymentRequest.handler.ts
async function paymentRequestHandler({ message }) {
  try {
    const { rideData } = JSON.parse(message.value.toString());
    const { userId } = rideData;
    const io3 = getIO();
    io3.to(userId).emit("payment-request", { rideData });
  } catch (error) {
    throw new Error("Error in payment-request handler(gateway): " + error.message);
  }
}
var paymentRequest_handler_default = paymentRequestHandler;

// src/kafka/consumers/paymentRequested.consumer.ts
async function paymentRequest() {
  try {
    await payment_request_notify_user.subscribe({ topic: "payment-requested-notify-user", fromBeginning: true });
    await payment_request_notify_user.run({
      eachMessage: paymentRequest_handler_default
    });
  } catch (error) {
    throw new Error("Error in payment-request consumer(gateway): " + error.message);
  }
}
var paymentRequested_consumer_default = paymentRequest;

// src/kafka/handlers/rideCancelled.handler.ts
async function rideCancelledHandler({ message }) {
  try {
    const { rideData } = JSON.parse(message.value.toString());
    const { rideId, captainId } = rideData;
    const io3 = getIO();
    io3.to(captainId).emit("ride-cancelled", { rideData });
    await redis_default.del(`ride:${rideId}`);
  } catch (error) {
    throw new Error("Error in getting ride-cancelled handler(gateway): " + error.message);
  }
}
var rideCancelled_handler_default = rideCancelledHandler;

// src/kafka/consumers/rideCancelled.consumer.ts
async function rideCancelled() {
  try {
    await ride_cancelled_notify_captain.subscribe({ topic: "ride-cancelled-notify-captain", fromBeginning: true });
    await ride_cancelled_notify_captain.run({
      eachMessage: rideCancelled_handler_default
    });
  } catch (error) {
    throw new Error("Error in ride cancelled consumer(gateway): " + error.message);
  }
}
var rideCancelled_consumer_default = rideCancelled;

// src/kafka/handlers/rideConfirmedNotify.handler.ts
async function rideConfirmedNotifyHandler({ message }) {
  try {
    const { rideData } = JSON.parse(message.value.toString());
    const { userId } = rideData;
    const io3 = getIO();
    io3.to(userId).emit("ride-confirmed", { rideData });
  } catch (error) {
    throw new Error("Error in ride-confirmed-notify-consumer: " + error.message);
  }
}
var rideConfirmedNotify_handler_default = rideConfirmedNotifyHandler;

// src/kafka/consumers/rideConfirmedNotify.consumer.ts
async function rideConfirmedNotifyUser() {
  try {
    await ride_confirmed_notify_user.subscribe({ topic: "ride-confirmed-notify-user", fromBeginning: true });
    await ride_confirmed_notify_user.run({
      eachMessage: rideConfirmedNotify_handler_default
    });
  } catch (error) {
    throw new Error("Error in ride-confirmed-notify-consumer: " + error.message);
  }
}
var rideConfirmedNotify_consumer_default = rideConfirmedNotifyUser;

// src/kafka/handlers/showFare.handler.ts
async function showFareHandler({ message }) {
  try {
    const { fareDetails, userId } = JSON.parse(message.value.toString());
    console.log("fareDetails: ", fareDetails);
    const io3 = getIO();
    io3.to(userId).emit("fare-fetched", { userId, fareDetails });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error in getting show-fare handler: " + error.message);
    }
  }
}
var showFare_handler_default = showFareHandler;

// src/kafka/consumers/showFare.consumer.ts
async function showFare() {
  try {
    await show_fare_consumer.subscribe({ topic: "show-fare", fromBeginning: true });
    await show_fare_consumer.run({
      eachMessage: showFare_handler_default
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error in getting show-fare request: " + error.message);
    }
  }
}
var showFare_consumer_default = showFare;

// src/kafka/kafkaAdmin.ts
async function kafkaInit() {
  const admin = kafkaClient_default.admin();
  console.log("Admin connecting...");
  await admin.connect();
  console.log("Admin connected...");
  const topics = ["show-fare", "no-captain-found-notify-gateway", "captains-fetched", "payment-processed-notify-captain", "payment-requested-notify-user", "ride-cancelled-notify-captain", "ride-confirmed-notify-user"];
  const existingTopics = await admin.listTopics();
  const topicsToCreate = topics.filter((t) => !existingTopics.includes(t));
  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate.map((t) => ({ topic: t, numPartitions: 1 }))
    });
  }
  console.log("Topics created!");
  await admin.disconnect();
}
var kafkaAdmin_default = kafkaInit;

// src/kafka/producerInIt.ts
import { Partitioners } from "kafkajs";
var producer = kafkaClient_default.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});
async function producerInit() {
  await producer.connect();
}

// src/kafka/index.kafka.ts
var startKafka = async () => {
  try {
    await kafkaAdmin_default();
    console.log("Consumer initialization...");
    await consumerInit();
    console.log("Consumer initialized...");
    console.log("Producer initialization...");
    await producerInit();
    console.log("Producer initializated");
    await showFare_consumer_default();
    await captainsFetched_consumer_default();
    await captainNotAvailabe_consumer_default();
    await rideConfirmedNotify_consumer_default();
    await rideCancelled_consumer_default();
    await paymentRequested_consumer_default();
    await paymentProccessedNotifyCaptain_consumer_default();
  } catch (error) {
    console.log("error in initializing kafka: ", error);
  }
};
var index_kafka_default = startKafka;

// src/index.ts
import proxy from "express-http-proxy";

// src/services/rateLimit.service.ts
var RateLimit = class {
  capacity;
  refill_time;
  tokens;
  constructor(capacity, refill_time) {
    this.capacity = capacity;
    this.refill_time = refill_time;
    this.tokens = capacity;
    this.refillToken();
  }
  removeToken = () => {
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    } else {
      return false;
    }
  };
  refillToken = () => {
    setInterval(() => {
      if (this.tokens < this.capacity) {
        this.tokens++;
      }
    }, this.refill_time);
  };
};
var rateLimit_service_default = RateLimit;

// src/middleware/rateLimiter.middleware.ts
var rateLimitMap = /* @__PURE__ */ new Map();
async function rateLimitMiddleware(req, res, next) {
  try {
    const ip = req.ip;
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, new rateLimit_service_default(10, 2e3));
      setTimeout(() => {
        rateLimitMap.delete(ip);
      }, 10 * (60 * 1e3));
    }
    const rateLimit = rateLimitMap.get(ip);
    const allowed = rateLimit?.removeToken();
    if (!allowed) {
      return res.status(429).json({
        error: "Too many requests!"
      });
    }
    return next();
  } catch (error) {
    throw new Error("Error in rate limit middleware: " + error.message);
  }
}
var rateLimiter_middleware_default = rateLimitMiddleware;

// src/routes/locationUpdates.route.ts
import { Router } from "express";

// src/middleware/captainAuth.middleware.ts
import jwt2 from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
async function captainAuthenticate(req, res, next) {
  let token = req.cookies.authToken || req.headers["authorization"]?.split("Bearer ")[1];
  if (!token) {
    res.status(404).json({ message: "token not available" });
    return;
  }
  try {
    const verified = jwt2.verify(token, process.env.CAPTAIN_JWT_SECRET);
    if (verified) {
      req.captain = verified;
      next();
    }
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
}
var captainAuth_middleware_default = captainAuthenticate;

// src/kafka/producers/producerTemplate.ts
async function sendProducerMessage(topic, data) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }]
    });
    console.log(`${topic} sent`);
  } catch (error) {
    console.log(`error in sending ${topic}: ${error}`);
  }
}
var producerTemplate_default = sendProducerMessage;

// src/controller/captainLocationUpdate.controller.ts
async function captainLocationUpdate(req, res) {
  try {
    const { coordinates } = req.body;
    const { captainId } = req.captain;
    if (coordinates && captainId) {
      await producerTemplate_default("captain-location-update", { coordinates, captainId });
      return res.status(200).json({
        message: "location update sent"
      });
    }
    ;
    return res.status(400).json({
      message: "coordinates or captainId not available"
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message || "Internal server error!"
      });
    }
  }
}
var captainLocationUpdate_controller_default = captainLocationUpdate;

// src/middleware/userAuth.middleware.ts
import jwt3 from "jsonwebtoken";
import dotenv2 from "dotenv";
dotenv2.config();
async function userAuthenticate(req, res, next) {
  let token = req.cookies.authToken || req.headers["authorization"]?.split("Bearer ")[1];
  if (!token) {
    return res.status(404).json({ message: "token not available" });
  }
  try {
    const verified = jwt3.verify(token, process.env.USER_JWT_SECRET);
    if (verified) {
      req.user = verified;
      next();
    }
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
}
var userAuth_middleware_default = userAuthenticate;

// src/controller/userLocationUpdate.controller.ts
async function userLocationUpdate(req, res) {
  try {
    const { coordinates } = req.body;
    const { userId } = req.user;
    if (coordinates && userId) {
      await producerTemplate_default("user-location-update", { coordinates, userId });
      return res.status(200).json({
        message: "location update sent"
      });
    }
    ;
    return res.status(400).json({
      message: "coordinates or userId not available"
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message || "Internal server error!"
      });
    }
  }
}
var userLocationUpdate_controller_default = userLocationUpdate;

// src/routes/locationUpdates.route.ts
var router = Router();
router.post("/captain", captainAuth_middleware_default, captainLocationUpdate_controller_default);
router.post("/user", userAuth_middleware_default, userLocationUpdate_controller_default);
var locationUpdates_route_default = router;

// src/index.ts
dotenv3.config();
var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
var app = express();
var httpServer = createServer(app);
var io2 = InitializeSocket(httpServer, corsOptions);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Hello! Suraj, I am gateway-service");
});
app.use("/location-update", locationUpdates_route_default);
index_kafka_default();
app.use("/user", rateLimiter_middleware_default, proxy("http://localhost:4001"));
app.use("/captain", rateLimiter_middleware_default, proxy("http://localhost:4002"));
app.use("/rides", rateLimiter_middleware_default, proxy("http://localhost:4003"));
app.use("/fare", rateLimiter_middleware_default, proxy("http://localhost:4004"));
app.use("/payment", userAuth_middleware_default, rateLimiter_middleware_default, proxy("http://localhost:4005", {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
      proxyReqOpts.headers = {
        ...proxyReqOpts.headers,
        "x-user-payload": JSON.stringify(srcReq.user)
      };
    }
    return proxyReqOpts;
  }
}));
io2.use(socketAuth_middleware_default);
io2.on("connection", (socket) => {
  const payload = socket.data.user;
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
    io2.to(room).emit("messageArrived", { userName, message });
  });
  socket.on("disconnect", () => {
    console.log("socket disconnected: ", socket.id);
  });
});
httpServer.listen(Number(process.env.PORT), "0.0.0.0", () => {
  console.log("Gateway is running");
});
