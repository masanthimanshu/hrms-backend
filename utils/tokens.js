import jwt from "jsonwebtoken";

const authSecret = process.env.AUTH_TOKEN_SECRET;
const refSecret = process.env.REFRESH_TOKEN_SECRET;

export class Tokens {
  decodeAuth = (token) => jwt.verify(token, authSecret);
  decodeRefresh = (token) => jwt.verify(token, refSecret);

  generateAuth = (data) => {
    return jwt.sign({ data }, authSecret, { expiresIn: "2d" });
  };

  generateRefresh = (data) => {
    return jwt.sign({ data }, refSecret, { expiresIn: "10d" });
  };

  verifyAuth = (token) => {
    try {
      jwt.verify(token, authSecret);
      return true;
    } catch {
      return false;
    }
  };

  verifyRefresh = (token) => {
    try {
      jwt.verify(token, refSecret);
      return true;
    } catch {
      return false;
    }
  };
}
