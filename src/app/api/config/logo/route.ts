import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "logo" },
    });

    if (config && config.value) {
      // value is stored as "data:image/png;base64,iVBORw0KGgo..."
      const matches = config.value.match(/^data:(.+);base64,([\s\S]+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2].replace(/\s/g, "");
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      }
    }

    // Fallback para imagem padrão local do SAMEX
    const samexLogo = path.join(process.cwd(), "public", "samex-logo.png");
    const logoPng = path.join(process.cwd(), "public", "logo.png");
    const fallbackPath = fs.existsSync(samexLogo) ? samexLogo : (fs.existsSync(logoPng) ? logoPng : null);
    
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("Erro ao buscar logo:", error);
    return new NextResponse(null, { status: 500 });
  }
}

