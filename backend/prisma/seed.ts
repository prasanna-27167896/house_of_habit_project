import "dotenv/config";
import { createHmac } from "node:crypto";
import { PrismaClient, RoleName } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;
const PEPPER = process.env["PASSWORD_PEPPER"] ?? "";

// Must match src/utils/bcrypt.ts — HMAC-pepper the password, then bcrypt.
const applyPepper = (plain: string) => createHmac("sha256", PEPPER).update(plain).digest("hex");
const hash = (plain: string) => bcrypt.hash(applyPepper(plain), SALT_ROUNDS);

async function main() {
  // ── Roles ──────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { roleName: RoleName.ROLE_ADMIN },
    create: { roleName: RoleName.ROLE_ADMIN },
    update: {},
  });

  const userRole = await prisma.role.upsert({
    where: { roleName: RoleName.ROLE_USER },
    create: { roleName: RoleName.ROLE_USER },
    update: {},
  });

  console.log("✓ Roles seeded");

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = "admin@hoh.com";
  const adminPassword = "Admin@1234";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        fullName: "HoH Admin",
        email: adminEmail,
        password: await hash(adminPassword),
        mobile: "9000000001",
        roles: { create: [{ roleId: adminRole.roleId }, { roleId: userRole.roleId }] },
      },
    });

    // Mark email as verified so login works without OTP
    await prisma.emailVerification.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        otp: 0,
        isVerified: true,
        expiresAt: new Date("2099-01-01"),
      },
      update: { isVerified: true },
    });

    console.log(`✓ Admin created  → ${adminUser.email}  |  password: ${adminPassword}`);
  } else {
    console.log(`✓ Admin already exists → ${adminEmail}`);
  }

  // ── Customer user ──────────────────────────────────────────────────────────
  const userEmail = "user@hoh.com";
  const userPassword = "User@1234";

  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!existingUser) {
    const customer = await prisma.user.create({
      data: {
        fullName: "Test Customer",
        email: userEmail,
        password: await hash(userPassword),
        mobile: "9000000002",
        roles: { create: [{ roleId: userRole.roleId }] },
      },
    });

    await prisma.emailVerification.upsert({
      where: { email: userEmail },
      create: {
        email: userEmail,
        otp: 0,
        isVerified: true,
        expiresAt: new Date("2099-01-01"),
      },
      update: { isVerified: true },
    });

    console.log(`✓ Customer created → ${customer.email}  |  password: ${userPassword}`);
  } else {
    console.log(`✓ Customer already exists → ${userEmail}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
