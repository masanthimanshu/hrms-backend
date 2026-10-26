import { getDistance } from "geolib";
import { userModel } from "../../database/user_model.js";
import { storeModel } from "../../database/store_model.js";
import { attendanceModel } from "../../database/attendance_model.js";

export class AttendanceController {
  add = async (res = Response, data) => {
    const userData = await userModel.findById(data.userId);
    const storeData = await storeModel.findById(userData.storeId);

    const distance = getDistance(
      { latitude: data.latitude, longitude: data.longitude },
      { latitude: storeData.latitude, longitude: storeData.longitude },
    );

    await attendanceModel.create({ ...data, distance });
    res.send({ status: "Attendance added successfully" });
  };
}
