import { Tokens } from "../../utils/tokens.js";

const jwtTokens = new Tokens();

export class AdminController {
  login = async (res = Response, data) => {
    const { user, pass } = data;

    if (user === "hrms@scoobies.co.in") {
      if (pass === "#admin@1234#") {
        const authToken = jwtTokens.generateAuth({ user: "admin" });
        const refreshToken = jwtTokens.generateRefresh({ user: "admin" });

        return res.send({ status: "Success", authToken, refreshToken });
      } else {
        return res.status(401).send({ message: "Invalid password" });
      }
    } else {
      return res.status(401).send({ message: "Invalid username" });
    }
  };
}
