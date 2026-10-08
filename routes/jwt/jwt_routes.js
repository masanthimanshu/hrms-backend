import { Router } from "express";
import { Tokens } from "../../utils/tokens.js";

export const routes = Router();
const token = new Tokens();

routes.get("/health", (req, res) => {
  res.send({ status: "JWT Service is running" });
});

routes.get("/refresh", (req, res) => {
  const { refresh, authorization } = req.headers;

  if (!authorization || !refresh) {
    return res.status(401).send({ message: "Token not provided" });
  }

  if (token.verifyRefresh(refresh)) {
    const { data } = token.decodeRefresh(refresh);

    const authToken = token.generateAuth(data);
    const refreshToken = token.generateRefresh(data);

    res.send({ status: "Success", authToken, refreshToken });
  } else {
    res.send({ message: "Invalid refresh token" });
  }
});
