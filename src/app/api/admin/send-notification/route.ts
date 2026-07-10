import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const authPayload = await getSession();
    if (!authPayload || authPayload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, priority, targetType } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 });
    }

    // In a real app we'd filter by targetType (regional, setor, etc).
    // For now we send to all PersonInCharge users.
    const targets = await prisma.personInCharge.findMany({
      select: { id: true }
    });

    const notifications = targets.map((user) => ({
      personInChargeId: user.id,
      title,
      message,
      priority,
      type: 'SISTEMA'
    }));

    // Create DB notifications in bulk
    await prisma.notification.createMany({
      data: notifications
    });

    // Send push notifications
    // We shouldn't await all of them if the list is huge, but for this scale it's okay.
    // Ideally use a background job/queue.
    const pushPayload = { title, message, link: '/portal', icon: '/icon-192x192.png' };
    
    // We send push in background (not awaiting all sequentially)
    Promise.allSettled(
      targets.map(target => sendNotificationToUser(target.id, pushPayload))
    ).catch(e => console.error("Push delivery error:", e));

    return NextResponse.json({ success: true, sent: targets.length });
  } catch (error) {
    console.error('Error sending push:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
