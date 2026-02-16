import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

function getAdminApp() {
  const adminAppName = "admin-test";
  const existingApp = getApps().find((app) => app.name === adminAppName);
  if (existingApp) return existingApp;
  return initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "studio-1765347057-3bb5c",
  }, adminAppName);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const webpush = require("web-push");

  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  console.log("[SEND-PUSH] VAPID public key present:", !!publicKey, "length:", publicKey.length);
  console.log("[SEND-PUSH] VAPID private key present:", !!privateKey, "length:", privateKey.length);

  webpush.setVapidDetails(
    "mailto:infopittima@zannalabs.com",
    publicKey,
    privateKey
  );

  const app = getAdminApp();
  const db = getFirestore(app);

  const docPath = "users/" + userId;
  console.log("[SEND-PUSH] Reading Firestore doc:", docPath);
  const userDoc = await db.doc(docPath).get();
  const userData = userDoc.data();
  console.log("[SEND-PUSH] User doc exists:", userDoc.exists, "has fcmTokens:", !!userData?.fcmTokens);
  const subscriptions: string[] = userData?.fcmTokens || [];
  console.log("[SEND-PUSH] Found", subscriptions.length, "subscriptions");

  if (subscriptions.length === 0) {
    return 0;
  }

  let sent = 0;
  const toRemove: string[] = [];

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "pittima-deadline",
    url: payload.url || "https://rememberapp.zannalabs.com/dashboard",
  });

  for (const subStr of subscriptions) {
    try {
      const subscription = JSON.parse(subStr);
      console.log("[SEND-PUSH] Sending to endpoint:", subscription.endpoint?.substring(0, 60));
      await webpush.sendNotification(subscription, notificationPayload);
      sent++;
      console.log("[SEND-PUSH] Push sent successfully");
    } catch (error: any) {
      console.error("[SEND-PUSH] Failed:", error.message);
      if (error.statusCode === 410 || error.statusCode === 404) {
        toRemove.push(subStr);
      }
    }
  }

  if (toRemove.length > 0) {
    const { FieldValue } = await import("firebase-admin/firestore");
    await db.doc(docPath).update({
      fcmTokens: FieldValue.arrayRemove(...toRemove),
    });
    console.log("[SEND-PUSH] Removed", toRemove.length, "invalid subscriptions");
  }

  return sent;
}