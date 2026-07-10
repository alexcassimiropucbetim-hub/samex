import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authPayload = await getSession();
    if (!authPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { endpoint, keys: { auth, p256dh } } = subscription;

    const data: any = {
      endpoint,
      auth,
      p256dh,
    };

    if (authPayload.type === 'admin') {
      data.adminUsername = authPayload.name;
    } else {
      data.personInChargeId = authPayload.id;
    }

    // Upsert subscription (if endpoint already exists, update it)
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: data,
      create: data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
