/**
 * Script: reassign-products.js
 * Purpose: Move all products from vendor 14 (seed vendor) to vendor 13 (Anusha Bazaar Trading Co. - active seller)
 * Run: node reassign-products.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current product distribution...');
  
  const v13count = await prisma.product.count({ where: { vendorId: 13 } });
  const v14count = await prisma.product.count({ where: { vendorId: 14 } });
  const otherCount = await prisma.product.count({ where: { vendorId: { notIn: [13, 14] } } });
  
  console.log(`  Vendor 13 products: ${v13count}`);
  console.log(`  Vendor 14 products: ${v14count}`);
  console.log(`  Other vendor products: ${otherCount}`);

  if (v14count === 0) {
    console.log('✅ No products to reassign from vendor 14. Done.');
    return;
  }

  // Verify vendor 13 exists
  const vendor13 = await prisma.vendor.findUnique({ where: { id: 13 } });
  if (!vendor13) {
    console.error('❌ Vendor 13 not found! Aborting.');
    return;
  }
  console.log(`\n✅ Vendor 13 found: "${vendor13.companyName}" (${vendor13.contactEmail})`);

  // Reassign all vendor 14 products → vendor 13
  console.log(`\n🔄 Reassigning ${v14count} products from vendor 14 → vendor 13...`);
  const result = await prisma.product.updateMany({
    where: { vendorId: 14 },
    data: { vendorId: 13 }
  });
  console.log(`✅ Reassigned ${result.count} products to vendor 13.`);

  // Verify
  const newV13count = await prisma.product.count({ where: { vendorId: 13 } });
  const newV14count = await prisma.product.count({ where: { vendorId: 14 } });
  console.log(`\n📊 Final distribution:`);
  console.log(`  Vendor 13: ${newV13count} products`);
  console.log(`  Vendor 14: ${newV14count} products`);
  console.log('\n🎉 Done! All products now belong to vendor 13 (Anusha Bazaar Trading Co.)');
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
