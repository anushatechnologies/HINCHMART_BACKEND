const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hinchmart_access_secret_2024!';

async function testToken() {
  const admin = await prisma.admin.findFirst();
  if (!admin) return console.log("No admin found");

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  console.log("Generated Token:", token);
  
  // verify it
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log("Verify OK:", payload);
  } catch (e) {
    console.log("Verify Failed:", e.message);
  }
}

testToken().finally(() => process.exit(0));
