import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database to start fresh...');
  
  // Delete all records from major tables in reverse order of dependencies
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.banner.deleteMany();
  // Keep the Admin User, delete normal users
  await prisma.user.deleteMany({
    where: {
      role: { not: 'ADMIN' }
    }
  });

  console.log('Database cleared! You can now insert step by step.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
