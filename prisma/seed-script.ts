import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // 1. Create 10 Categories
  const categoryNames = [
    'Power Tools',
    'Safety Equipment',
    'Hand Tools',
    'Electricals',
    'Plumbing',
    'Heavy Machinery',
    'Hardware',
    'Paints & Coatings',
    'Material Handling',
    'Industrial Chemicals',
  ];

  const categoryImages = [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop', // Power Tools
    'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=200&h=200&fit=crop', // Safety
    'https://images.unsplash.com/photo-1540104539509-7338d0cf17fd?w=200&h=200&fit=crop', // Hand Tools
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop', // Electricals
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop', // Plumbing
    'https://images.unsplash.com/photo-1580981433608-f19a00880376?w=200&h=200&fit=crop', // Heavy Mach
    'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=200&h=200&fit=crop', // Hardware
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop', // Paints
    'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=200&h=200&fit=crop', // Material handling
    'https://images.unsplash.com/photo-1615569426916-2b10ab46b5a3?w=200&h=200&fit=crop', // Chemicals
  ];

  const categories = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const slug = categoryNames[i].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: categoryNames[i],
          slug,
          imageUrl: categoryImages[i]
        }
      });
    }
    categories.push(cat);
  }
  console.log(`✅ Ensured 10 categories.`);

  // 2. Create 10 Vendors
  const vendorNames = [
    'L&T Construction Supplies',
    'Bosch Power Tools India',
    'Karam Safety Industries',
    'Havells Electricals B2B',
    'Tata Steel Distributors',
    'Asian Paints Industrial',
    'Stanley Black & Decker',
    'Jindal Steel Pipes',
    'Finolex Cables Ltd',
    'Godrej Material Handling',
  ];

  const vendors = [];
  for (let i = 0; i < vendorNames.length; i++) {
    let v = await prisma.vendor.findFirst({ where: { companyName: vendorNames[i] } });
    if (!v) {
      v = await prisma.vendor.create({
        data: {
          companyName: vendorNames[i],
          gstin: `27${Math.random().toString().slice(2, 12)}ZJ`,
          contactEmail: `contact@${vendorNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          contactPhone: `98${Math.random().toString().slice(2, 10)}`,
          status: 'ACTIVE',
        }
      });
    }
    vendors.push(v);
  }
  console.log(`✅ Ensured 10 vendors.`);

  // 15 Brands
  const brandsList = [
    'Bosch', 'DeWalt', 'Makita', 'Karam', '3M', 
    'Havells', 'Schneider', 'Finolex', 'Stanley', 'Taparia', 
    'Tata', 'Jindal', 'Asian Paints', 'Berger', 'Godrej'
  ];

  // 3. Create Products
  const productsToCreate = [
    // Power Tools (Cat 0, Vendor 1, Brands: Bosch, DeWalt, Makita)
    { name: 'Bosch GSB 13 RE Impact Drill', slug: 'bosch-gsb-13', brand: 'Bosch', catIdx: 0, venIdx: 1, basePrice: 2800, mrp: 3500, rentable: false, sameDay: true },
    { name: 'DeWalt DWE8100S Angle Grinder', slug: 'dewalt-angle-grinder', brand: 'DeWalt', catIdx: 0, venIdx: 1, basePrice: 2200, mrp: 2900, rentable: false, sameDay: true },
    { name: 'Makita Cordless Rotary Hammer', slug: 'makita-cordless-rotary', brand: 'Makita', catIdx: 0, venIdx: 1, basePrice: 15500, mrp: 18000, rentable: true, rentPrice: 800, sameDay: false },
    
    // Safety Equipment (Cat 1, Vendor 2, Brands: Karam, 3M)
    { name: 'Karam Full Body Harness PN56', slug: 'karam-harness-pn56', brand: 'Karam', catIdx: 1, venIdx: 2, basePrice: 1200, mrp: 1600, rentable: false, sameDay: true },
    { name: '3M N95 Particulate Respirator 8210 (Pack of 20)', slug: '3m-n95-8210', brand: '3M', catIdx: 1, venIdx: 2, basePrice: 1500, mrp: 2000, rentable: false, sameDay: true },
    { name: 'Industrial Safety Helmet - Yellow', slug: 'karam-helmet-yellow', brand: 'Karam', catIdx: 1, venIdx: 2, basePrice: 150, mrp: 250, rentable: false, sameDay: true },

    // Hand Tools (Cat 2, Vendor 6, Brands: Stanley, Taparia)
    { name: 'Taparia 1041 8-Inch Combination Plier', slug: 'taparia-plier-8', brand: 'Taparia', catIdx: 2, venIdx: 6, basePrice: 180, mrp: 220, rentable: false, sameDay: true },
    { name: 'Stanley 69-GR20B Glue Gun', slug: 'stanley-glue-gun', brand: 'Stanley', catIdx: 2, venIdx: 6, basePrice: 450, mrp: 600, rentable: false, sameDay: true },

    // Electricals (Cat 3, Vendor 3, Brands: Havells, Schneider, Finolex)
    { name: 'Havells 1.5 sq mm PVC Insulated Copper Wire (90m)', slug: 'havells-1-5-wire', brand: 'Havells', catIdx: 3, venIdx: 3, basePrice: 1250, mrp: 1650, rentable: false, sameDay: true },
    { name: 'Schneider Electric MCB 32A 2 Pole', slug: 'schneider-mcb-32a', brand: 'Schneider', catIdx: 3, venIdx: 3, basePrice: 380, mrp: 450, rentable: false, sameDay: true },
    { name: 'Finolex Submersible Flat Cable 2.5 sq mm', slug: 'finolex-submersible-cable', brand: 'Finolex', catIdx: 3, venIdx: 8, basePrice: 4200, mrp: 5000, rentable: false, sameDay: false },

    // Heavy Machinery (Cat 5, Vendor 0, Brands: Tata, Godrej)
    { name: 'Diesel Concrete Mixer Machine 10/7 Cft', slug: 'diesel-concrete-mixer', brand: 'Tata', catIdx: 5, venIdx: 0, basePrice: 95000, mrp: 120000, rentable: true, rentPrice: 2500, minRent: 5, sameDay: false },
    { name: 'Godrej 3 Ton Diesel Forklift', slug: 'godrej-3t-forklift', brand: 'Godrej', catIdx: 5, venIdx: 9, basePrice: 850000, mrp: 950000, rentable: true, rentPrice: 8000, minRent: 15, sameDay: false },
    { name: 'Plate Compactor Machine with Engine', slug: 'plate-compactor', brand: 'Tata', catIdx: 5, venIdx: 0, basePrice: 28000, mrp: 35000, rentable: true, rentPrice: 1200, minRent: 3, sameDay: false },

    // Paints (Cat 7, Vendor 5, Brands: Asian Paints, Berger)
    { name: 'Asian Paints Apcolite Premium Enamel (20L)', slug: 'asian-paints-enamel-20l', brand: 'Asian Paints', catIdx: 7, venIdx: 5, basePrice: 6500, mrp: 7200, rentable: false, sameDay: true },
    { name: 'Berger Bison Acrylic Emulsion (20L)', slug: 'berger-bison-20l', brand: 'Berger', catIdx: 7, venIdx: 5, basePrice: 5800, mrp: 6500, rentable: false, sameDay: true },
  ];

  let addedCount = 0;
  for (const p of productsToCreate) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          categoryId: categories[p.catIdx].id,
          vendorId: vendors[p.venIdx].id,
          basePrice: p.basePrice,
          mrp: p.mrp,
          gstPercent: 18,
          isActive: true,
          stockStatus: 'IN_STOCK',
          isRentable: p.rentable,
          rentPricePerDay: p.rentPrice || null,
          minRentalDays: p.minRent || null,
          isSameDayDelivery: p.sameDay,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop', isPrimary: true }
            ]
          }
        }
      });
      addedCount++;
    }
  }
  console.log(`✅ Seeded ${addedCount} new products (Total ${productsToCreate.length}).`);

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
