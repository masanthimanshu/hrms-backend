import { Types, Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: {
      ref: "user",
      type: Types.ObjectId,
      required: [true, "User ID is required"],
    },

    latitude: { type: String, required: [true, "Latitude is required"] },
    distance: { type: String, required: [true, "Distance is required"] },
    longitude: { type: String, required: [true, "Longitude is required"] },
  },
  { timestamps: true },
);

export const locationModel = model("location", schema);
