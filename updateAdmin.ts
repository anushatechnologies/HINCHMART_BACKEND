import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newHash = await bcrypt.hash('admin123', 10);
  const updatedAdmin = await prisma.adminUser.update({
    where: { email: 'admin@hinchi.com' },
    data: { passwordHash: newHash, email: 'admin@hinchmart.com' } // Also updating email to hinchmart
  });
  console.log("Updated Admin:");
  console.log(updatedAdmin);
}

main().catch(console.error).finally(() => prisma.$disconnect());
