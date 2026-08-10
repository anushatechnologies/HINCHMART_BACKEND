const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBanners() {
  const banners = await prisma.banner.findMany();
  console.log(JSON.stringify(banners, null, 2));
}

checkBanners().finally(() => process.exit(0));
