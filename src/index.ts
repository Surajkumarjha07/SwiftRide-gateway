import express, { Request, Response } from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();

const corsOptions = {
    origin: "*",
    credentials: true
}

app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello! Suraj, I am gateway-service");
});

app.use("/user", proxy("http://localhost:4001"));
app.use("/captain", proxy("http://localhost:4002"));
app.use("/rides", proxy("http://localhost:4003"));
app.use("/fare", proxy("http://localhost:4004"));
app.use("/payment", proxy("http://localhost:4005"));

app.listen(Number(process.env.PORT), "0.0.0.0", () => {
    console.log("Gateway is running");
})