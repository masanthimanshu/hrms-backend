import "dotenv/config";

import cors from "cors";
import express from "express";
import { connect } from "mongoose";
import * as route from "./routes/export.js";
import { rateLimit } from "express-rate-limit";
import { Middleware } from "./utils/middleware.js";

const mongoUri = `${process.env.DB_URL}?authSource=admin`;

const limiter = rateLimit({
  limit: 50,
  legacyHeaders: false,
  windowMs: 5 * 60 * 1000,
  standardHeaders: "draft-8",
  message: {
    status: 429,
    error: "Too many requests",
    message: "You have exceeded the request limit.",
  },
});

const app = express();
const middleware = new Middleware();

app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/secure", middleware.jwt);
app.use("/account", middleware.account);

app.get("/health", (req, res) => res.send({ message: "Server running" }));
app.get("/secure/verify", (req, res) => res.send({ message: "User is valid" }));

app.use("/jwt", route.jwtRoutes);

app.use("/account/auth", route.authRoutes);
app.use("/account/store", route.storeRoutes);
app.use("/account/admin", route.adminRoutes);

app.use("/secure/user", route.userRoutes);
app.use("/secure/upload", route.uploadRoutes);
app.use("/secure/attendance", route.attendanceRoutes);

app.listen(process.env.PORT, () => console.log("App Started"));

connect(mongoUri).then(() => console.log("Database Connected"));
