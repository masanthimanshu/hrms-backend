import { z } from "zod";
import { Router } from "express";
import { AuthController } from "./auth_controller.js";
import { userModel } from "../../database/user_model.js";

export const routes = Router();
const controller = new AuthController();

routes.get("/health", (req, res) => {
  res.send({ status: "Auth Service is running" });
});

routes.get("/users", async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.send({ data: users });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routes.post("/login", (req, res) => {
  const schema = z.object({ email: z.string(), password: z.string() }).strict();

  try {
    schema.parse(req.body);
    controller.login(res, req.body);
  } catch {
    res.status(400).send({ error: "Missing required fields" });
  }
});

routes.post("/create", (req, res) => {
  const schema = z.object({
    name: z.string(),
    email: z.string(),
    storeId: z.string(),
  });

  try {
    schema.strict().parse(req.body);
    controller.create(res, req.body);
  } catch {
    return res.status(400).send({ error: "Missing required fields" });
  }
});

routes.post("/validate/:uid", async (req, res) => {
  const user = await userModel.findById(req.params.uid);
  if (!user) return res.status(404).send({ error: "User not found" });

  user.isValid = !user.isValid;
  await user.save();

  res.send({ status: `User validation changed` });
});
