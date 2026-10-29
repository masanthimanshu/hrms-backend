import { Resend } from "resend";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { compareSync, hashSync } from "bcrypt";
import { Tokens } from "../../utils/tokens.js";
import { userModel } from "../../database/user_model.js";

const jwtTokens = new Tokens();
const resend = new Resend(process.env.RESEND_API_KEY);

export class AuthController {
  login = async (res = Response, data) => {
    try {
      const { email, password } = data;
      const user = await userModel.findOne({ email });
      if (!user) return res.status(404).send({ error: "User not found" });
      if (!user.isValid) return res.status(401).send({ error: "Invalid user" });

      if (!compareSync(password, user.password)) {
        return res.status(401).send({ error: "Invalid password" });
      }

      const authToken = jwtTokens.generateAuth({ uid: user._id });
      const refreshToken = jwtTokens.generateRefresh({ uid: user._id });

      res.send({ status: "Success", authToken, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(502).send({ error: error.message });
    }
  };

  create = async (res = Response, data) => {
    const password = randomBytes(8).toString("hex");
    const hash = hashSync(password, 10);

    const emailTemplate = readFileSync(
      new URL("../../email.html", import.meta.url),
      "utf-8",
    );

    const html = emailTemplate
      .replaceAll("{{email}}", data.email)
      .replaceAll("{{password}}", password);

    try {
      await new userModel({ ...data, password: hash }).save();

      await resend.emails.send({
        to: [data.email],
        from: "Logs <logs@email.scoobies.ai>",
        subject: "Welcome to Scoobies HRMS",
        html,
      });

      res.send({ status: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(502).send({ error: error.message });
    }
  };
}
