'use server';
/**
 * @fileOverview The "Night's Watchman" and the "Hammer" for sending deadline notifications.
 *
 * - checkDeadlinesAndNotify - A scheduled flow that checks all deadlines and triggers notifications.
 * - sendEmailNotification - A flow that sends a single email notification for a deadline.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Deadline, User } from '@/lib/types';

// Firebase Admin SDK Initialization
// This needs to be done once. We check if an app is already initialized.
if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // For local development without service account key (using emulators or gcloud auth)
    initializeApp();
  }
}

const db = getFirestore();
const auth = getAuth();

// Define Zod schemas for our flow inputs/outputs for type safety.

const NotificationPayloadSchema = z.object({
  userEmail: z.string().email(),
  userName: z.string(),
  deadlineName: z.string(),
  deadlineExpiration: z.string(),
});
type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

/**
 * The "Hammer": Sends a single notification.
 * In a real app, this would use a service like SendGrid, Mailgun, or Firebase Cloud Messaging.
 * For now, it just logs the action to the console.
 */
export const sendEmailNotification = ai.defineFlow(
  {
    name: 'sendEmailNotification',
    inputSchema: NotificationPayloadSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (payload) => {
    console.log(
      `🔔 HAMMER: Preparing to send notification to ${payload.userEmail} for deadline "${payload.deadlineName}"`
    );

    // TODO: Replace this with a real email/notification sending service.
    const message = `Simulated email sent to ${payload.userEmail} for deadline: ${payload.deadlineName} expiring on ${payload.deadlineExpiration}.`;
    console.log(message);

    return { success: true, message };
  }
);

/**
 * The "Night's Watchman": Checks all user deadlines and triggers notifications.
 * This flow is designed to be run on a schedule (e.g., once a day via a cron job).
 */
export const checkDeadlinesAndNotify = ai.defineFlow(
  {
    name: 'checkDeadlinesAndNotify',
    outputSchema: z.object({
      checkedUsers: z.number(),
      foundDeadlines: z.number(),
      notificationsTriggered: z.number(),
    }),
  },
  async () => {
    console.log("🛡️ NIGHT'S WATCH: Starting daily deadline check...");
    let checkedUsers = 0;
    let foundDeadlines = 0;
    let notificationsTriggered = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const todayTimestamp = Timestamp.fromDate(today);

    // 1. Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const allUsers = listUsersResult.users;
    checkedUsers = allUsers.length;

    console.log(`Found ${checkedUsers} users to check.`);

    // 2. Iterate over each user
    for (const userRecord of allUsers) {
      const { uid, email, displayName } = userRecord;
      if (!email) continue; // Cannot notify if there's no email

      // 3. Query for their deadlines that are active and need notification
      const deadlinesRef = collection(db, `users/${uid}/deadlines`);
      const q = query(
        deadlinesRef,
        where('isCompleted', '==', false),
        where('notificationStatus', '!=', 'paused'),
        where('notificationStartDate', '<=', today.toISOString())
      );

      const deadlinesSnapshot = await getDocs(q);
      if (deadlinesSnapshot.empty) {
        continue;
      }
      
      foundDeadlines += deadlinesSnapshot.size;

      // 4. For each relevant deadline, trigger the "Hammer"
      for (const doc of deadlinesSnapshot.docs) {
        const deadline = doc.data() as Deadline;
        notificationsTriggered++;

        console.log(
          `-> Found active deadline "${deadline.name}" for user ${email}. Triggering hammer.`
        );

        // We call the notification flow but don't wait for it to complete.
        // This allows us to quickly trigger many notifications in parallel.
        sendEmailNotification({
          userEmail: email,
          userName: displayName || email,
          deadlineName: deadline.name,
          deadlineExpiration: new Date(
            deadline.expirationDate
          ).toLocaleDateString('it-IT'),
        });
      }
    }

    const summary = {
      checkedUsers,
      foundDeadlines,
      notificationsTriggered,
    };

    console.log("✅ NIGHT'S WATCH: Daily check complete. Summary:", summary);

    return summary;
  }
);
