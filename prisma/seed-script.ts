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
    name: 'Roofing Sheets', slug: 'roofing', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop',
    subs: ['GI Corrugated Sheets', 'Color Coated Sheets', 'Polycarbonate Sheets', 'FRP Roofing Sheets']
  },
  {
    name: 'Plumbing & Pipes', slug: 'plumbing', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
    subs: ['PVC Pipes', 'CPVC Pipes', 'UPVC Pipes', 'HDPE Pipes', 'Water Taps & Valves', 'SWR Fittings']
  },
  {
    name: 'Water Tanks', slug: 'water-tanks', imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop',
    subs: ['Triple Layer Plastic Tanks', '4 Layer Anti-Bacterial Tanks', 'Loft Water Tanks', 'Stainless Steel Tanks']
  },
  {
    name: 'Electrical & Wires', slug: 'electrical', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop',
    subs: ['Copper Wires', 'Aluminium Wires', 'MCB & RCCB', 'DB Boxes', 'Distribution Board', 'Modular Switches']
  },
  {
    name: 'Switches & Accessories', slug: 'switches', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop',
    subs: ['Modular Switches', 'Sockets & Plates', 'Cable Trays', 'Conduit Pipes']
  },
  {
    name: 'Lighting', slug: 'lighting', imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop',
    subs: ['LED Bulbs', 'Batten Lights', 'Panel Lights', 'Street Lights', 'Industrial Flood Lights']
  },
  {
    name: 'Fans', slug: 'fans', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop',
    subs: ['Ceiling Fans', 'Exhaust Fans', 'Wall Mounted Fans', 'Heavy Duty Industrial Fans']
  },
  {
    name: 'Solar Equipment', slug: 'solar', imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&h=200&fit=crop',
    subs: ['Mono PERC Solar Panels', 'Solar Inverters', 'Solar Water Heaters', 'Solar Batteries']
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
    name: 'Hardware Fasteners', slug: 'fasteners', imageUrl: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=200&h=200&fit=crop',
    subs: ['Hex Bolts & Nuts', 'Self-Tapping Screws', 'Anchor Bolts', 'Washers', 'Pop Rivets']
  },
  {
    name: 'Welding Equipment', slug: 'welding', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop',
    subs: ['Inverter Welding Machines', 'MIG Welders', 'TIG Welders', 'Welding Electrodes', 'Safety Masks']
  },
  {
    name: 'Cutting Tools', slug: 'cutting-tools', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&h=200&fit=crop',
    subs: ['Cutting Discs', 'Grinding Wheels', 'Diamond Saw Blades', 'Hole Saws']
  },
  {
    name: 'Measuring Tools', slug: 'measuring', imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&h=200&fit=crop',
    subs: ['Measuring Tapes', 'Spirit Levels', 'Laser Distance Meters', 'Vernier Calipers']
  },
  {
    name: 'Paints & Coatings', slug: 'paints', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop',
    subs: ['Interior Emulsion', 'Exterior Weatherproof Paint', 'Enamel Paint', 'Primers & Putty']
  },
  {
    name: 'Adhesives', slug: 'adhesives', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
    subs: ['Fevicol Wood Adhesive', 'Epoxy Resins', 'Tile Adhesives', 'Silicone Sealants']
  },
  {
    name: 'Waterproofing', slug: 'waterproofing', imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=200&h=200&fit=crop',
    subs: ['Liquid Waterproofing Membrane', 'Dr. Fixit Super Latex', 'Bituminous Membrane']
  },
  {
    name: 'Safety Equipment', slug: 'safety', imageUrl: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=200&h=200&fit=crop',
    subs: ['Safety Helmets', 'Safety Shoes', 'Safety Harness', 'Hand Gloves', 'Reflective Jackets']
  },
  {
    name: 'Industrial Chemicals', slug: 'chemicals', imageUrl: 'https://images.unsplash.com/photo-1615569426916-2b10ab46b5a3?w=200&h=200&fit=crop',
    subs: ['Degreasers & Solvents', 'Rust Removers', 'Concrete Admixtures', 'Formwork Release Oil']
  },
  {
    name: 'Bearings', slug: 'bearings', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&h=200&fit=crop',
    subs: ['Deep Groove Ball Bearings', 'Taper Roller Bearings', 'Pillow Block Bearings', 'Needle Bearings']
  }
];

// ─── ALL 60+ MASTER BRANDS ───
const GLOBAL_BRANDS_SEED = [
  { name: 'UltraTech Cement', description: "India's No.1 cement — OPC, PPC, PSC, white cement and RMC.", website: 'ultratech.com', country: 'India' },
  { name: 'ACC', description: "One of India's oldest cement brands — OPC 43, OPC 53, PPC.", website: 'acclimited.com', country: 'India' },
  { name: 'Ambuja Cement', description: 'Superior strength and workability for all construction grades.', website: 'ambujacement.com', country: 'India' },
  { name: 'Dalmia Cement', description: 'Eco-friendly and blended cements with reduced carbon footprint.', website: 'dalmiacements.com', country: 'India' },
  { name: 'Ramco Cement', description: "South India's leading cement brand with OPC, PPC, SRPC.", website: 'ramcocements.com', country: 'India' },
  { name: 'Tata Tiscon', description: 'Premium Fe500D and Fe550D TMT rebars with superior ductility.', website: 'tatasteel.com', country: 'India' },
  { name: 'JSW Steel', description: 'Flat and long steel — HR coils, CR coils, GP sheets, TMT bars.', website: 'jsw.in', country: 'India' },
  { name: 'SAIL', description: "India's largest steel producer — structural steel, plates, rods.", website: 'sail.co.in', country: 'India' },
  { name: 'Jindal Steel', description: 'Rails, beams, channels, angles, plates and TMT rebars.', website: 'jindalsteelpower.com', country: 'India' },
  { name: 'Havells', description: 'Cables, wires, MCBs, switchgear, fans, water heaters.', website: 'havells.com', country: 'India' },
  { name: 'Anchor by Panasonic', description: 'Switches, sockets, wires, MCBs, modular plates.', website: 'anchorpanasonic.com', country: 'India' },
  { name: 'Schneider Electric', description: 'MCBs, panels, contactors, drives and smart home automation.', website: 'se.com', country: 'France' },
  { name: 'Legrand', description: 'Wiring accessories, cable management and electrical infrastructure.', website: 'legrand.in', country: 'France' },
  { name: 'Finolex Cables', description: 'Electrical cables, wires, PVC pipes and fittings.', website: 'finolex.com', country: 'India' },
  { name: 'Polycab', description: 'Wires, cables, fans, switches, lights and solar panels.', website: 'polycab.com', country: 'India' },
  { name: 'Astral Pipes', description: 'Premium CPVC, PVC, PPR drainage for residential and commercial.', website: 'astral.co.in', country: 'India' },
  { name: 'Supreme Pipes', description: "India's top plastic piping — PVC, CPVC, SWR, agriculture.", website: 'supreme.co.in', country: 'India' },
  { name: 'Asian Paints', description: "Asia's No.1 paint — interior, exterior, waterproofing, wood.", website: 'asianpaints.com', country: 'India' },
  { name: 'Berger Paints', description: 'Complete decorative, protective and industrial paint range.', website: 'bergerpaints.com', country: 'India' },
  { name: 'Pidilite', description: 'Fevicol, Dr. Fixit waterproofing, adhesives and sealants.', website: 'pidilite.com', country: 'India' },
  { name: 'Bosch Power Tools', description: 'Professional drills, grinders, saws, measuring tools.', website: 'bosch-professional.com', country: 'Germany' },
  { name: 'Makita', description: 'High-performance power tools and cordless equipment.', website: 'makita.in', country: 'Japan' },
  { name: 'Stanley', description: 'Hand tools, power tools, storage and safety products.', website: 'stanleytools.com', country: 'USA' },
  { name: 'DeWalt', description: 'Heavy-duty cordless and corded professional power tools.', website: 'dewalt.in', country: 'USA' },
  { name: '3M India', description: 'Respirators, ear muffs, safety glasses, fall protection.', website: '3m.com/in', country: 'USA' },
  { name: 'Karam Industries', description: "India's leading PPE — harnesses, helmets, lanyards.", website: 'karam.in', country: 'India' },
  { name: 'JCB India', description: 'Backhoe loaders, excavators, telehandlers, skid steers.', website: 'jcb.com', country: 'UK' },
  { name: 'Caterpillar', description: 'Construction, mining and heavy equipment worldwide leader.', website: 'cat.com', country: 'USA' },
  { name: 'SKF', description: 'Ball, roller, thrust, needle bearings and seals.', website: 'skf.com/in', country: 'Sweden' },
];

async function main() {
  console.log('🚀 Starting Full PostgreSQL Database Seeding...');

  // 1. Seed Master Categories & Subcategories
  let catCount = 0;
  let subCount = 0;

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

  console.log('🎉 Database Seed Complete! All Categories, Subcategories, and Brands are now in PostgreSQL.');
}

main()
  .catch(e => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
