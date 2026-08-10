const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- ALL ADMIN USERS IN DB ---');
  const admins = await prisma.adminUser.findMany({ include: { role: true } });
  console.log(admins);

  for (const admin of admins) {
    const isMatch = await bcrypt.compare('admin123', admin.passwordHash);
    console.log(`Email: ${admin.email} | Password 'admin123' match:`, isMatch);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
