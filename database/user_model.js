import { Types, Schema, model } from "mongoose";

const schema = new Schema(
  {
    storeId: {
      ref: "store",
      type: Types.ObjectId,
      required: [true, "Store ID is required"],
    },

    email: {
      type: String,
      unique: true,
      required: [true, "User email is required"],
    },

    isValid: { type: Boolean, default: false },
    name: { type: String, required: [true, "User name is required"] },
    password: { type: String, required: [true, "User password is required"] },
  },
  { timestamps: true },
);

export const userModel = model("user", schema);
