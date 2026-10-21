const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.testSchedule.findMany({
    include: { church: true },
  });
  console.log(JSON.stringify(tests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
