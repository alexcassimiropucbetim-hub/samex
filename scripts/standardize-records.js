const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function standardizeAllRecords() {
  console.log("Iniciando padronização de registros para caixa alta (UPPERCASE)...");

  // 1. Igrejas (Church)
  const churches = await prisma.church.findMany();
  let churchUpdates = 0;
  for (const c of churches) {
    const formatted = c.name.trim().toUpperCase();
    if (c.name !== formatted) {
      await prisma.church.update({
        where: { id: c.id },
        data: { name: formatted },
      });
      churchUpdates++;
    }
  }
  console.log(`Igrejas atualizadas: ${churchUpdates} de ${churches.length}`);

  // 2. Ministérios (Ministry)
  const ministries = await prisma.ministry.findMany();
  let ministryUpdates = 0;
  for (const m of ministries) {
    const elderUpper = m.elderName.trim().toUpperCase();
    const coopUpper = m.cooperatorName.trim().toUpperCase();
    if (m.elderName !== elderUpper || m.cooperatorName !== coopUpper) {
      await prisma.ministry.update({
        where: { id: m.id },
        data: { elderName: elderUpper, cooperatorName: coopUpper },
      });
      ministryUpdates++;
    }
  }
  console.log(`Ministérios atualizados: ${ministryUpdates} de ${ministries.length}`);

  // 3. Pré-Avaliações / Candidatos (PreEvaluation)
  const preEvals = await prisma.preEvaluation.findMany();
  let preEvalUpdates = 0;
  for (const pe of preEvals) {
    const candidateNameUpper = pe.candidateName.trim().toUpperCase();
    const instructorNameUpper = pe.instructorName ? pe.instructorName.trim().toUpperCase() : null;
    const instructorChurchNameUpper = pe.instructorChurchName ? pe.instructorChurchName.trim().toUpperCase() : null;
    const meetingElderNameUpper = pe.meetingElderName ? pe.meetingElderName.trim().toUpperCase() : null;
    const meetingLocalityUpper = pe.meetingLocality ? pe.meetingLocality.trim().toUpperCase() : null;

    if (
      pe.candidateName !== candidateNameUpper ||
      pe.instructorName !== instructorNameUpper ||
      pe.instructorChurchName !== instructorChurchNameUpper ||
      pe.meetingElderName !== meetingElderNameUpper ||
      pe.meetingLocality !== meetingLocalityUpper
    ) {
      await prisma.preEvaluation.update({
        where: { id: pe.id },
        data: {
          candidateName: candidateNameUpper,
          instructorName: instructorNameUpper,
          instructorChurchName: instructorChurchNameUpper,
          meetingElderName: meetingElderNameUpper,
          meetingLocality: meetingLocalityUpper,
        },
      });
      preEvalUpdates++;
    }
  }
  console.log(`Pré-avaliações / Candidatos atualizados: ${preEvalUpdates} de ${preEvals.length}`);

  // 4. Encarregados (PersonInCharge)
  const pics = await prisma.personInCharge.findMany();
  let picUpdates = 0;
  for (const p of pics) {
    const fullNameUpper = p.fullName.trim().toUpperCase();
    if (p.fullName !== fullNameUpper) {
      await prisma.personInCharge.update({
        where: { id: p.id },
        data: { fullName: fullNameUpper },
      });
      picUpdates++;
    }
  }
  console.log(`Encarregados atualizados: ${picUpdates} de ${pics.length}`);

  // 5. Agendas de Teste (TestSchedule)
  const schedules = await prisma.testSchedule.findMany();
  let scheduleUpdates = 0;
  for (const ts of schedules) {
    if (ts.elderName) {
      const elderUpper = ts.elderName.trim().toUpperCase();
      if (ts.elderName !== elderUpper) {
        await prisma.testSchedule.update({
          where: { id: ts.id },
          data: { elderName: elderUpper },
        });
        scheduleUpdates++;
      }
    }
  }
  console.log(`Agendas atualizadas: ${scheduleUpdates} de ${schedules.length}`);

  // 6. Setores (Sector)
  const sectors = await prisma.sector.findMany();
  let sectorUpdates = 0;
  for (const s of sectors) {
    const nameUpper = s.name.trim().toUpperCase();
    if (s.name !== nameUpper) {
      await prisma.sector.update({
        where: { id: s.id },
        data: { name: nameUpper },
      });
      sectorUpdates++;
    }
  }
  console.log(`Setores atualizados: ${sectorUpdates} de ${sectors.length}`);

  // 7. Administrações (Administration)
  const adms = await prisma.administration.findMany();
  let admUpdates = 0;
  for (const a of adms) {
    const nameUpper = a.name.trim().toUpperCase();
    if (a.name !== nameUpper) {
      await prisma.administration.update({
        where: { id: a.id },
        data: { name: nameUpper },
      });
      admUpdates++;
    }
  }
  console.log(`Administrações atualizadas: ${admUpdates} de ${adms.length}`);

  // 8. RRM
  const rrms = await prisma.rRM.findMany();
  let rrmUpdates = 0;
  for (const r of rrms) {
    const nameUpper = r.name.trim().toUpperCase();
    if (r.name !== nameUpper) {
      await prisma.rRM.update({
        where: { id: r.id },
        data: { name: nameUpper },
      });
      rrmUpdates++;
    }
  }
  console.log(`RRMs atualizados: ${rrmUpdates} de ${rrms.length}`);

  console.log("Padronização concluída com sucesso!");
}

standardizeAllRecords().catch(console.error).finally(() => prisma.$disconnect());
