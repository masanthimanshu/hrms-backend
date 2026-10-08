import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Store name is required"],
    },

    latitude: {
      type: String,
      unique: true,
      required: [true, "Latitude is required"],
    },

    longitude: {
      type: String,
      unique: true,
      required: [true, "Longitude is required"],
    },

    address: {
      type: String,
      unique: true,
      required: [true, "Store address is required"],
    },
  },
  { timestamps: true },
);

export const storeModel = model("store", schema);
