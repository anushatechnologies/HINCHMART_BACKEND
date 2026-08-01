import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products for Khidki Wholesale...');

  const vendor = await prisma.vendor.findFirst({
    where: { contactPhone: '+918388899999' }
  });

  if (!vendor) {
    console.error('Vendor not found! Run seed_khidki.ts first.');
    process.exit(1);
  }

  // Create Categories
  const categoriesData = [
    { name: 'Plywood & MDF', slug: 'plywood-mdf', imageUrl: 'https://images.unsplash.com/photo-1596700018593-6a568600dcb7?w=200&h=200&fit=crop' },
    { name: 'Laminates', slug: 'laminates', imageUrl: 'https://images.unsplash.com/photo-1620023472856-3d7120619a9e?w=200&h=200&fit=crop' },
    { name: 'Adhesives & Hardware', slug: 'adhesives-hardware', imageUrl: 'https://images.unsplash.com/photo-1540104539509-7338d0cf17fd?w=200&h=200&fit=crop' },
    { name: 'Doors & HDHMR', slug: 'doors-hdhmr', imageUrl: 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=200&h=200&fit=crop' }
  ];

  const categoryMap: any = {};
  for (const cat of categoriesData) {
    let category = await prisma.category.findFirst({ where: { slug: cat.slug } });
    if (!category) {
      category = await prisma.category.create({ data: { ...cat, isActive: true } });
    }
    categoryMap[cat.slug] = category.id;
  }

  // Create Products
  const productsData = [
    {
      name: 'Khidki Premium Plywood 18mm (Hyderabad)',
      slug: 'khidki-premium-plywood-18mm',
      categorySlug: 'plywood-mdf',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1596700018593-6a568600dcb7?w=500&h=500&fit=crop'
    },
    {
      name: 'Exterior Grade MDF Board 12mm',
      slug: 'khidki-mdf-12mm',
      categorySlug: 'plywood-mdf',
      price: 850,
      image: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=500&h=500&fit=crop'
    },
    {
      name: 'High Density HDHMR Board',
      slug: 'khidki-hdhmr-board',
      categorySlug: 'doors-hdhmr',
      price: 1100,
      image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&h=500&fit=crop'
    },
    {
      name: 'Acrylic Laminate Sheets 1mm',
      slug: 'khidki-acrylic-laminate',
      categorySlug: 'laminates',
      price: 1500,
      image: 'https://images.unsplash.com/photo-1620023472856-3d7120619a9e?w=500&h=500&fit=crop'
    },
    {
      name: 'PVC Liner Laminates',
      slug: 'khidki-pvc-liner',
      categorySlug: 'laminates',
      price: 900,
      image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500&h=500&fit=crop'
    },
    {
      name: 'Industrial Wood Adhesive 5kg',
      slug: 'khidki-wood-adhesive-5kg',
      categorySlug: 'adhesives-hardware',
      price: 1400,
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop'
    },
    {
      name: 'Premium Flush Door',
      slug: 'khidki-flush-door',
      categorySlug: 'doors-hdhmr',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=500&h=500&fit=crop'
    }
  ];

  for (const prod of productsData) {
    const p = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        brand: 'Khidki',
        categoryId: categoryMap[prod.categorySlug],
        vendorId: vendor.id,
        description: `Premium ${prod.name} supplied by Khidki Wholesale.`,
        basePrice: prod.price,
        mrp: Math.floor(prod.price * 1.25),
        gstPercent: 18,
        isActive: true,
        stockStatus: 'IN_STOCK',
        approvalStatus: 'APPROVED'
      }
    });

    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    await prisma.productImage.create({
      data: {
        productId: p.id,
        url: prod.image,
        isPrimary: true,
        sortOrder: 0
      }
    });
  }

  console.log('Products seeded for Khidki Wholesale.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
