"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveConfig(key: string, value: string) {
  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    
    // Revalidar rotas para aplicar imediatamente
    revalidatePath("/");
    revalidatePath("/portal");
    revalidatePath("/(admin)", "layout");
    
    return { success: true };
  } catch (error) {
    console.error(`Erro ao salvar config ${key}:`, error);
    return { success: false, error: "Erro interno ao salvar." };
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
