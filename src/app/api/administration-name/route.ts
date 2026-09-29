import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ name: "" });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adm = await prisma.administration.findUnique({ where: { id } });
  if (!adm) return NextResponse.json({ name: "" });

  return NextResponse.json({ name: adm.name });
}
