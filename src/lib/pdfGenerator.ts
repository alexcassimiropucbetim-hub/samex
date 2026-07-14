import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generateMusicoLetter(preEvaluation: any): Promise<Uint8Array> {
  const pdfPath = path.join(process.cwd(), "public", "pedidos-exame", "MUSICOS.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const fontSize = 10;
  const color = rgb(0, 0, 0);

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear().toString();

  page.drawText("Betim", { x: 270, y: 765, size: fontSize, color });
  page.drawText(day, { x: 430, y: 765, size: fontSize, color });
  page.drawText(month, { x: 470, y: 765, size: fontSize, color });
  page.drawText(year, { x: 545, y: 765, size: fontSize, color });

  const testTypeName = preEvaluation.testType.name.toUpperCase();
  const xSize = 12;
  if (testTypeName.includes("REUNIÃO DE JOVEM")) {
    page.drawText("X", { x: 263, y: 738, size: xSize, color });
  } else if (testTypeName.includes("CULTO OFICIAL")) {
    page.drawText("X", { x: 401, y: 738, size: xSize, color });
  } else if (testTypeName.includes("OFICIALIZAÇÃO")) {
    page.drawText("X", { x: 502, y: 738, size: xSize, color });
  }

  page.drawText(preEvaluation.candidateName.toUpperCase(), { x: 45, y: 687, size: fontSize, color });
  page.drawText(preEvaluation.church.name.toUpperCase(), { x: 45, y: 657, size: fontSize, color });
  page.drawText(preEvaluation.instrument.name.toUpperCase(), { x: 335, y: 657, size: fontSize, color });

  const elderName = preEvaluation.church.ministry?.elderName?.toUpperCase() || "";
  const cooperatorName = preEvaluation.church.ministry?.cooperatorName?.toUpperCase() || "";
  const personInChargeName = preEvaluation.personInCharge?.fullName?.toUpperCase() || "";

  page.drawText(elderName, { x: 75, y: 375, size: fontSize, color });
  page.drawText(cooperatorName, { x: 75, y: 332, size: fontSize, color });
  page.drawText(personInChargeName, { x: 75, y: 288, size: fontSize, color });

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: 245,
    color: rgb(1, 1, 1),
  });

  // Área de Estudo Dirigido
  page.drawText("ESTUDO DIRIGIDO:", { x: 45, y: 220, size: 10, color });
  
  const evalResult = preEvaluation.evaluationResult;
  let hasEstudoData = false;

  const drawColumnTitle = (text: string, x: number, y: number, width: number) => {
    page.drawRectangle({ x, y: y - 3, width, height: 14, color: rgb(0.9, 0.9, 0.9) });
    page.drawText(text.toUpperCase(), { x: x + 5, y: y + 1, size: 9, color: rgb(0,0,0) });
  };

  if (evalResult) {
    let y1 = 205;
    let y2 = 205;

    if (evalResult.msaLessons) {
      try {
        const parsed = JSON.parse(evalResult.msaLessons);
        if (parsed.length > 0) {
          const firstMethod = typeof parsed[0] === 'object' ? parsed[0].methodName : "";
          drawColumnTitle(firstMethod ? `TEORIA: ${firstMethod}` : "TEORIA", 45, y1, 245);
          y1 -= 14;
          parsed.forEach((p: any, i: number) => {
            if (i % 2 !== 0) {
              page.drawRectangle({ x: 45, y: y1 - 3, width: 245, height: 12, color: rgb(0.95, 0.95, 0.95) });
            }
            if (typeof p === 'string') {
              page.drawText(`- ${p}`, { x: 50, y: y1, size: 9, color });
            } else {
              page.drawText(`Pág: ${p.page || '---'}`, { x: 50, y: y1, size: 9, color });
              page.drawText(`Lição: ${p.lesson || '---'}`, { x: 140, y: y1, size: 9, color });
            }
            y1 -= 12;
          });
          hasEstudoData = true;
        }
      } catch (e) {}
    }

    if (evalResult.methodLessons) {
      try {
        const parsed = JSON.parse(evalResult.methodLessons);
        if (parsed.length > 0) {
          const firstMethod = typeof parsed[0] === 'object' ? parsed[0].methodName : "";
          drawColumnTitle(firstMethod ? `PRÁTICA: ${firstMethod}` : "PRÁTICA", 300, y2, 245);
          y2 -= 14;
          parsed.forEach((p: any, i: number) => {
            if (i % 2 !== 0) {
              page.drawRectangle({ x: 300, y: y2 - 3, width: 245, height: 12, color: rgb(0.95, 0.95, 0.95) });
            }
            if (typeof p === 'string') {
              page.drawText(`- ${p}`, { x: 305, y: y2, size: 9, color });
            } else {
              page.drawText(`Pág: ${p.page || '---'}`, { x: 305, y: y2, size: 9, color });
              page.drawText(`Lição: ${p.lesson || '---'}`, { x: 395, y: y2, size: 9, color });
            }
            y2 -= 12;
          });
          hasEstudoData = true;
        }
      } catch (e) {}
    }

    let finalY = Math.min(y1, y2) - 10;

    if (evalResult.hymns) {
      try {
        const parsed = JSON.parse(evalResult.hymns);
        if (parsed.length > 0) {
          drawColumnTitle("HINOS", 45, finalY, 500);
          finalY -= 14;
          const text = parsed.join(", ");
          if (text.length > 100) {
            page.drawText(text.substring(0, 100), { x: 50, y: finalY, size: 9, color });
            finalY -= 12;
            page.drawText(text.substring(100, 200), { x: 50, y: finalY, size: 9, color });
          } else {
            page.drawText(text, { x: 50, y: finalY, size: 9, color });
          }
          finalY -= 12;
          hasEstudoData = true;
        }
      } catch (e) {}
    }
  }

  if (!hasEstudoData) {
    for (let i = 0; i < 4; i++) {
      const lineY = 195 - (i * 25);
      page.drawLine({
        start: { x: 45, y: lineY },
        end: { x: 550, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}

export async function generateOrganistaLetter(preEvaluation: any): Promise<Uint8Array> {
  const pdfPath = path.join(process.cwd(), "public", "pedidos-exame", "ORGANISTAS.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const fontSize = 10;
  const color = rgb(0, 0, 0);

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear().toString();

  page.drawText("Betim", { x: 270, y: 765, size: fontSize, color });
  page.drawText(day, { x: 430, y: 765, size: fontSize, color });
  page.drawText(month, { x: 470, y: 765, size: fontSize, color });
  page.drawText(year, { x: 545, y: 765, size: fontSize, color });

  const testTypeName = preEvaluation.testType.name.toUpperCase();
  const xSize = 12;
  if (testTypeName.includes("REUNIÃO DE JOVEM")) {
    page.drawText("X", { x: 263, y: 738, size: xSize, color });
  } else if (testTypeName.includes("CULTO OFICIAL")) {
    page.drawText("X", { x: 401, y: 738, size: xSize, color });
  } else if (testTypeName.includes("OFICIALIZAÇÃO")) {
    page.drawText("X", { x: 502, y: 738, size: xSize, color });
  }

  page.drawText(preEvaluation.candidateName.toUpperCase(), { x: 45, y: 687, size: fontSize, color });
  page.drawText(preEvaluation.church.name.toUpperCase(), { x: 45, y: 655, size: fontSize, color });
  
  const instructorName = preEvaluation.instructorName?.toUpperCase() || "";
  const instructorChurchName = preEvaluation.instructorChurch?.name?.toUpperCase() || preEvaluation.instructorChurchName?.toUpperCase() || "";
  
  if (instructorName) {
    page.drawText(instructorName, { x: 45, y: 550, size: fontSize, color });
  }
  if (instructorChurchName) {
    page.drawText(instructorChurchName, { x: 45, y: 520, size: fontSize, color });
  }

  const elderName = preEvaluation.church.ministry?.elderName?.toUpperCase() || "";
  const cooperatorName = preEvaluation.church.ministry?.cooperatorName?.toUpperCase() || "";
  const personInChargeName = preEvaluation.personInCharge?.fullName?.toUpperCase() || "";

  page.drawText(elderName, { x: 75, y: 320, size: fontSize, color });
  page.drawText(cooperatorName, { x: 75, y: 280, size: fontSize, color });
  page.drawText(personInChargeName, { x: 75, y: 240, size: fontSize, color });

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: 195,
    color: rgb(1, 1, 1),
  });

  // Área de Estudo Dirigido
  page.drawText("ESTUDO DIRIGIDO:", { x: 45, y: 175, size: 10, color });
  
  const evalResultOrg = preEvaluation.evaluationResult;
  let hasEstudoDataOrg = false;

  const drawColumnTitleOrg = (text: string, x: number, y: number, width: number) => {
    page.drawRectangle({ x, y: y - 3, width, height: 14, color: rgb(0.9, 0.9, 0.9) });
    page.drawText(text.toUpperCase(), { x: x + 5, y: y + 1, size: 9, color: rgb(0,0,0) });
  };

  if (evalResultOrg) {
    let y1 = 160;
    let y2 = 160;

    if (evalResultOrg.msaLessons) {
      try {
        const parsed = JSON.parse(evalResultOrg.msaLessons);
        if (parsed.length > 0) {
          const firstMethod = typeof parsed[0] === 'object' ? parsed[0].methodName : "";
          drawColumnTitleOrg(firstMethod ? `TEORIA: ${firstMethod}` : "TEORIA", 45, y1, 245);
          y1 -= 14;
          parsed.forEach((p: any, i: number) => {
            if (i % 2 !== 0) {
              page.drawRectangle({ x: 45, y: y1 - 3, width: 245, height: 12, color: rgb(0.95, 0.95, 0.95) });
            }
            if (typeof p === 'string') {
              page.drawText(`- ${p}`, { x: 50, y: y1, size: 9, color });
            } else {
              page.drawText(`Pág: ${p.page || '---'}`, { x: 50, y: y1, size: 9, color });
              page.drawText(`Lição: ${p.lesson || '---'}`, { x: 140, y: y1, size: 9, color });
            }
            y1 -= 12;
          });
          hasEstudoDataOrg = true;
        }
      } catch (e) {}
    }

    if (evalResultOrg.methodLessons) {
      try {
        const parsed = JSON.parse(evalResultOrg.methodLessons);
        if (parsed.length > 0) {
          const firstMethod = typeof parsed[0] === 'object' ? parsed[0].methodName : "";
          drawColumnTitleOrg(firstMethod ? `PRÁTICA: ${firstMethod}` : "PRÁTICA", 300, y2, 245);
          y2 -= 14;
          parsed.forEach((p: any, i: number) => {
            if (i % 2 !== 0) {
              page.drawRectangle({ x: 300, y: y2 - 3, width: 245, height: 12, color: rgb(0.95, 0.95, 0.95) });
            }
            if (typeof p === 'string') {
              page.drawText(`- ${p}`, { x: 305, y: y2, size: 9, color });
            } else {
              page.drawText(`Pág: ${p.page || '---'}`, { x: 305, y: y2, size: 9, color });
              page.drawText(`Lição: ${p.lesson || '---'}`, { x: 395, y: y2, size: 9, color });
            }
            y2 -= 12;
          });
          hasEstudoDataOrg = true;
        }
      } catch (e) {}
    }

    let finalY = Math.min(y1, y2) - 10;

    if (evalResultOrg.hymns) {
      try {
        const parsed = JSON.parse(evalResultOrg.hymns);
        if (parsed.length > 0) {
          drawColumnTitleOrg("HINOS", 45, finalY, 500);
          finalY -= 14;
          const text = parsed.join(", ");
          if (text.length > 100) {
            page.drawText(text.substring(0, 100), { x: 50, y: finalY, size: 9, color });
            finalY -= 12;
            page.drawText(text.substring(100, 200), { x: 50, y: finalY, size: 9, color });
          } else {
            page.drawText(text, { x: 50, y: finalY, size: 9, color });
          }
          finalY -= 12;
          hasEstudoDataOrg = true;
        }
      } catch (e) {}
    }
  }

  if (!hasEstudoDataOrg) {
    for (let i = 0; i < 4; i++) {
      const lineY = 150 - (i * 25);
      page.drawLine({
        start: { x: 45, y: lineY },
        end: { x: 550, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}

export async function generateTrocaInstrumentoLetter(preEvaluation: any): Promise<Uint8Array> {
  const pdfPath = path.join(process.cwd(), "public", "pedidos-exame", "TROCA_DE_INSTRUMENTO.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const fontSize = 10;
  const color = rgb(0, 0, 0);

  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear().toString();

  page.drawText("Betim", { x: 270, y: 765, size: fontSize, color });
  page.drawText(day, { x: 430, y: 765, size: fontSize, color });
  page.drawText(month, { x: 470, y: 765, size: fontSize, color });
  page.drawText(year, { x: 545, y: 765, size: fontSize, color });

  const testTypeName = preEvaluation.testType.name.toUpperCase();
  const xSize = 12;
  if (testTypeName.includes("REUNIÃO DE JOVEM")) {
    page.drawText("X", { x: 263, y: 738, size: xSize, color });
  } else if (testTypeName.includes("CULTO OFICIAL")) {
    page.drawText("X", { x: 401, y: 738, size: xSize, color });
  } else if (testTypeName.includes("OFICIALIZAÇÃO")) {
    page.drawText("X", { x: 502, y: 738, size: xSize, color });
  }

  page.drawText(preEvaluation.candidateName.toUpperCase(), { x: 45, y: 707, size: fontSize, color });
  page.drawText(preEvaluation.church.name.toUpperCase(), { x: 45, y: 677, size: fontSize, color });
  
  if (preEvaluation.officializationDate) {
    const dateParts = preEvaluation.officializationDate.split('-');
    if (dateParts.length === 3) {
      page.drawText(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`, { x: 470, y: 707, size: fontSize, color });
    } else {
      page.drawText(preEvaluation.officializationDate, { x: 470, y: 707, size: fontSize, color });
    }
  }

  const currentInst = preEvaluation.currentInstrument?.name.toUpperCase() || "";
  const currentTon = preEvaluation.currentTonality?.toUpperCase() || "";
  const currentStr = currentTon ? `${currentInst} - ${currentTon}` : currentInst;
  page.drawText(currentStr, { x: 45, y: 622, size: fontSize, color });

  const desiredInst = preEvaluation.instrument?.name.toUpperCase() || "";
  const desiredTon = preEvaluation.desiredTonality?.toUpperCase() || "";
  const desiredStr = desiredTon ? `${desiredInst} - ${desiredTon}` : desiredInst;
  page.drawText(desiredStr, { x: 320, y: 622, size: fontSize, color });

  if (preEvaluation.orchestraNeed) {
    page.drawText("X", { x: 28, y: 593, size: xSize, color });
  }
  if (preEvaluation.illness) {
    page.drawText("X", { x: 165, y: 593, size: xSize, color });
  }

  const elderName = preEvaluation.church.ministry?.elderName?.toUpperCase() || "";
  const cooperatorName = preEvaluation.church.ministry?.cooperatorName?.toUpperCase() || "";
  const personInChargeName = preEvaluation.personInCharge?.fullName?.toUpperCase() || "";

  page.drawText(elderName, { x: 75, y: 402, size: fontSize, color });
  page.drawText(cooperatorName, { x: 75, y: 357, size: fontSize, color });
  page.drawText(personInChargeName, { x: 75, y: 269, size: fontSize, color });

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: 230,
    color: rgb(1, 1, 1),
  });

  return await pdfDoc.save();
}

export async function generateLetterForPreEvaluation(preEvaluation: any): Promise<Uint8Array> {
  const testTypeName = preEvaluation.testType.name.toUpperCase();
  if (testTypeName.includes('TROCA DE INSTRUMENTO')) {
    return generateTrocaInstrumentoLetter(preEvaluation);
  } else if (preEvaluation.gender === 'M') {
    return generateMusicoLetter(preEvaluation);
  } else {
    return generateOrganistaLetter(preEvaluation);
  }
}
