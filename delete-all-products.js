const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllProducts() {
  console.log('🧹 Starting cleanup of all products and product-related data...');

  try {
    // 1. Delete dependent child records
    console.log('-> Deleting product images, variants, documents...');
    await prisma.productImage.deleteMany({}).catch(() => {});
    await prisma.productVideo.deleteMany({}).catch(() => {});
    await prisma.productDocument.deleteMany({}).catch(() => {});
    await prisma.productVariant.deleteMany({}).catch(() => {});
    await prisma.productQnA.deleteMany({}).catch(() => {});
    await prisma.review.deleteMany({}).catch(() => {});
    await prisma.wishlistItem.deleteMany({}).catch(() => {});
    await prisma.cartItem.deleteMany({}).catch(() => {});
    await prisma.orderItem.deleteMany({}).catch(() => {});

    // Try deleting additional product relations if they exist in schema
    if (prisma.productSpecification) await prisma.productSpecification.deleteMany({}).catch(() => {});
    if (prisma.productBulkDiscount) await prisma.productBulkDiscount.deleteMany({}).catch(() => {});
    if (prisma.inventory) await prisma.inventory.deleteMany({}).catch(() => {});
    if (prisma.rentalRequest) await prisma.rentalRequest.deleteMany({}).catch(() => {});

    // 2. Delete all products
    console.log('-> Deleting products table...');
    const result = await prisma.product.deleteMany({});
    console.log(`✅ Successfully deleted ${result.count} products from the database!`);
  } catch (error) {
    console.error('❌ Error during product deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProducts();
