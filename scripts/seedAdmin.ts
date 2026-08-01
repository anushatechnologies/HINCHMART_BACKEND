import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin roles and user...');

  // Create Super Admin Role
  const role = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN' },
  });

  // Create Admin User
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@hinchi.com' },
    update: { passwordHash },
    create: {
      name: 'System Admin',
      email: 'admin@hinchi.com',
      passwordHash,
      roleId: role.id
    },
  });

  console.log('Admin seeded successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
