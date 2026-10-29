import { z } from "zod";
import { Router } from "express";
import { StoreController } from "./store_controller.js";
import { storeModel } from "../../database/store_model.js";

export const routes = Router();
const controller = new StoreController();

routes.get("/health", (req, res) => {
  res.send({ status: "Store Service is running" });
});

routes.get("/get", async (req, res) => {
  const storeData = await storeModel.find();
  res.send({ data: storeData });
});

routes.post("/create", (req, res) => {
  const schema = z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.string(),
    longitude: z.string(),
  });

  try {
    schema.strict().parse(req.body);
    controller.create(res, req.body);
  } catch {
    res.status(400).send({ error: "Missing required fields" });
  }
});
