import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
    const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
    const isAdmin = session?.type === "admin";

    let preEvaluations = await prisma.preEvaluation.findMany({
      include: {
        sector: true,
        church: true,
        personInCharge: true,
        testType: true,
        scheduler: true,
        testEvaluator: true,
        evaluationResult: {
          include: {
            evaluator: true
          }
        },
      },
      orderBy: { createdAt: "desc" }
    });

    if (isExaminadora) {
      preEvaluations = preEvaluations.filter(p => p.gender === "F");
    } else if (isRegional) {
      // all
    } else if (!isAdmin) {
      preEvaluations = preEvaluations.filter(p => p.churchId === session?.churchId);
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Buscar logo do banco de dados
    let logoImage = null;
    try {
      const config = await prisma.systemConfig.findUnique({ where: { key: "logo" } });
      if (config && config.value) {
        const matches = config.value.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          if (mimeType.includes("png")) {
            logoImage = await pdfDoc.embedPng(buffer);
          } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
            logoImage = await pdfDoc.embedJpg(buffer);
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar logo no PDF:", e);
    }

    const A4_LANDSCAPE: [number, number] = [842.89, 595.28];
    let page = pdfDoc.addPage(A4_LANDSCAPE);
    let y = 540;

    const drawHeaders = () => {
      let currentY = 560;

      // Desenhar logo à esquerda
      let sloganY = currentY - 5;
      if (logoImage) {
        const logoDims = logoImage.scaleToFit(150, 50);
        page.drawImage(logoImage, {
          x: 25,
          y: currentY - logoDims.height + 10,
          width: logoDims.width,
          height: logoDims.height,
        });
        sloganY = currentY - logoDims.height - 2;
      }

      // Slogan do sistema
      page.drawText("Sistema de Administração Musical de Exames", { 
        x: 25, 
        y: sloganY, 
        size: 8, 
        font, 
        color: rgb(0.4, 0.4, 0.4) 
      });

      // Textos alinhados à direita
      const rightX = 815;
      const drawRightAligned = (text: string, size: number, fontToUse: any, yPos: number, color = rgb(0,0,0)) => {
        const w = fontToUse.widthOfTextAtSize(text, size);
        page.drawText(text, { x: rightX - w, y: yPos, size, font: fontToUse, color });
      };

      const titleText = "LISTA DE INSCRIÇÕES";
      const localTeste = "Local de Teste: ________________________________";
      const dataTeste = "Data: _____ / _____ / __________";
      const totalCandidatos = `Total de candidatos: ${preEvaluations.length}`;

      drawRightAligned(titleText, 14, boldFont, currentY, rgb(0.1, 0.2, 0.4));
      drawRightAligned(localTeste, 10, font, currentY - 15);
      drawRightAligned(dataTeste, 10, font, currentY - 30);
      drawRightAligned(totalCandidatos, 10, boldFont, currentY - 45);

      currentY -= 80; // Aumentei o espaço aqui para evitar que a tabela sobreponha o slogan
      y = currentY; // update global y for rows

      const orangeColor = rgb(0.976, 0.451, 0.086); // tailwind orange-500 aproximado
      const whiteColor = rgb(1, 1, 1);

      page.drawRectangle({
        x: 25,
        y: y - 6,
        width: 790,
        height: 20,
        color: orangeColor,
      });

      page.drawText("CANDIDATO(A)", { x: 30, y, size: 8.5, font: boldFont, color: whiteColor });
      page.drawText("CONGREGAÇÃO", { x: 200, y, size: 8.5, font: boldFont, color: whiteColor });
      page.drawText("ENCARREGADO LOCAL", { x: 330, y, size: 8.5, font: boldFont, color: whiteColor });
      page.drawText("TIPO DE TESTE", { x: 450, y, size: 8.5, font: boldFont, color: whiteColor });
      page.drawText("AGENDAMENTO", { x: 540, y, size: 8.5, font: boldFont, color: whiteColor });
      page.drawText("RESULTADO", { x: 680, y, size: 8.5, font: boldFont, color: whiteColor });
      
      y -= 15;
    };

    drawHeaders();

    const wrapText = (text: string, maxWidth: number, fontToUse: any, size: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = fontToUse.widthOfTextAtSize(currentLine + " " + word, size);
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const getFirstTwoNames = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) return `${parts[0]} ${parts[1]}`;
      return parts[0] || "";
    };

    let rowIndex = 0;

    for (const req of preEvaluations) {
      const nomeStr = req.candidateName.toUpperCase();
      const congregacaoStr = req.church.name.toUpperCase();
      const encarregadoStr = getFirstTwoNames(req.personInCharge.fullName).toUpperCase();
      const testeStr = req.testType.name.toUpperCase();
      
      let agendamentoStr = "NÃO AGENDADO";
      if (req.scheduledDate) {
        const d = new Date(req.scheduledDate);
        const quemAgendou = req.scheduler?.fullName 
          ? ` (${getFirstTwoNames(req.scheduler.fullName)})` 
          : req.testEvaluator?.fullName
            ? ` (${getFirstTwoNames(req.testEvaluator.fullName)})`
            : " (ADMIN)";
        agendamentoStr = `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}${quemAgendou}`.toUpperCase();
      }

      let resultadoStr = "PENDENTE";
      if (req.status === "APROVADO" || req.status === "REPROVADO") {
        const avaliador = req.evaluationResult?.evaluator?.fullName 
          ? ` POR ${getFirstTwoNames(req.evaluationResult.evaluator.fullName).toUpperCase()}` 
          : "";
        
        let dataAvaliacao = "";
        if (req.evaluationResult?.createdAt) {
          const d = new Date(req.evaluationResult.createdAt);
          dataAvaliacao = ` EM ${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}`;
        }
        
        resultadoStr = `${req.status}${dataAvaliacao}${avaliador}`.toUpperCase();
      }

      const nomeLines = wrapText(nomeStr, 165, font, 8);
      const congLines = wrapText(congregacaoStr, 125, font, 8);
      const encLines = wrapText(encarregadoStr, 115, font, 8);
      const testLines = wrapText(testeStr, 85, font, 8);
      const agendLines = wrapText(agendamentoStr, 135, font, 8);
      const resLines = wrapText(resultadoStr, 140, font, 8);

      const maxLines = Math.max(nomeLines.length, congLines.length, encLines.length, testLines.length, agendLines.length, resLines.length);
      const rowHeight = (maxLines * 12) + 16; // 12pt line height + padding

      if (y - rowHeight < 40) {
        page = pdfDoc.addPage(A4_LANDSCAPE);
        drawHeaders();
      }

      // Draw background (zebra) and border for the row
      page.drawRectangle({
        x: 25,
        y: y + 8 - rowHeight,
        width: 790,
        height: rowHeight,
        color: rowIndex % 2 !== 0 ? rgb(0.96, 0.97, 0.98) : rgb(1, 1, 1),
        borderColor: rgb(0.957, 0.957, 0.957), // #F4F4F4
        borderWidth: 1,
      });

      const drawWrapped = (lines: string[], startX: number) => {
        const emptySpace = rowHeight - (lines.length * 12);
        const marginTop = emptySpace / 2;
        const startY = (y + 8) - marginTop - 8;

        lines.forEach((line, i) => {
          page.drawText(line, { x: startX, y: startY - (i * 12), size: 8, font });
        });
      };

      drawWrapped(nomeLines, 30);
      drawWrapped(congLines, 200);
      drawWrapped(encLines, 330);
      drawWrapped(testLines, 450);
      drawWrapped(agendLines, 540);
      drawWrapped(resLines, 680);

      y -= rowHeight;
      
      rowIndex++;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Lista_Inscricoes.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar PDF da lista:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
