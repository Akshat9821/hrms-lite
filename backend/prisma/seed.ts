import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const employees = [
    {
      employeeId: "EMP-001",
      fullName: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      department: "Engineering",
    },
    {
      employeeId: "EMP-002",
      fullName: "Diya Patel",
      email: "diya.patel@example.com",
      department: "HR",
    },
    {
      employeeId: "EMP-003",
      fullName: "Kabir Singh",
      email: "kabir.singh@example.com",
      department: "Finance",
    },
  ];

  for (const e of employees) {
    await prisma.employee.upsert({
      where: { employeeId: e.employeeId },
      update: {},
      create: e,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

