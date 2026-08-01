import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed Khidki Wholesale vendor...');

  const passwordHash = await bcrypt.hash('khidki123', 10);

  // Check if already exists
  let vendor = await prisma.vendor.findFirst({
    where: { contactPhone: '+918388899999' }
  });

  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        companyName: 'Khidki Wholesale',
        ownerName: 'Nilakshi',
        businessType: 'WHOLESALER',
        contactEmail: 'contact@khidkiwholesale.com',
        contactPhone: '+918388899999',
        passwordHash,
        status: 'APPROVED',
        pickupAddress: 'Hyderabad', // Only Hyderabad as requested
        aboutStore: 'We provide Plywood, MDF, HDHMR, Hardware, Adhesives, Laminates, Flush Doors, and more. Best prices for all interior materials in Hyderabad.',
      }
    });
    console.log('Created Vendor:', vendor.companyName);
  } else {
    console.log('Vendor already exists:', vendor.companyName);
    // Update to be sure
    vendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        status: 'APPROVED',
        pickupAddress: 'Hyderabad'
      }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
