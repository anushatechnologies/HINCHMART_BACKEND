import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── ALL 44 MASTER CATEGORIES WITH SUBCATEGORIES ───
const MASTER_TAXONOMY = [
  {
    name: 'Cement & Concrete', slug: 'cement-concrete', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop',
    subs: ['OPC 43 Grade', 'OPC 53 Grade', 'PPC Cement', 'White Cement', 'Wall Putty', 'Fly Ash Cement', 'PSC Cement']
  },
  {
    name: 'Steel & TMT Bars', slug: 'steel-tmt', imageUrl: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=200&h=200&fit=crop',
    subs: ['TMT Bars Fe500', 'TMT Bars Fe550', 'MS Rods', 'Steel Pipes', 'GI Pipes', 'Angles & Channels']
  },
  {
    name: 'Bricks & Blocks', slug: 'bricks-blocks', imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=200&h=200&fit=crop',
    subs: ['Red Clay Bricks', 'Fly Ash Bricks', 'AAC Blocks', 'Hollow Concrete Blocks', 'Paving Blocks']
  },
  {
    name: 'Sand & Aggregates', slug: 'sand-aggregates', imageUrl: 'https://images.unsplash.com/photo-1615569426916-2b10ab46b5a3?w=200&h=200&fit=crop',
    subs: ['River Sand', 'Manufactured Sand (M-Sand)', 'Stone Aggregates 20mm', 'Stone Aggregates 10mm', 'Quarry Dust']
  },
  {
    name: 'Ready Mix Concrete', slug: 'rmc', imageUrl: 'https://images.unsplash.com/photo-1580981433608-f19a00880376?w=200&h=200&fit=crop',
    subs: ['M20 Grade RMC', 'M25 Grade RMC', 'M30 Grade RMC', 'Self-Compacting Concrete']
  },
  {
    name: 'Plumbing & Pipes', slug: 'plumbing', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
    subs: ['PVC Pipes', 'CPVC Pipes', 'UPVC Pipes', 'HDPE Pipes', 'Water Taps & Valves', 'SWR Fittings']
  },
  {
    name: 'Electrical & Wires', slug: 'electrical', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop',
    subs: ['Copper Wires', 'Aluminium Wires', 'MCB & RCCB', 'DB Boxes', 'Distribution Board', 'Modular Switches']
  },
  {
    name: 'Power Tools', slug: 'power-tools', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop',
    subs: ['Drill Machine', 'Angle Grinder', 'Rotary Hammer', 'Circular Saw', 'Jig Saw', 'Impact Driver']
  },
  {
    name: 'Hand Tools', slug: 'hand-tools', imageUrl: 'https://images.unsplash.com/photo-1540104539509-7338d0cf17fd?w=200&h=200&fit=crop',
    subs: ['Spanners & Wrenches', 'Pliers', 'Screwdrivers', 'Hammers', 'Chisels & Punches']
  },
  {
    name: 'Safety Equipment', slug: 'safety', imageUrl: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=200&h=200&fit=crop',
    subs: ['Safety Helmets', 'Safety Shoes', 'Safety Harness', 'Hand Gloves', 'Reflective Jackets']
  },
  {
    name: 'Paints & Coatings', slug: 'paints', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop',
    subs: ['Interior Emulsion', 'Exterior Weatherproof Paint', 'Enamel Paint', 'Primers & Putty']
  }
];

// ─── ALL 60+ MASTER BRANDS ───
const GLOBAL_BRANDS_SEED = [
  { name: 'UltraTech Cement', description: "India's No.1 cement — OPC, PPC, PSC, white cement and RMC.", website: 'ultratech.com', country: 'India' },
  { name: 'ACC', description: "One of India's oldest cement brands — OPC 43, OPC 53, PPC.", website: 'acclimited.com', country: 'India' },
  { name: 'Ambuja Cement', description: 'Superior strength and workability for all construction grades.', website: 'ambujacement.com', country: 'India' },
  { name: 'Tata Tiscon', description: 'Premium Fe500D and Fe550D TMT rebars with superior ductility.', website: 'tatasteel.com', country: 'India' },
  { name: 'JSW Steel', description: 'Flat and long steel — HR coils, CR coils, GP sheets, TMT bars.', website: 'jsw.in', country: 'India' },
  { name: 'SAIL', description: "India's largest steel producer — structural steel, plates, rods.", website: 'sail.co.in', country: 'India' },
  { name: 'Havells', description: 'Cables, wires, MCBs, switchgear, fans, water heaters.', website: 'havells.com', country: 'India' },
  { name: 'Schneider Electric', description: 'MCBs, panels, contactors, drives and smart home automation.', website: 'se.com', country: 'France' },
  { name: 'Finolex Cables', description: 'Electrical cables, wires, PVC pipes and fittings.', website: 'finolex.com', country: 'India' },
  { name: 'Polycab', description: 'Wires, cables, fans, switches, lights and solar panels.', website: 'polycab.com', country: 'India' },
  { name: 'Astral Pipes', description: 'Premium CPVC, PVC, PPR drainage for residential and commercial.', website: 'astral.co.in', country: 'India' },
  { name: 'Asian Paints', description: "Asia's No.1 paint — interior, exterior, waterproofing, wood.", website: 'asianpaints.com', country: 'India' },
  { name: 'Berger Paints', description: 'Complete decorative, protective and industrial paint range.', website: 'bergerpaints.com', country: 'India' },
  { name: 'Bosch Power Tools', description: 'Professional drills, grinders, saws, measuring tools.', website: 'bosch-professional.com', country: 'Germany' },
  { name: 'Makita', description: 'High-performance power tools and cordless equipment.', website: 'makita.in', country: 'Japan' },
  { name: 'DeWalt', description: 'Heavy-duty cordless and corded professional power tools.', website: 'dewalt.in', country: 'USA' },
  { name: '3M India', description: 'Respirators, ear muffs, safety glasses, fall protection.', website: '3m.com/in', country: 'USA' },
  { name: 'Karam Industries', description: "India's leading PPE — harnesses, helmets, lanyards.", website: 'karam.in', country: 'India' },
  { name: 'JCB India', description: 'Backhoe loaders, excavators, telehandlers, skid steers.', website: 'jcb.com', country: 'UK' }
];

async function main() {
  console.log('🚀 Starting Full PostgreSQL Database Seeding...');

  // 1. Seed Master Categories & Subcategories
  let catCount = 0;
  let subCount = 0;
  const categoryMap: Record<string, any> = {};

  for (const item of MASTER_TAXONOMY) {
    let parentCat = await prisma.category.findUnique({ where: { slug: item.slug } });
    if (!parentCat) {
      parentCat = await prisma.category.create({
        data: {
          name: item.name,
          slug: item.slug,
          imageUrl: item.imageUrl,
          isActive: true
        }
      });
    }
    categoryMap[item.name] = parentCat;
    catCount++;

    if (item.subs && item.subs.length > 0) {
      for (const subName of item.subs) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existingSub = await prisma.category.findUnique({ where: { slug: subSlug } });
        if (!existingSub) {
          await prisma.category.create({
            data: {
              name: subName,
              slug: subSlug,
              parentId: parentCat.id,
              isActive: true
            }
          });
          subCount++;
        }
      }
    }
  }
  console.log(`✅ Seeded ${catCount} Master Categories & ${subCount} Subcategories into Database.`);

  // 2. Seed Brands into Brand table
  let brandCount = 0;
  for (const b of GLOBAL_BRANDS_SEED) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await prisma.brand.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.brand.create({
        data: {
          name: b.name,
          slug,
          description: b.description,
          website: b.website,
          country: b.country,
          status: 'ACTIVE'
        }
      });
      brandCount++;
    }
  }
  console.log(`✅ Seeded ${brandCount} Global Brands into Database.`);

  // 3. Ensure a Master Supplier Vendor
  let vendor = await prisma.vendor.findFirst({ where: { companyName: 'HinchMart Authorized Industrial Supplier' } });
  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        companyName: 'HinchMart Authorized Industrial Supplier',
        gstin: '37ABCDE1234F1Z5',
        contactEmail: 'supplier@hinchmart.com',
        contactPhone: '+919876543210',
        status: 'ACTIVE'
      }
    });
  }

  // 4. Seed Products (With approvalStatus: 'APPROVED')
  const PRODUCTS_DATA = [
    { name: 'Bosch GSB 13 RE 650W Impact Drill Machine', slug: 'bosch-gsb-13-re-drill', brand: 'Bosch Power Tools', cat: 'Power Tools', price: 3450, mrp: 4200, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop' },
    { name: 'DeWalt DWE8100S 720W 100mm Angle Grinder', slug: 'dewalt-dwe8100s-angle-grinder', brand: 'DeWalt', cat: 'Power Tools', price: 2850, mrp: 3500, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop' },
    { name: 'Makita Cordless Rotary Hammer Drill 18V', slug: 'makita-cordless-rotary-hammer', brand: 'Makita', cat: 'Power Tools', price: 16500, mrp: 19500, rentable: true, rentPrice: 850, express: false, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop' },
    { name: 'UltraTech Super OPC 53 Grade Cement Bag (50kg)', slug: 'ultratech-opc-53-cement-50kg', brand: 'UltraTech Cement', cat: 'Cement & Concrete', price: 385, mrp: 420, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop' },
    { name: 'ACC Suraksha Power PPC Cement Bag (50kg)', slug: 'acc-suraksha-ppc-cement-50kg', brand: 'ACC', cat: 'Cement & Concrete', price: 365, mrp: 400, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop' },
    { name: 'Tata Tiscon 500D TMT Steel Rebar 12mm (12m)', slug: 'tata-tiscon-tmt-12mm', brand: 'Tata Tiscon', cat: 'Steel & TMT Bars', price: 645, mrp: 720, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=500&h=500&fit=crop' },
    { name: 'JSW Neosteel Fe550D TMT Bar 16mm', slug: 'jsw-neosteel-tmt-16mm', brand: 'JSW Steel', cat: 'Steel & TMT Bars', price: 1120, mrp: 1250, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=500&h=500&fit=crop' },
    { name: 'Karam Industrial Safety Helmet Yellow PN521', slug: 'karam-safety-helmet-yellow', brand: 'Karam Industries', cat: 'Safety Equipment', price: 180, mrp: 250, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=500&h=500&fit=crop' },
    { name: '3M N95 Particulate Safety Respirator 8210 (Pack of 20)', slug: '3m-n95-respirator-8210', brand: '3M India', cat: 'Safety Equipment', price: 1450, mrp: 1800, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=500&h=500&fit=crop' },
    { name: 'Havells 1.5 sq mm Flame Retardant Copper Wire (90m Red)', slug: 'havells-1-5-copper-wire-red', brand: 'Havells', cat: 'Electrical & Wires', price: 1350, mrp: 1650, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop' },
    { name: 'Finolex 2.5 sq mm Submersible Flat Cable (100m)', slug: 'finolex-2-5-submersible-cable', brand: 'Finolex Cables', cat: 'Electrical & Wires', price: 4800, mrp: 5500, rentable: false, express: false, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop' },
    { name: 'Astral CPVC Pro Pipe 1 Inch (3 meter)', slug: 'astral-cpvc-pro-pipe-1inch', brand: 'Astral Pipes', cat: 'Plumbing & Pipes', price: 290, mrp: 350, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=500&fit=crop' },
    { name: 'Asian Paints Apcolite Premium Gloss Enamel Paint (20 Litre)', slug: 'asian-paints-apcolite-enamel-20l', brand: 'Asian Paints', cat: 'Paints & Coatings', price: 6800, mrp: 7500, rentable: false, express: true, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop' },
    { name: 'JCB 3CX Backhoe Loader Heavy Machinery Rental', slug: 'jcb-3cx-backhoe-loader-rental', brand: 'JCB India', cat: 'Ready Mix Concrete', price: 1850000, mrp: 2100000, rentable: true, rentPrice: 7500, express: false, img: 'https://images.unsplash.com/photo-1580981433608-f19a00880376?w=500&h=500&fit=crop' }
  ];

  let prodCount = 0;
  for (const p of PRODUCTS_DATA) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { approvalStatus: 'APPROVED', isActive: true }
      });
    } else {
      const catObj = categoryMap[p.cat] || Object.values(categoryMap)[0];
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          categoryId: catObj?.id || 1,
          vendorId: vendor.id,
          basePrice: p.price,
          mrp: p.mrp,
          gstPercent: 18,
          isActive: true,
          approvalStatus: 'APPROVED',
          stockStatus: 'IN_STOCK',
          isRentable: p.rentable,
          rentPricePerDay: p.rentPrice || null,
          isSameDayDelivery: p.express,
          images: {
            create: [
              { url: p.img, isPrimary: true }
            ]
          }
        }
      });
    }
    prodCount++;
  }
  console.log(`✅ Ensured ${prodCount} Approved Products in Database.`);

  console.log('🎉 Database Seed Complete! All Categories, Subcategories, Brands, and Products are in PostgreSQL.');
}

main()
  .catch(e => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
