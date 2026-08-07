const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  let role = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
  }

  const admin1 = await prisma.adminUser.upsert({
    where: { email: 'admin@hinchmart.com' },
    update: { passwordHash: hash },
    create: {
      name: 'HinchMart Admin',
      email: 'admin@hinchmart.com',
      passwordHash: hash,
      roleId: role.id
    }
  });

  const admin2 = await prisma.adminUser.upsert({
    where: { email: 'admin@hinchi.com' },
    update: { passwordHash: hash },
    create: {
      name: 'Hinchi Admin',
      email: 'admin@hinchi.com',
      passwordHash: hash,
      roleId: role.id
    }
  });

  console.log('Successfully set Admin Credentials:');
  console.log('Email:', admin1.email, '| Password: admin123');
  console.log('Email:', admin2.email, '| Password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
