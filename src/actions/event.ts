"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function createEvent(formData: FormData) {
  const session = await getSession();
  if (session?.type !== "admin") {
    throw new Error("Acesso negado");
  }

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;

  if (!title || !dateStr || !type) {
    throw new Error("Preencha todos os campos obrigatórios");
  }

  // dateStr expected in "YYYY-MM-DDTHH:mm"
  const date = new Date(dateStr);

  await prisma.event.create({
    data: {
      title,
      date,
      type,
      description,
    },
  });

  revalidatePath("/", "layout");
}

export async function updateEvent(id: string, formData: FormData) {
  const session = await getSession();
  if (session?.type !== "admin") {
    throw new Error("Acesso negado");
  }

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;

  if (!title || !dateStr || !type) {
    throw new Error("Preencha todos os campos obrigatórios");
  }

  const date = new Date(dateStr);

  await prisma.event.update({
    where: { id },
    data: {
      title,
      date,
      type,
      description,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (session?.type !== "admin") {
    throw new Error("Acesso negado");
  }

  await prisma.event.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
}
