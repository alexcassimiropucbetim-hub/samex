import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  'mailto:contato@samex.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function sendNotificationToUser(personInChargeId: string, payload: any) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { personInChargeId }
    });

    if (subscriptions.length === 0) return;

    const payloadString = JSON.stringify(payload);

    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payloadString);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription has expired or is no longer valid
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push notification:', err);
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching subscriptions or sending notifications:', error);
  }
}

export async function sendNotificationToAdmin(adminUsername: string, payload: any) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { adminUsername }
    });

    if (subscriptions.length === 0) return;

    const payloadString = JSON.stringify(payload);

    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payloadString);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push notification to admin:', err);
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in sendNotificationToAdmin:', error);
  }
}
