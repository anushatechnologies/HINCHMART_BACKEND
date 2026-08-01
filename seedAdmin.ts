import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  // Check if role exists
  let adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: 'admin@hinchi.com' }
  });

  if (existingAdmin) {
    await prisma.adminUser.update({
      where: { email: 'admin@hinchi.com' },
      data: { passwordHash }
    });
    console.log('Admin user password forcibly reset to: admin123');
  } else {
    await prisma.adminUser.create({
      data: {
        name: 'HINCHI Admin',
        email: 'admin@hinchi.com',
        passwordHash,
        roleId: adminRole.id
      }
    });
    console.log('Admin user seeded: admin@hinchi.com / admin123');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
