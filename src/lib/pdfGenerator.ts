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
