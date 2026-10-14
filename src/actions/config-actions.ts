"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getAuthenticatedAdmin } from "@/lib/auth-scope";

export async function saveConfig(key: string, value: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    throw new Error("Acesso negado. Administrador não autenticado.");
  }

  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Sincronizar arquivos estáticos em disco para compatibilidade máxima (PDFs, SSR, PWA, navegadores)
    if (key === "logo" && typeof value === "string" && value.startsWith("data:")) {
      const matches = value.match(/^data:(.+);base64,([\s\S]+)$/);
      if (matches && matches[2]) {
        const buffer = Buffer.from(matches[2].replace(/\s/g, ""), "base64");
        const logoPng = path.join(process.cwd(), "public", "logo.png");
        const samexPng = path.join(process.cwd(), "public", "samex-logo.png");
        fs.writeFileSync(logoPng, buffer);
        fs.writeFileSync(samexPng, buffer);
      }
    }

    if (key === "favicon" && typeof value === "string" && value.startsWith("data:")) {
      const matches = value.match(/^data:(.+);base64,([\s\S]+)$/);
      if (matches && matches[2]) {
        const buffer = Buffer.from(matches[2].replace(/\s/g, ""), "base64");
        const iconPng = path.join(process.cwd(), "public", "icon-192x192.png");
        const icon512Png = path.join(process.cwd(), "public", "icon-512x512.png");
        const pubFavicon = path.join(process.cwd(), "public", "favicon.ico");
        const appFavicon = path.join(process.cwd(), "src", "app", "favicon.ico");
        
        try {
          const sharp = require("sharp");
          await sharp(buffer).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(iconPng);
          await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(icon512Png);
        } catch {
          fs.writeFileSync(iconPng, buffer);
          fs.writeFileSync(icon512Png, buffer);
        }

        fs.writeFileSync(pubFavicon, buffer);
        if (fs.existsSync(path.dirname(appFavicon))) {
          fs.writeFileSync(appFavicon, buffer);
        }
      }
    }
    
    // Revalidar rotas para aplicar imediatamente
    revalidatePath("/", "layout");
    revalidatePath("/portal", "layout");
    revalidatePath("/(admin)", "layout");
    revalidatePath("/configuracoes");
    
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao salvar config ${key}:`, error);
    return { success: false, error: error?.message || "Erro interno ao salvar." };
  }
}

export async function getConfig(key: string) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value || null;
  } catch (error) {
    console.error(`Erro ao buscar config ${key}:`, error);
    return null;
  }
}
