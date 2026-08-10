const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.vendor.count();
  console.log('Vendor count in DB:', c);
  const p = await prisma.product.count();
  console.log('Product count in DB:', p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
