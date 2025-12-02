
import { envVars } from "../config/env";
import bcrypt from "bcryptjs";
import { prisma } from "../app/shared/prisma";
import { UserRole } from "@prisma/client";


export const seedAdmin = async () => {
  try {
    await prisma.$connect();
    const isExistAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN,
      },
    });
    
    
    if (isExistAdmin) {
       console.log("Admin already exists")
      return;
    }

    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: envVars.ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    
    console.log("Admin created successfully:", {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

