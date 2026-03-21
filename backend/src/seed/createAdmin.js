import "dotenv/config";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/auth.js";

const run = async () => {
  await connectDatabase();

  const exists = await User.findOne({ role: "admin" });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  await User.create({
    role: "admin",
    name: "System Admin",
    employeeId: "ADMIN001",
    email: "admin@digitalflow.edu",
    password: await hashPassword("Admin@123"),
    department: "Administration",
    enrolledByAdmin: true
  });

  console.log("Admin created: admin@digitalflow.edu / Admin@123");
  process.exit(0);
};

run();
