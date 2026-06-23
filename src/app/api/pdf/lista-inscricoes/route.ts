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

      // Desenhar logo centralizada
      if (logoImage) {
        const logoDims = logoImage.scaleToFit(150, 50);
        const logoX = (A4_LANDSCAPE[0] - logoDims.width) / 2;
        page.drawImage(logoImage, {
          x: logoX,
          y: currentY - logoDims.height + 10,
          width: logoDims.width,
          height: logoDims.height,
        });
        currentY -= logoDims.height + 5;
      }

      const titleText = "LISTA COMPLETA DE INSCRIÇÕES";
      const titleWidth = boldFont.widthOfTextAtSize(titleText, 14);
      const titleX = (A4_LANDSCAPE[0] - titleWidth) / 2;
      
      page.drawText(titleText, { x: titleX, y: currentY, size: 14, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
      currentY -= 15;

      page.drawLine({ start: { x: 40, y: currentY }, end: { x: 800, y: currentY }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      
      currentY -= 20;
      y = currentY; // update global y for rows

      page.drawText("CANDIDATO(A)", { x: 40, y, size: 8.5, font: boldFont });
      page.drawText("CONGREGAÇÃO", { x: 220, y, size: 8.5, font: boldFont });
      page.drawText("ENCARREGADO LOCAL", { x: 400, y, size: 8.5, font: boldFont });
      page.drawText("TIPO DE TESTE", { x: 550, y, size: 8.5, font: boldFont });
      page.drawText("AGENDAMENTO", { x: 670, y, size: 8.5, font: boldFont });
      
      y -= 10;
      page.drawLine({ start: { x: 40, y }, end: { x: 800, y }, thickness: 1, color: rgb(0, 0, 0) });
      y -= 15;
    };

    drawHeaders();

    const truncate = (str: string, max: number) => (str.length > max ? str.substring(0, max - 3) + "..." : str);

    const getFirstTwoNames = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) return `${parts[0]} ${parts[1]}`;
      return parts[0] || "";
    };

    for (const req of preEvaluations) {
      if (y < 40) {
        page = pdfDoc.addPage(A4_LANDSCAPE);
        drawHeaders();
      }

      const nome = truncate(req.candidateName.toUpperCase(), 40);
      const congregacao = truncate(req.church.name.toUpperCase(), 35);
      const encarregado = truncate(getFirstTwoNames(req.personInCharge.fullName).toUpperCase(), 30);
      const teste = truncate(req.testType.name.toUpperCase(), 25);
      
      let agendamento = "Não agendado";
      if (req.scheduledDate) {
        const d = new Date(req.scheduledDate);
        const quemAgendou = req.scheduler?.fullName ? ` (${getFirstTwoNames(req.scheduler.fullName)})` : "";
        agendamento = `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}${quemAgendou}`;
      }
      
      // truncar agendamento se ficar muito longo
      agendamento = truncate(agendamento.toUpperCase(), 40);

      page.drawText(nome, { x: 40, y, size: 8, font });
      page.drawText(congregacao, { x: 220, y, size: 8, font });
      page.drawText(encarregado, { x: 400, y, size: 8, font });
      page.drawText(teste, { x: 550, y, size: 8, font });
      page.drawText(agendamento, { x: 670, y, size: 8, font });

      y -= 5;
      page.drawLine({ start: { x: 40, y }, end: { x: 800, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y -= 15;
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
