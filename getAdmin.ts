import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.adminUser.findMany();
  console.log("Admins found:");
  console.log(admins);
}

main().catch(console.error).finally(() => prisma.$disconnect());
