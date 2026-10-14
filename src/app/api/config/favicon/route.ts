import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "favicon" },
    });

    if (config && config.value) {
      const matches = config.value.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      }
    }

    // Fallback para favicon padrão local
    const defaultFaviconPath = path.join(process.cwd(), "public", "icon-192x192.png");
    if (fs.existsSync(defaultFaviconPath)) {
      const buffer = fs.readFileSync(defaultFaviconPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("Erro ao buscar favicon:", error);
    return new NextResponse(null, { status: 500 });
  }
}
