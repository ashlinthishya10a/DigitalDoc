import "dotenv/config";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/auth.js";

const adminBootstrap = {
  name: process.env.ADMIN_NAME || "System Admin",
  employeeId: (process.env.ADMIN_EMPLOYEE_ID || "ADMIN001").toUpperCase(),
  email: (process.env.ADMIN_EMAIL || "admin@digitalflow.edu").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "Admin@123"
};

const run = async () => {
  await connectDatabase();

  await User.findOneAndUpdate(
    {
      role: "admin",
      $or: [{ email: adminBootstrap.email }, { employeeId: adminBootstrap.employeeId }]
    },
    {
      $set: {
        role: "admin",
        name: adminBootstrap.name,
        employeeId: adminBootstrap.employeeId,
        email: adminBootstrap.email,
        password: await hashPassword(adminBootstrap.password),
        department: "Administration",
        enrolledByAdmin: true
      }
    },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${adminBootstrap.email} / ${adminBootstrap.password}`);
  process.exit(0);
};

run();
