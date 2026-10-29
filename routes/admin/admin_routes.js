import { z } from "zod";
import { Router } from "express";
import { Tokens } from "../../utils/tokens.js";
import { AdminController } from "./admin_controller.js";
import { attendanceModel } from "../../database/attendance_model.js";

const token = new Tokens();
export const routes = Router();
const controller = new AdminController();

routes.get("/health", (req, res) => {
  res.send({ status: "Admin Service is running" });
});

routes.post("/login", (req, res) => {
  const schema = z.object({ user: z.string(), pass: z.string() }).strict();

  try {
    schema.parse(req.body);
    controller.login(res, req.body);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routes.get("/attendance", async (req, res) => {
  const { authorization } = req.headers;
  const { data } = token.decodeAuth(authorization);

  const user = data?.user || data;

  if (user !== "admin") {
    return res.status(401).send({ message: "Invalid user" });
  }

  const allAttendance = await attendanceModel.find({});
  res.send({ data: allAttendance });
});
