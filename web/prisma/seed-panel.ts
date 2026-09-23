import "dotenv/config";
import { UserRole } from "@prisma/client";
import hashSync from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required.");
    process.exit(1);
  }

  const hash = hashSync.hashSync(password, 10);

  console.log(`Seeding panel admin user: ${email}...`);
  await prisma.user.upsert({
    where: { email },
    create: {
      name: "Admin",
      email,
      passwordHash: hash,
      role: UserRole.ADMIN,
    },
    update: {
      passwordHash: hash,
      role: UserRole.ADMIN,
    },
  });

  const amenities = [
    "MRI",
    "Ultrasonography",
    "CT Scan",
    "ECG",
    "Pathology Lab",
    "Dialysis",
    "Blood Bank",
    "Physiotherapy",
  ];

  console.log("Seeding amenities...");
  for (const name of amenities) {
    await prisma.amenity.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  console.log("Panel seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
