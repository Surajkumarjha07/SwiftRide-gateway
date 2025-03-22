import express from "express";
import proxy from "express-http-proxy";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello! Suraj, I am gateway-service");
})

app.use("/user", proxy("http://localhost:4001"));
app.use("/captain", proxy("http://localhost:4002"));
app.use("/rides", proxy("http://localhost:4003"));

app.listen(4000, () => {
    console.log("Gateway is running");
})