import { z } from "zod";
import { Router } from "express";
import { Tokens } from "../../utils/tokens.js";
import { AttendanceController } from "./attendance_controller.js";
import { attendanceModel } from "../../database/attendance_model.js";

const token = new Tokens();
export const routes = Router();
const controller = new AttendanceController();

routes.get("/health", (req, res) => {
  res.send({ status: "Attendance Service is running" });
});

routes.get("/today", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { data } = token.decodeAuth(authorization);

    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const attendanceData = await attendanceModel.find({
      userId: data.uid,
      createdAt: { $gte: startTime, $lte: endTime },
    });

    res.send({ data: attendanceData });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routes.get("/all", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { data } = token.decodeAuth(authorization);

    const attendanceData = await attendanceModel.find({ userId: data.uid });
    res.send({ data: attendanceData });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routes.post("/add", (req, res) => {
  const { authorization } = req.headers;
  const { data } = token.decodeAuth(authorization);

  const schema = z.object({
    latitude: z.string(),
    imageUrl: z.string(),
    longitude: z.string(),
  });

  try {
    schema.strict().parse(req.body);
    controller.add(res, { ...req.body, userId: data.uid });
  } catch {
    res.status(400).send({ error: "Missing required fields" });
  }
});
