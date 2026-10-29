import { z } from "zod";
import { Router } from "express";
import { getDistance } from "geolib";
import { Tokens } from "../../utils/tokens.js";
import { userModel } from "../../database/user_model.js";
import { storeModel } from "../../database/store_model.js";

const token = new Tokens();
export const routes = Router();

routes.get("/health", (req, res) => {
  res.send({ status: "User Service is running" });
});

routes.post("/distance", async (req, res) => {
  const { authorization } = req.headers;
  const { data } = token.decodeAuth(authorization);

  const schema = z.object({ latitude: z.string(), longitude: z.string() });

  try {
    const { latitude, longitude } = schema.strict().parse(req.body);

    const userData = await userModel.findById(data.uid);
    const storeData = await storeModel.findById(userData.storeId);

    const distance = getDistance(
      { latitude, longitude },
      { latitude: storeData.latitude, longitude: storeData.longitude },
    );

    res.send({ distance });
  } catch {
    res.status(400).send({ error: "Missing required fields" });
  }
});
