import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding banners...');

  // Create 3 beautiful banners
  const banners = [
    {
      title: 'Massive Discounts on Industrial Machinery',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070',
      linkUrl: '/products?category=heavy-machinery',
      position: 'HERO',
      sortOrder: 1,
      isActive: true
    },
    {
      title: 'Safety Equipment Clearance Sale',
      imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=2070',
      linkUrl: '/products?category=safety-equipment',
      position: 'HERO',
      sortOrder: 2,
      isActive: true
    },
    {
      title: 'Heavy Machinery & Equipment Rentals',
      imageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=2070',
      linkUrl: '/rent',
      position: 'HERO',
      sortOrder: 3,
      isActive: true
    }
  ];

  for (const b of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await prisma.banner.create({ data: b });
      console.log(`Created banner: ${b.title}`);
    }
  }

  console.log('Seeding banners completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
