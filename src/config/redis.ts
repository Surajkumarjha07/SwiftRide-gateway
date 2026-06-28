import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;  

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT
});

redis.on("connect", () => {
  console.log(
    `Redis connected: ${REDIS_HOST}:${REDIS_PORT}`
  );
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

export default redis;