import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMusicoLetter } from "@/lib/pdfGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  try {
    const preEvaluation = await prisma.preEvaluation.findUnique({
      where: { id },
      include: {
        church: {
          include: {
            ministry: true,
          }
        },
        instrument: true,
        testType: true,
        personInCharge: true,
      }
    });

    if (!preEvaluation) {
      return NextResponse.json({ error: "Pré-avaliação não encontrada" }, { status: 404 });
    }

    const pdfBytesModified = await generateMusicoLetter(preEvaluation);

    return new NextResponse(pdfBytesModified as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Pedido_Musico_${preEvaluation.candidateName.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
