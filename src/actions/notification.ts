"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getUnreadNotifications() {
  const session = await getSession();
  if (!session || session.type !== "encarregado") return [];

  try {
    return await prisma.notification.findMany({
      where: {
        personInChargeId: session.id,
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await getSession();
  if (!session || session.type !== "encarregado") return;

  try {
    // Apenas marca como lida se pertencer ao encarregado atual
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (notification?.personInChargeId === session.id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session || session.type !== "encarregado") return;

  try {
    await prisma.notification.updateMany({
      where: {
        personInChargeId: session.id,
        isRead: false
      },
      data: { isRead: true }
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}
