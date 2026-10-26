import { getDistance } from "geolib";
import { userModel } from "../../database/user_model.js";
import { storeModel } from "../../database/store_model.js";
import { attendanceModel } from "../../database/attendance_model.js";

export class AttendanceController {
  add = async (res = Response, data) => {
    try {
      const userId = data.userId?.uid || data.userId;
      const userData = await userModel.findById(userId);
      if (!userData) {
        return res.status(404).send({ error: "User not found" });
      }

      const storeData = await storeModel.findById(userData.storeId);
      if (!storeData) {
        return res.status(404).send({ error: "Store not found" });
      }

      const distance = getDistance(
        { latitude: data.latitude, longitude: data.longitude },
        { latitude: storeData.latitude, longitude: storeData.longitude },
      );

      await attendanceModel.create({
        ...data,
        userId,
        distance: String(distance),
      });
      res.send({ status: "Attendance added successfully" });
    } catch (error) {
      console.error(error);
      res.status(502).send({ error: error.message });
    }
  };
}
