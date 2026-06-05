import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "favicon" },
    });

    if (!config || !config.value) {
      return new NextResponse(null, { status: 404 });
    }

    const matches = config.value.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse(null, { status: 404 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar favicon:", error);
    return new NextResponse(null, { status: 500 });
  }
}
