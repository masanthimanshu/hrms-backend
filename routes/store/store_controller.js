import { storeModel } from "../../database/store_model.js";

export class StoreController {
  create = async (res = Response, data) => {
    try {
      await new storeModel(data).save();
      res.send({ status: "Store created successfully" });
    } catch (error) {
      console.error(error);
      res.status(502).send({ error: error.message });
    }
  };
}
