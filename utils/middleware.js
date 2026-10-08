import { Tokens } from "./tokens.js";

const token = new Tokens();

export class Middleware {
  jwt = (req, res, next) => {
    const { refresh, authorization } = req.headers;

    if (!authorization || !refresh) {
      return res.status(401).send({ message: "Token not provided" });
    }

    if (token.verifyAuth(authorization) && token.verifyRefresh(refresh)) next();
    else res.status(401).send({ message: "Invalid token" });
  };

  account = (req, res, next) => {
    const { account } = req.headers;

    if (!account) {
      return res.status(401).send({ message: "Account Id not provided" });
    }

    if (account == process.env.ACCOUNT_ID) next();
    else res.status(401).send({ message: "Invalid Account Id" });
  };
}
