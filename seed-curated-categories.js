const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MASTER_CATEGORIES = [
  {
    name: 'Cement & Concrete',
    slug: 'cement-concrete',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
    subcategories: [
      { name: 'Ordinary Portland Cement (OPC 53/43)', slug: 'opc-cement' },
      { name: 'Portland Pozzolana Cement (PPC)', slug: 'ppc-cement' },
      { name: 'White Cement & Wall Putty', slug: 'white-cement-putty' },
      { name: 'Ready Mix Concrete (RMC)', slug: 'ready-mix-concrete' },
      { name: 'Concrete Blocks & AAC Blocks', slug: 'concrete-aac-blocks' },
    ]
  },
  {
    name: 'Steel & TMT Rebars',
    slug: 'steel-tmt-rebars',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
    subcategories: [
      { name: 'Fe-500 / Fe-550D TMT Bars', slug: 'tmt-rebars' },
      { name: 'Structural Steel Beams & Channels', slug: 'steel-beams-channels' },
      { name: 'MS & GI Pipes / Tubes', slug: 'ms-gi-pipes' },
      { name: 'Binding Wires & Steel Sheets', slug: 'binding-wires-sheets' },
      { name: 'Scaffolding & Formwork Systems', slug: 'scaffolding-formwork' },
    ]
  },
  {
    name: 'Bricks, Blocks & Tiles',
    slug: 'bricks-blocks-tiles',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=800',
    subcategories: [
      { name: 'Red Clay Bricks & Fly Ash Bricks', slug: 'red-clay-fly-ash-bricks' },
      { name: 'AAC Lightweight Blocks', slug: 'aac-blocks' },
      { name: 'Vitrified & Ceramic Floor Tiles', slug: 'floor-tiles' },
      { name: 'Wall & Parking Paver Tiles', slug: 'wall-paver-tiles' },
    ]
  },
  {
    name: 'Plumbing & Drainage',
    slug: 'plumbing-drainage',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=800',
    subcategories: [
      { name: 'CPVC & UPVC Pipes & Fittings', slug: 'cpvc-upvc-pipes' },
      { name: 'SWR & Underground Drainage Pipes', slug: 'swr-drainage-pipes' },
      { name: 'Overhead Water Storage Tanks', slug: 'water-storage-tanks' },
      { name: 'Commercial Valves & Pumps', slug: 'valves-pumps' },
    ]
  },
  {
    name: 'Electricals & Wires',
    slug: 'electricals-wires',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800',
    subcategories: [
      { name: 'FR PVC Insulated Copper Wires', slug: 'copper-wires' },
      { name: 'Armoured Power Cables', slug: 'power-cables' },
      { name: 'MCB & Distribution Boards (DB)', slug: 'mcb-distribution-boards' },
      { name: 'Modular Switches & Sockets', slug: 'modular-switches' },
      { name: 'Commercial LED High-Bay Lighting', slug: 'led-lighting' },
    ]
  },
  {
    name: 'Paints & Waterproofing',
    slug: 'paints-waterproofing',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800',
    subcategories: [
      { name: 'Exterior & Interior Emulsions', slug: 'interior-exterior-emulsions' },
      { name: 'Waterproofing Chemicals & Coatings', slug: 'waterproofing-chemicals' },
      { name: 'Tile Adhesives & Epoxy Grouts', slug: 'tile-adhesives-epoxy' },
      { name: 'Primers & Wood Finishes', slug: 'primers-wood-finishes' },
    ]
  },
  {
    name: 'Construction Machinery & Rentals',
    slug: 'construction-machinery-rentals',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800',
    subcategories: [
      { name: 'Concrete Mixers & Needle Vibrators', slug: 'concrete-mixers-vibrators' },
      { name: 'Earthmoving Excavators & Backhoes', slug: 'excavators-backhoes' },
      { name: 'Tower Cranes & Material Hoists', slug: 'cranes-material-hoists' },
      { name: 'Power Generators & Compressors', slug: 'power-generators-compressors' },
    ]
  }
];

async function seedCuratedCategories() {
  console.log('🌱 Seeding fresh curated building & construction categories...');

  try {
    for (const parentData of MASTER_CATEGORIES) {
      const parent = await prisma.category.create({
        data: {
          name: parentData.name,
          slug: parentData.slug,
          imageUrl: parentData.imageUrl,
          isActive: true
        }
      });
      console.log(`📁 Created Parent Category: ${parent.name}`);

      for (const subData of parentData.subcategories) {
        await prisma.category.create({
          data: {
            name: subData.name,
            slug: subData.slug,
            parentId: parent.id,
            isActive: true
          }
        });
      }
      console.log(`   └─ Created ${parentData.subcategories.length} subcategories for ${parent.name}`);
    }

    console.log('\n🎉 FRESH CURATED CATEGORIES SEEDED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error during category seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCuratedCategories();
