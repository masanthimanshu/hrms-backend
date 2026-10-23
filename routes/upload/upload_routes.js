import { z } from "zod";
import { Router } from "express";
import { generateImageUploadUrl } from "../../aws/s3_client.js";

export const routes = Router();

routes.get("/health", (req, res) => {
  res.send({ status: "Upload Service is running" });
});

routes.post("/image", async (req, res) => {
  const schema = z.object({ text: z.string() }).strict();

  try {
    schema.parse(req.body);
    const data = await generateImageUploadUrl(req.body.text);
    res.send({ ...data });
  } catch {
    return res.status(400).send({ error: "Missing required fields" });
  }
});
