import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { getDistance } from "geolib";
import { userModel } from "./user_model.js";
import { storeModel } from "./store_model.js";
import { attendanceModel } from "./attendance_model.js";

const mongoUri = `${process.env.DB_URL}?authSource=admin`;
const DEFAULT_PASSWORD = "Password@123";

async function seed() {
  console.log("Connecting to database at:", mongoUri);
  await mongoose.connect(mongoUri);
  console.log("Connected successfully to MongoDB.");

  console.log("Clearing existing data...");
  await attendanceModel.deleteMany({});
  await userModel.deleteMany({});
  await storeModel.deleteMany({});
  console.log("Cleared collections: stores, users, attendances.");

  console.log("Creating stores...");
  const store1 = await storeModel.create({
    name: "Scoobies HQ & Experience Store - Sector 135",
    latitude: "28.513591395116627",
    longitude: "77.37388950784926",
    address:
      "Candor TechSpace, Tower 5, Sector 135, Noida, Uttar Pradesh 201304",
  });

  const store2 = await storeModel.create({
    name: "Scoobies Retail Store - DLF Mall of India",
    latitude: "28.567520",
    longitude: "77.320950",
    address: "DLF Mall of India, Sector 18, Noida, Uttar Pradesh 201301",
  });

  const store3 = await storeModel.create({
    name: "Scoobies Flagship Store - CyberHub",
    latitude: "28.495020",
    longitude: "77.089540",
    address: "DLF CyberHub, DLF Phase 2, Gurugram, Haryana 122002",
  });

  console.log(`Created 3 stores:`);
  console.log(` - ${store1.name} (ID: ${store1._id})`);
  console.log(` - ${store2.name} (ID: ${store2._id})`);
  console.log(` - ${store3.name} (ID: ${store3._id})`);

  console.log("Creating users...");
  const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 15);

  const himanshu = await userModel.create({
    name: "Himanshu Masant",
    email: "himanshu.masant@scoobies.ai",
    password: hashedPassword,
    storeId: store1._id,
    isValid: true,
  });

  const aarav = await userModel.create({
    name: "Aarav Sharma",
    email: "aarav.sharma@scoobies.ai",
    password: hashedPassword,
    storeId: store1._id,
    isValid: true,
  });

  const priya = await userModel.create({
    name: "Priya Verma",
    email: "priya.verma@scoobies.ai",
    password: hashedPassword,
    storeId: store2._id,
    isValid: true,
  });

  console.log(`Created 3 users with default password "${DEFAULT_PASSWORD}":`);
  console.log(
    ` - ${himanshu.name} (${himanshu.email}) [ID: ${himanshu._id}] -> Assigned Store: ${store1.name}`,
  );
  console.log(
    ` - ${aarav.name} (${aarav.email}) [ID: ${aarav._id}] -> Assigned Store: ${store1.name}`,
  );
  console.log(
    ` - ${priya.name} (${priya.email}) [ID: ${priya._id}] -> Assigned Store: ${store2.name}`,
  );

  console.log("Creating attendance records...");
  const now = new Date();

  // Helper to compute distance in meters from assigned store
  const calcDistance = (lat, lon, store) => {
    return String(
      getDistance(
        { latitude: parseFloat(lat), longitude: parseFloat(lon) },
        {
          latitude: parseFloat(store.latitude),
          longitude: parseFloat(store.longitude),
        },
      ),
    );
  };

  // Dates for attendance history
  const todayMorning = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    15,
    0,
  );
  const yesterdayMorning = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
    9,
    20,
    0,
  );
  const twoDaysAgoMorning = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 2,
    9,
    10,
    0,
  );
  const threeDaysAgoMorning = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 3,
    9,
    5,
    0,
  );

  const attendanceRecords = [
    // Himanshu Masant (Sector 135 Store)
    {
      userId: himanshu._id,
      latitude: "28.513591395116627",
      longitude: "77.37388950784926",
      distance: calcDistance("28.513591395116627", "77.37388950784926", store1),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/himanshu-checkin-today.webp",
      createdAt: todayMorning,
      updatedAt: todayMorning,
    },
    {
      userId: himanshu._id,
      latitude: "28.513600",
      longitude: "77.373895",
      distance: calcDistance("28.513600", "77.373895", store1),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/himanshu-checkin-yesterday.webp",
      createdAt: yesterdayMorning,
      updatedAt: yesterdayMorning,
    },
    {
      userId: himanshu._id,
      latitude: "28.513585",
      longitude: "77.373880",
      distance: calcDistance("28.513585", "77.373880", store1),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/himanshu-checkin-2daysago.webp",
      createdAt: twoDaysAgoMorning,
      updatedAt: twoDaysAgoMorning,
    },
    {
      userId: himanshu._id,
      latitude: "28.513591",
      longitude: "77.373890",
      distance: calcDistance("28.513591", "77.373890", store1),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/himanshu-checkin-3daysago.webp",
      createdAt: threeDaysAgoMorning,
      updatedAt: threeDaysAgoMorning,
    },

    // Aarav Sharma (Sector 135 Store)
    {
      userId: aarav._id,
      latitude: "28.513610",
      longitude: "77.373900",
      distance: calcDistance("28.513610", "77.373900", store1),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/aarav-checkin-today.webp",
      createdAt: todayMorning,
      updatedAt: todayMorning,
    },

    // Priya Verma (DLF Mall of India)
    {
      userId: priya._id,
      latitude: "28.567520",
      longitude: "77.320950",
      distance: calcDistance("28.567520", "77.320950", store2),
      imageUrl:
        "https://scoobies-hrms-assets.s3.ap-south-1.amazonaws.com/images/priya-checkin-today.webp",
      createdAt: todayMorning,
      updatedAt: todayMorning,
    },
  ];

  for (const record of attendanceRecords) {
    const doc = new attendanceModel(record);
    await doc.save({ timestamps: false });
  }

  console.log(`Created ${attendanceRecords.length} attendance records.`);
  console.log("Database seeded successfully!");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
