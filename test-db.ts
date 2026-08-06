import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.product.count();
  const products = await prisma.product.findMany({ select: { id: true, name: true, approvalStatus: true, isActive: true, vendorId: true } });
  console.log('=== DB PRODUCTS CHECK ===');
  console.log('Total Count:', count);
  console.log('Products:', JSON.stringify(products, null, 2));
}

check().finally(() => prisma.$disconnect());
