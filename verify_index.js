const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Admin' AND indexname = 'Admin_administrationId_key'
    `);
    console.log("Index:", res);
  } finally {
    await prisma.$disconnect();
  }
}
main();
