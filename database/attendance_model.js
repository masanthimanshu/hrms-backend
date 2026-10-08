import { Types, Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: {
      ref: "user",
      type: Types.ObjectId,
      required: [true, "User ID is required"],
    },

    latitude: { type: String, required: [true, "Latitude is required"] },
    longitude: { type: String, required: [true, "Longitude is required"] },
    imageUrl: { type: String, required: [true, "Image URL is required"] },
  },
  { timestamps: true },
);

export const attendanceModel = model("attendance", schema);
