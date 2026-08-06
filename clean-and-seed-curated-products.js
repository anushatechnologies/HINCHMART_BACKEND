const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SAMPLE_IMAGES = {
  cement: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
  steel: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
  bricks: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=800&auto=format&fit=crop',
  pipes: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=800&auto=format&fit=crop',
  electrical: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop',
  lighting: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=800&auto=format&fit=crop',
  paints: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop',
  safety: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop'
};

function getImageForCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('cement') || n.includes('concrete') || n.includes('rmc')) return SAMPLE_IMAGES.cement;
  if (n.includes('steel') || n.includes('tmt') || n.includes('rebar') || n.includes('iron') || n.includes('beam')) return SAMPLE_IMAGES.steel;
  if (n.includes('brick') || n.includes('block') || n.includes('paver') || n.includes('tile')) return SAMPLE_IMAGES.bricks;
  if (n.includes('pipe') || n.includes('plumbing') || n.includes('tank') || n.includes('valve')) return SAMPLE_IMAGES.pipes;
  if (n.includes('wire') || n.includes('cable') || n.includes('switch') || n.includes('mcb') || n.includes('electrical')) return SAMPLE_IMAGES.electrical;
  if (n.includes('tool') || n.includes('drill') || n.includes('grinder') || n.includes('fastener') || n.includes('welding') || n.includes('bearing')) return SAMPLE_IMAGES.tools;
  if (n.includes('light') || n.includes('bulb') || n.includes('fan') || n.includes('solar')) return SAMPLE_IMAGES.lighting;
  if (n.includes('paint') || n.includes('adhesive') || n.includes('waterproof') || n.includes('chemical')) return SAMPLE_IMAGES.paints;
  if (n.includes('safety') || n.includes('helmet') || n.includes('glove') || n.includes('shoe')) return SAMPLE_IMAGES.safety;
  return SAMPLE_IMAGES.default;
}

async function main() {
  console.log('🚀 Step 1: Cleaning existing dummy products...');
  
  // Clean dependent relations first
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVideo.deleteMany({});
  await prisma.productDocument.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  
  const deleteResult = await prisma.product.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.count} existing dummy products.`);

  console.log('\n🚀 Step 2: Fetching categories & subcategories...');
  const categories = await prisma.category.findMany({
    include: { children: true }
  });

  const brands = await prisma.brand.findMany({});
  const defaultBrand = brands[0]?.name || 'UltraTech';

  console.log(`Found ${categories.length} total categories in DB.`);

  let createdCount = 0;
  const targetVendorId = 13; // Active vendor

  // Iterate over categories and subcategories to create 1 curated product per leaf category
  for (const cat of categories) {
    const targets = (cat.children && cat.children.length > 0) ? cat.children : [cat];

    for (const sub of targets) {
      const imgUrl = getImageForCategory(sub.name || cat.name);
      const brandObj = brands[createdCount % (brands.length || 1)] || { name: defaultBrand };
      const brandName = brandObj.name || 'UltraTech';
      
      const mrp = Math.floor(Math.random() * 4000) + 500;
      const price = Math.round(mrp * 0.85); // 15% discount
      const stock = Math.floor(Math.random() * 200) + 20;

      const productName = `Premium ${brandName} ${sub.name}`;
      const modelNum = `HM-${sub.id}-${Math.floor(1000 + Math.random() * 9000)}`;
      const slug = `${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sub.id}-${createdCount + 1}`;

      const createdProduct = await prisma.product.create({
        data: {
          vendorId: targetVendorId,
          categoryId: sub.id,
          name: productName,
          slug: slug,
          brand: brandName,
          modelNumber: modelNum,
          description: `High performance, heavy-duty ${sub.name} engineered for commercial construction and industrial projects. ISO 9001 certified for maximum durability and strength.`,
          basePrice: price,
          mrp: mrp,
          gstPercent: 18.0,
          approvalStatus: 'LIVE',
          stockStatus: 'IN_STOCK',
          moq: 1,
          features: [
            'Heavy Duty Construction Grade',
            'ISO 9001 Certified Quality',
            'Weather Resistant & Corrosion Proof',
            'Full Manufacturer Warranty Included'
          ],
          technicalSpecs: {
            'Grade': 'Commercial High Grade',
            'Origin': 'India',
            'Warranty': '1 Year Manufacturer Warranty',
            'Standards': 'IS 1489 / BIS Certified'
          },
          images: {
            create: [
              { url: imgUrl, isPrimary: true, sortOrder: 0 }
            ]
          },
          variants: {
            create: [
              {
                sku: `SKU-${modelNum}-STD`,
                price: price,
                stockQty: stock,
                attributesJson: { unit: '1 Pack / Item' }
              }
            ]
          }
        }
      });

      createdCount++;
      console.log(`  [+${createdCount}] Created product #${createdProduct.id}: "${productName}" (Category ID ${sub.id}: ${sub.name})`);
    }
  }

  console.log(`\n🎉 SUCCESS! Created exactly ${createdCount} curated products (1 per subcategory) for Vendor ${targetVendorId}.`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
