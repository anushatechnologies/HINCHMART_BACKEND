import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── ALL MASTER CATEGORIES WITH SUBCATEGORIES ───
const MASTER_TAXONOMY = [
  {
    name: 'Cement & Concrete', slug: 'cement-concrete', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
    subs: ['OPC 43 Grade', 'OPC 53 Grade', 'PPC Cement', 'White Cement', 'Wall Putty', 'Fly Ash Cement', 'PSC Cement']
  },
  {
    name: 'Steel & TMT Bars', slug: 'steel-tmt', imageUrl: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=400&h=400&fit=crop',
    subs: ['TMT Bars Fe500', 'TMT Bars Fe550', 'MS Rods', 'Steel Pipes', 'GI Pipes', 'Angles & Channels']
  },
  {
    name: 'Bricks & Blocks', slug: 'bricks-blocks', imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&h=400&fit=crop',
    subs: ['Red Clay Bricks', 'Fly Ash Bricks', 'AAC Blocks', 'Hollow Concrete Blocks', 'Paving Blocks']
  },
  {
    name: 'Sand & Aggregates', slug: 'sand-aggregates', imageUrl: 'https://images.unsplash.com/photo-1615569426916-2b10ab46b5a3?w=400&h=400&fit=crop',
    subs: ['River Sand', 'Manufactured Sand (M-Sand)', 'Stone Aggregates 20mm', 'Stone Aggregates 10mm', 'Quarry Dust']
  },
  {
    name: 'Ready Mix Concrete', slug: 'rmc', imageUrl: 'https://images.unsplash.com/photo-1580981433608-f19a00880376?w=400&h=400&fit=crop',
    subs: ['M20 Grade RMC', 'M25 Grade RMC', 'M30 Grade RMC', 'Self-Compacting Concrete']
  },
  {
    name: 'Plumbing & Pipes', slug: 'plumbing', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
    subs: ['PVC Pipes', 'CPVC Pipes', 'UPVC Pipes', 'HDPE Pipes', 'Water Taps & Valves', 'SWR Fittings']
  },
  {
    name: 'Electrical & Wires', slug: 'electrical', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop',
    subs: ['Copper Wires', 'Aluminium Wires', 'MCB & RCCB', 'DB Boxes', 'Distribution Board', 'Modular Switches']
  },
  {
    name: 'Power Tools', slug: 'power-tools', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    subs: ['Drill Machine', 'Angle Grinder', 'Rotary Hammer', 'Circular Saw', 'Jig Saw', 'Impact Driver']
  },
  {
    name: 'Hand Tools', slug: 'hand-tools', imageUrl: 'https://images.unsplash.com/photo-1540104539509-7338d0cf17fd?w=400&h=400&fit=crop',
    subs: ['Spanners & Wrenches', 'Pliers', 'Screwdrivers', 'Hammers', 'Chisels & Punches']
  },
  {
    name: 'Safety Equipment', slug: 'safety', imageUrl: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=400&h=400&fit=crop',
    subs: ['Safety Helmets', 'Safety Shoes', 'Safety Harness', 'Hand Gloves', 'Reflective Jackets']
  },
  {
    name: 'Paints & Coatings', slug: 'paints', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
    subs: ['Interior Emulsion', 'Exterior Weatherproof Paint', 'Enamel Paint', 'Primers & Putty']
  }
];

// ─── MASTER BRANDS ───
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

// Product Generation Data Blueprints
const CATALOG_BLUEPRINTS = [
  {
    category: 'Power Tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
    brands: ['Bosch Power Tools', 'Makita', 'DeWalt'],
    items: [
      { name: 'Professional Impact Drill Machine 650W', basePrice: 3450, mrp: 4200 },
      { name: 'Cordless Rotary Hammer Drill 18V SDS Plus', basePrice: 16500, mrp: 19500, rentable: true, rentPrice: 850 },
      { name: 'Heavy Duty Angle Grinder 720W 100mm', basePrice: 2850, mrp: 3500 },
      { name: 'Circular Saw Machine 1400W 185mm', basePrice: 5200, mrp: 6400 },
      { name: 'Variable Speed Jig Saw 600W', basePrice: 4100, mrp: 4900 },
      { name: 'Brushless Cordless Impact Driver 20V Max', basePrice: 12400, mrp: 14800 },
      { name: 'Marble & Tile Cutter 1250W 110mm', basePrice: 3100, mrp: 3800 },
      { name: 'Electric Bench Grinder 250W 150mm', basePrice: 2600, mrp: 3200 },
      { name: 'Demolition Breaker Hammer 1500W 25J', basePrice: 24500, mrp: 28900, rentable: true, rentPrice: 1200 },
      { name: 'Heat Gun Dual Temperature 1800W', basePrice: 1950, mrp: 2400 },
      { name: 'Cordless Screwdriver Kit 3.6V with Bits', basePrice: 2200, mrp: 2700 },
      { name: 'Electric Planner Machine 600W 82mm', basePrice: 4800, mrp: 5700 },
      { name: 'Straight Die Grinder 500W 28000 RPM', basePrice: 3900, mrp: 4600 },
      { name: 'Laser Distance Meter 50M Range', basePrice: 3600, mrp: 4300 }
    ]
  },
  {
    category: 'Cement & Concrete',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop',
    brands: ['UltraTech Cement', 'ACC', 'Ambuja Cement'],
    items: [
      { name: 'Super OPC 53 Grade High-Strength Cement (50kg Bag)', basePrice: 385, mrp: 430 },
      { name: 'Weatherproof PPC Cement Bag (50kg Bag)', basePrice: 365, mrp: 410 },
      { name: 'PSC Slag Cement (50kg Bag)', basePrice: 350, mrp: 395 },
      { name: 'Premium White Cement (25kg Bag)', basePrice: 650, mrp: 750 },
      { name: 'Waterproof Polymer Wall Putty (40kg Bag)', basePrice: 780, mrp: 890 },
      { name: 'Ready Mix Mortar Paste (50kg Bag)', basePrice: 290, mrp: 340 },
      { name: 'Micro Concrete Polymer Modified Repair Mortar (25kg)', basePrice: 920, mrp: 1050 },
      { name: 'Non-Shrink Construction Grout (25kg Bag)', basePrice: 850, mrp: 980 },
      { name: 'Tile Adhesive High-Bond C2TE (20kg Bag)', basePrice: 420, mrp: 510 },
      { name: 'Waterproofing Liquid Additive (5 Litre)', basePrice: 580, mrp: 690 }
    ]
  },
  {
    category: 'Steel & TMT Bars',
    image: 'https://images.unsplash.com/photo-1533626904905-cc52fd99285e?w=500&h=500&fit=crop',
    brands: ['Tata Tiscon', 'JSW Steel', 'SAIL'],
    items: [
      { name: 'High-Ductility TMT Rebar Fe500D 8mm (12m Bar)', basePrice: 340, mrp: 390 },
      { name: 'High-Ductility TMT Rebar Fe500D 10mm (12m Bar)', basePrice: 490, mrp: 560 },
      { name: 'High-Ductility TMT Rebar Fe500D 12mm (12m Bar)', basePrice: 645, mrp: 720 },
      { name: 'High-Yield TMT Rebar Fe550D 16mm (12m Bar)', basePrice: 1120, mrp: 1250 },
      { name: 'High-Yield TMT Rebar Fe550D 20mm (12m Bar)', basePrice: 1780, mrp: 1990 },
      { name: 'High-Yield TMT Rebar Fe550D 25mm (12m Bar)', basePrice: 2790, mrp: 3100 },
      { name: 'MS Equal Angle 50x50x5mm (6m Length)', basePrice: 1850, mrp: 2100 },
      { name: 'MS Channel ISMC 100x50mm (6m Length)', basePrice: 3200, mrp: 3600 },
      { name: 'GI Square Hollow Pipe 2x2 Inch (6m Length)', basePrice: 1450, mrp: 1680 },
      { name: 'HR Steel Plate 6mm Thickness (8x4 Ft Sheet)', basePrice: 8900, mrp: 9900 }
    ]
  },
  {
    category: 'Electrical & Wires',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    brands: ['Havells', 'Schneider Electric', 'Finolex Cables', 'Polycab'],
    items: [
      { name: 'Flame Retardant (FR) Copper Wire 1.0 sq mm 90m (Red)', basePrice: 980, mrp: 1200 },
      { name: 'Flame Retardant (FR) Copper Wire 1.5 sq mm 90m (Black)', basePrice: 1350, mrp: 1650 },
      { name: 'Flame Retardant (FR) Copper Wire 2.5 sq mm 90m (Blue)', basePrice: 2150, mrp: 2600 },
      { name: 'Flame Retardant (FR) Copper Wire 4.0 sq mm 90m (Yellow)', basePrice: 3300, mrp: 3950 },
      { name: 'Submersible 3 Core Flat Cable 2.5 sq mm (100m Roll)', basePrice: 4800, mrp: 5600 },
      { name: 'Single Pole MCB 16A C-Curve 10kA', basePrice: 185, mrp: 240 },
      { name: 'Double Pole MCB 32A C-Curve 10kA', basePrice: 420, mrp: 520 },
      { name: 'Four Pole RCCB 63A 30mA Sensitivity', basePrice: 2450, mrp: 2950 },
      { name: '8-Way Vertical Metal DB Box Enclosure', basePrice: 1250, mrp: 1550 },
      { name: 'Modular Switch 6A 1-Way (Pack of 20)', basePrice: 640, mrp: 800 },
      { name: 'Modular Power Socket 16A with Shutter (Pack of 10)', basePrice: 850, mrp: 1050 },
      { name: 'Industrial Plug & Socket 32A 3-Pin IP44', basePrice: 780, mrp: 950 }
    ]
  },
  {
    category: 'Plumbing & Pipes',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=500&fit=crop',
    brands: ['Astral Pipes', 'Finolex Cables'],
    items: [
      { name: 'CPVC Pro Pressure Pipe 3/4 Inch (3 Meter)', basePrice: 220, mrp: 270 },
      { name: 'CPVC Pro Pressure Pipe 1 Inch (3 Meter)', basePrice: 290, mrp: 350 },
      { name: 'CPVC Pro Pressure Pipe 1.5 Inch (3 Meter)', basePrice: 510, mrp: 610 },
      { name: 'UPVC Agriculture Pipe 90mm 4Kg/cm² (6 Meter)', basePrice: 680, mrp: 800 },
      { name: 'SWR Drainage Pipe with Ring 110mm (3 Meter)', basePrice: 430, mrp: 510 },
      { name: 'Brass Threaded Ball Valve 1 Inch Heavy Duty', basePrice: 380, mrp: 460 },
      { name: 'CPVC Solvent Cement 250ml Tin', basePrice: 195, mrp: 240 },
      { name: 'Gate Valve Cast Iron 2 Inch PN16', basePrice: 1850, mrp: 2200 },
      { name: 'HDPE Water Pipe 50mm 6Kg/cm² (100 Meter Coil)', basePrice: 5400, mrp: 6300 }
    ]
  },
  {
    category: 'Safety Equipment',
    image: 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=500&h=500&fit=crop',
    brands: ['3M India', 'Karam Industries'],
    items: [
      { name: 'Ratchet Adjustment HDPE Safety Helmet (Yellow)', basePrice: 180, mrp: 250 },
      { name: 'Ratchet Adjustment HDPE Safety Helmet (White)', basePrice: 190, mrp: 260 },
      { name: 'Steel Toe Heavy Duty Safety Shoes S1P (Size 8)', basePrice: 1250, mrp: 1600 },
      { name: 'Full Body Safety Harness with Double Lanyard & Shock Absorber', basePrice: 1850, mrp: 2300 },
      { name: 'N95 Particulate Respirator Mask 8210 (Pack of 20)', basePrice: 1450, mrp: 1800 },
      { name: 'High-Visibility Reflective Safety Jacket (Orange)', basePrice: 140, mrp: 200 },
      { name: 'Cut-Resistant Nitrile Coated Safety Hand Gloves (Pack of 10 Pairs)', basePrice: 650, mrp: 850 },
      { name: 'Anti-Scratch Clear Lens Safety Goggles', basePrice: 120, mrp: 170 },
      { name: 'Noise Reduction Ear Muffs NRR 25dB', basePrice: 480, mrp: 620 }
    ]
  },
  {
    category: 'Paints & Coatings',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop',
    brands: ['Asian Paints', 'Berger Paints'],
    items: [
      { name: 'Apcolite Premium Gloss Enamel Paint (20 Litre)', basePrice: 6800, mrp: 7500 },
      { name: 'Tractor Emulsion Smooth Interior Paint (20 Litre)', basePrice: 2450, mrp: 2850 },
      { name: 'Apex Weatherproof Exterior Emulsion (20 Litre)', basePrice: 5400, mrp: 6100 },
      { name: 'Royale Luxury Interior Emulsion (10 Litre)', basePrice: 4800, mrp: 5400 },
      { name: 'SmartCare Dampproof Waterproof Coating (20 Litre)', basePrice: 6200, mrp: 7100 },
      { name: 'Universal Exterior Wall Primer (20 Litre)', basePrice: 2100, mrp: 2450 },
      { name: 'Epoxy Anti-Corrosive Metal Primer (4 Litre)', basePrice: 1650, mrp: 1950 },
      { name: 'WoodTech PU Gloss Exterior Clear Polish (4 Litre)', basePrice: 2900, mrp: 3350 }
    ]
  },
  {
    category: 'Bricks & Blocks',
    image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&h=500&fit=crop',
    brands: ['UltraTech Cement', 'ACC'],
    items: [
      { name: 'Autoclaved Aerated Concrete (AAC) Blocks 600x200x100mm', basePrice: 55, mrp: 68 },
      { name: 'Autoclaved Aerated Concrete (AAC) Blocks 600x200x150mm', basePrice: 82, mrp: 98 },
      { name: 'Autoclaved Aerated Concrete (AAC) Blocks 600x200x200mm', basePrice: 110, mrp: 130 },
      { name: 'High-Density Fly Ash Bricks (Per 1000 Pcs)', basePrice: 4500, mrp: 5200 },
      { name: 'First Class Red Clay Kiln Bricks (Per 1000 Pcs)', basePrice: 6800, mrp: 7600 },
      { name: 'Heavy Duty Interlocking Paving Block 60mm (Per Sq Ft)', basePrice: 38, mrp: 45 },
      { name: 'Solid Concrete Masonry Block 400x200x200mm', basePrice: 48, mrp: 58 }
    ]
  },
  {
    category: 'Sand & Aggregates',
    image: 'https://images.unsplash.com/photo-1615569426916-2b10ab46b5a3?w=500&h=500&fit=crop',
    brands: ['UltraTech Cement'],
    items: [
      { name: 'Washed Manufactured Sand M-Sand for Concrete (Per Brass / 100 Cu Ft)', basePrice: 4200, mrp: 4800 },
      { name: 'Plastering M-Sand Fine Grade (Per Brass / 100 Cu Ft)', basePrice: 4600, mrp: 5200 },
      { name: 'Crushed Stone Aggregates 20mm (Per Brass / 100 Cu Ft)', basePrice: 3800, mrp: 4300 },
      { name: 'Crushed Stone Aggregates 10mm (Per Brass / 100 Cu Ft)', basePrice: 3950, mrp: 4500 },
      { name: 'Quarry Dust Filling Powder (Per Brass / 100 Cu Ft)', basePrice: 1950, mrp: 2300 }
    ]
  },
  {
    category: 'Ready Mix Concrete',
    image: 'https://images.unsplash.com/photo-1580981433608-f19a00880376?w=500&h=500&fit=crop',
    brands: ['UltraTech Cement', 'ACC', 'JCB India'],
    items: [
      { name: 'M20 Grade Ready Mix Concrete Transit Mixer Delivery (Per CuM)', basePrice: 4100, mrp: 4600 },
      { name: 'M25 Grade Ready Mix Concrete Transit Mixer Delivery (Per CuM)', basePrice: 4400, mrp: 4950 },
      { name: 'M30 Grade Ready Mix Concrete Transit Mixer Delivery (Per CuM)', basePrice: 4750, mrp: 5350 },
      { name: 'M35 Grade High Performance Concrete (Per CuM)', basePrice: 5200, mrp: 5800 },
      { name: '3CX Backhoe Loader Heavy Earthmoving Machine (Daily Rental)', basePrice: 1850000, mrp: 2100000, rentable: true, rentPrice: 7500 },
      { name: '220LC Hydraulic Crawler Excavator Heavy Duty (Daily Rental)', basePrice: 4500000, mrp: 5200000, rentable: true, rentPrice: 16500 }
    ]
  },
  {
    category: 'Hand Tools',
    image: 'https://images.unsplash.com/photo-1540104539509-7338d0cf17fd?w=500&h=500&fit=crop',
    brands: ['Bosch Power Tools', 'Stanley'],
    items: [
      { name: 'Combination Spanner Wrench Set 6mm to 32mm (26 Pcs)', basePrice: 2800, mrp: 3400 },
      { name: 'Professional Heavy Duty Combination Pliers 8 Inch', basePrice: 380, mrp: 480 },
      { name: 'Magnetic Screwdriver Set Chrome Vanadium Steel (10 Pcs)', basePrice: 650, mrp: 820 },
      { name: 'Claw Hammer 500g Fiber Handle', basePrice: 340, mrp: 440 },
      { name: 'Adjustable Pipe Wrench 14 Inch Heavy Duty Steel Body', basePrice: 720, mrp: 900 },
      { name: 'Spirit Level Aluminum Tool 600mm 3 Vials', basePrice: 580, mrp: 720 }
    ]
  }
];

async function main() {
  console.log('🚀 Starting Expanded 350+ Products Database Seeding...');

  // 1. Seed Master Categories & Subcategories
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
        }
      }
    }
  }

  // 2. Seed Master Brands
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
    }
  }

  // 3. Ensure Master Supplier Vendor
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

  // 4. Generate & Seed 350+ Products Programmatically Across Blueprints
  let createdCount = 0;

  // We loop blueprint catalog items to generate ~350 distinct product variations
  const totalTarget = 350;
  let counter = 1;

  while (createdCount < totalTarget) {
    for (const blueprint of CATALOG_BLUEPRINTS) {
      for (const baseItem of blueprint.items) {
        if (createdCount >= totalTarget) break;

        const brandIndex = (counter - 1) % blueprint.brands.length;
        const brandName = blueprint.brands[brandIndex];
        const catObj = categoryMap[blueprint.category];

        const fullName = `${brandName} ${baseItem.name} - Model #${1000 + counter}`;
        const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const existing = await prisma.product.findUnique({ where: { slug } });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: { approvalStatus: 'APPROVED', isActive: true }
          });
        } else {
          await prisma.product.create({
            data: {
              name: fullName,
              slug: slug,
              brand: brandName,
              categoryId: catObj?.id || 1,
              vendorId: vendor.id,
              basePrice: baseItem.basePrice,
              mrp: baseItem.mrp,
              gstPercent: 18,
              modelNumber: `HM-SKU-${10000 + counter}`,
              description: `High performance industrial grade ${fullName} engineered for commercial and civil projects. Conforms to IS quality specifications.`,
              approvalStatus: 'APPROVED',
              isActive: true,
              stockStatus: 'IN_STOCK',
              isRentable: Boolean(baseItem.rentable),
              rentPricePerDay: baseItem.rentPrice || null,
              isSameDayDelivery: counter % 2 === 0,
              images: {
                create: [
                  { url: blueprint.image, isPrimary: true }
                ]
              }
            }
          });
        }

        createdCount++;
        counter++;
      }
    }
  }

  console.log(`✅ Successfully seeded ${createdCount} Approved Master Products into PostgreSQL Database!`);
  console.log('🎉 Database Seeding Complete! All 350+ Products are active.');
}

main()
  .catch(e => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
