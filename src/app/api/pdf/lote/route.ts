import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";
import { generateLetterForPreEvaluation } from "@/lib/pdfGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "IDs não fornecidos" }, { status: 400 });
  }

  const ids = idsParam.split(',').map(id => id.trim()).filter(id => id);

  try {
    const preEvaluations = await prisma.preEvaluation.findMany({
      where: { id: { in: ids } },
      include: {
        church: {
          include: {
            ministry: true,
          }
        },
        instructorChurch: true,
        instrument: true,
        testType: true,
        personInCharge: true,
        currentInstrument: true,
      }
    });

    if (preEvaluations.length === 0) {
      return NextResponse.json({ error: "Nenhuma pré-avaliação encontrada" }, { status: 404 });
    }

    // Sort to keep the requested order, or just use the DB order
    const orderedEvaluations = ids
      .map(id => preEvaluations.find(p => p.id === id))
      .filter(p => p !== undefined);

    // Create the master PDF Document
    const masterPdfDoc = await PDFDocument.create();

    const A4_LANDSCAPE = [842.89, 595.28];
    const A4_PORTRAIT_WIDTH = 595.28;
    const A4_PORTRAIT_HEIGHT = 842.89;

    // Scale to fit height of Landscape (595.28)
    const scaleFactor = 595.28 / A4_PORTRAIT_HEIGHT; 
    const scaledWidth = A4_PORTRAIT_WIDTH * scaleFactor;
    
    // Width of half the landscape page
    const halfLandscapeWidth = A4_LANDSCAPE[0] / 2;
    
    // Center the page horizontally in its half
    const offsetX = (halfLandscapeWidth - scaledWidth) / 2;

    for (let i = 0; i < orderedEvaluations.length; i += 2) {
      const page = masterPdfDoc.addPage([A4_LANDSCAPE[0], A4_LANDSCAPE[1]]);
      
      const leftEval = orderedEvaluations[i];
      const rightEval = orderedEvaluations[i + 1];

      // Left page
      if (leftEval) {
        const leftBytes = await generateLetterForPreEvaluation(leftEval);
        const leftDoc = await PDFDocument.load(leftBytes);
        const [leftEmbedded] = await masterPdfDoc.embedPdf(leftBytes);
        
        page.drawPage(leftEmbedded, {
          x: offsetX,
          y: 0,
          xScale: scaleFactor,
          yScale: scaleFactor,
        });
      }

      // Right page
      if (rightEval) {
        const rightBytes = await generateLetterForPreEvaluation(rightEval);
        const rightDoc = await PDFDocument.load(rightBytes);
        const [rightEmbedded] = await masterPdfDoc.embedPdf(rightBytes);
        
        page.drawPage(rightEmbedded, {
          x: halfLandscapeWidth + offsetX,
          y: 0,
          xScale: scaleFactor,
          yScale: scaleFactor,
        });
      }
    }

    const finalPdfBytes = await masterPdfDoc.save();

    return new NextResponse(finalPdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Lote_Impressao_Cartas.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar PDF em Lote:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
