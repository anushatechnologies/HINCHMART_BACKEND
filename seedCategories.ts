import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Construction",
    icon: "🏗️",
    children: [
      "Cement", "Steel", "Sand", "Bricks", "Roofing", "Waterproofing", "TMT Bars", "Blocks", "Aggregate", "Tiles"
    ]
  },
  {
    name: "Hardware",
    icon: "🔩",
    children: [
      "Nuts", "Bolts", "Fasteners", "Hinges", "Locks", "Door Hardware"
    ]
  },
  {
    name: "Electrical",
    icon: "🔌",
    children: [
      "Switches", "Wires", "Cables", "Lighting", "MCB", "Fans", "Distribution Boards"
    ]
  },
  {
    name: "Plumbing",
    icon: "🚰",
    children: [
      "PVC Pipes", "CPVC Pipes", "Bathroom Fittings", "Valves", "Water Tanks"
    ]
  },
  {
    name: "Paint",
    icon: "🎨",
    children: [
      "Interior Paint", "Exterior Paint", "Primer", "Putty", "Waterproof Coating"
    ]
  },
  {
    name: "Power Tools",
    icon: "⚡",
    children: [
      "Drills", "Grinders", "Saws", "Sanders", "Routers", "Air Compressors"
    ]
  },
  {
    name: "Hand Tools",
    icon: "🔨",
    children: [
      "Hammers", "Wrenches", "Screwdrivers", "Pliers", "Measuring Tapes", "Levels"
    ]
  },
  {
    name: "Safety",
    icon: "🦺",
    children: [
      "Helmets", "Gloves", "Safety Shoes", "Goggles", "Jackets", "Masks", "Harnesses"
    ]
  },
  {
    name: "Gardening",
    icon: "🌱",
    children: [
      "Watering Equipment", "Garden Tools", "Fertilizers", "Seeds", "Outdoor Accessories", "Mowers"
    ]
  },
  {
    name: "Industrial",
    icon: "🏭",
    children: [
      "Bearings", "Motors", "Pumps", "Conveyors", "Material Handling", "Valves"
    ]
  },
  {
    name: "Cleaning",
    icon: "🧹",
    children: [
      "Industrial Cleaners", "Brooms", "Mops", "Vacuum Cleaners", "Waste Bins"
    ]
  },
  {
    name: "Bathroom",
    icon: "🛁",
    children: [
      "Sanitaryware", "Faucets", "Showers", "Mirrors", "Accessories"
    ]
  },
  {
    name: "Kitchen",
    icon: "🍳",
    children: [
      "Sinks", "Faucets", "Cabinets", "Hardware", "Appliances"
    ]
  },
  {
    name: "Home Improvement",
    icon: "🏠",
    children: [
      "Furniture Hardware", "Storage", "Decor", "Lighting", "Smart Home"
    ]
  }
];

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Clearing existing categories...');
  // Delete all existing categories to avoid duplicates or conflicts
  await prisma.category.deleteMany();
  console.log('Categories cleared.');

  console.log('Seeding new taxonomy...');

  for (const parent of categories) {
    // 1. Create Parent
    const parentCategory = await prisma.category.create({
      data: {
        name: parent.name,
        slug: generateSlug(parent.name),
        imageUrl: parent.icon, // Repurposing imageUrl for icon temporarily
        isActive: true
      }
    });

    console.log(`Created Parent: ${parent.name}`);

    // 2. Create Children
    for (const childName of parent.children) {
      await prisma.category.create({
        data: {
          name: childName,
          slug: generateSlug(`${parent.name}-${childName}`), // Ensuring unique slug
          parentId: parentCategory.id,
          isActive: true
        }
      });
      console.log(`  -> Created Child: ${childName}`);
    }
  }

  console.log('Taxonomy seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
