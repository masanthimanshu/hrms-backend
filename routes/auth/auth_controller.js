import { compareSync } from "bcrypt";
import { Tokens } from "../../utils/tokens.js";
import { userModel } from "../../database/user_model.js";

const jwtTokens = new Tokens();

export class AuthController {
  login = async (res = Response, data) => {
    try {
      const { email, password } = data;
      const user = await userModel.findOne({ email });
      if (!user) return res.status(404).send({ error: "User not found" });

      const checkPass = compareSync(password, user.password);

      if (!checkPass) {
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
    try {
      await new userModel(data).save();
      res.send({ status: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(502).send({ error: error.message });
    }
  };
}
