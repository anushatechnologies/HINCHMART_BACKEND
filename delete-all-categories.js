const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllCategories() {
  console.log('🧹 Starting cleanup of all categories & subcategories...');

  try {
    // 1. Unlink products from categories
    console.log('-> Unlinking products from categories...');
    await prisma.product.updateMany({
      data: { categoryId: null }
    }).catch(err => console.log('Product unlink warning:', err.message));

    // 2. Delete Vendor Category Requests if any
    console.log('-> Cleaning vendor category requests...');
    if (prisma.vendorCategoryRequest) {
      await prisma.vendorCategoryRequest.deleteMany({}).catch(() => {});
    }

    // 3. Delete Attribute Values & Attributes if any
    console.log('-> Cleaning category attributes...');
    if (prisma.attributeValue) {
      await prisma.attributeValue.deleteMany({}).catch(() => {});
    }
    if (prisma.attribute) {
      await prisma.attribute.deleteMany({}).catch(() => {});
    }

    // 4. Delete Subcategories (Child categories with parentId != null)
    console.log('-> Deleting all subcategories (child categories)...');
    const childResult = await prisma.category.deleteMany({
      where: { parentId: { not: null } }
    });
    console.log(`✅ Deleted ${childResult.count} subcategories.`);

    // 5. Delete Parent Categories (parentId == null)
    console.log('-> Deleting all parent categories...');
    const parentResult = await prisma.category.deleteMany({});
    console.log(`✅ Deleted ${parentResult.count} parent categories.`);

    console.log('\n🎉 ALL CATEGORIES & SUBCATEGORIES HAVE BEEN REMOVED FROM DB!');
  } catch (error) {
    console.error('❌ Error during category deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCategories();
