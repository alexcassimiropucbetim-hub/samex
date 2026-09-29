const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const counts = {
      RRM: await prisma.rRM.count().catch(() => -1),
      Administration: await prisma.administration.count().catch(() => -1),
      Admin: await prisma.admin.count().catch(() => -1),
      Sector: await prisma.sector.count().catch(() => -1),
      Evaluator: await prisma.evaluator.count().catch(() => -1),
      Church: await prisma.church.count().catch(() => -1),
      PreEvaluation: await prisma.preEvaluation.count().catch(() => -1),
      TestSchedule: await prisma.testSchedule.count().catch(() => -1),
      PersonInCharge: await prisma.personInCharge.count().catch(() => -1),
    };

    const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });

    const checkNotNull = async (table, col) => {
      const res = await prisma.$queryRawUnsafe(`SELECT is_nullable FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${col}'`);
      return res[0]?.is_nullable === 'NO';
    };

    const checkUnique = async (table, col) => {
      const res = await prisma.$queryRawUnsafe(`
        SELECT count(*) > 0 as is_unique
        FROM information_schema.key_column_usage AS c
        LEFT JOIN information_schema.table_constraints AS t
        ON t.constraint_name = c.constraint_name
        WHERE t.table_name = '${table}' AND c.column_name = '${col}' AND t.constraint_type = 'UNIQUE'
      `);
      return res[0]?.is_unique;
    };

    const schema = {
      RRM_Created: counts.RRM !== -1,
      Administration_Created: counts.Administration !== -1,
      AdminRole_Created: admin?.role !== undefined,
      Administration_rrmId_Required: await checkNotNull('Administration', 'rrmId'),
      Sector_administrationId_Required: await checkNotNull('Sector', 'administrationId'),
      Evaluator_administrationId_Required: await checkNotNull('Evaluator', 'administrationId'),
      Church_sectorId_Required: await checkNotNull('Church', 'sectorId'),
      Admin_role_Created: admin?.role !== undefined,
      Admin_administrationId_Created: 'administrationId' in (admin || {}),
      Admin_administrationId_Unique: await checkUnique('Admin', 'administrationId')
    };

    const adminHashPreserved = admin && admin.password && admin.password.startsWith('$2');

    // don't log the password
    if (admin) delete admin.password;

    console.log(JSON.stringify({ counts, admin, schema, adminHashPreserved }, null, 2));
  } catch (error) {
    console.error("Error verifying:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
