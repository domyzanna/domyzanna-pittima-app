'use server';
/**
 * @fileOverview The "Night's Watchman" and the "Hammer" for sending deadline notifications.
 *
 * - checkDeadlinesAndNotify - A scheduled flow that checks all deadlines and triggers notifications.
 * - sendEmailNotification - A flow that sends a single email notification for a deadline.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Deadline } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// Firebase Admin SDK Initialization
function initializeAdminApp(): App {
    if (getApps().some(app => app.name === 'admin')) {
      return getApps().find(app => app.name === 'admin')!;
    }
  
    let appOptions = {};
  
    // Prioritize service account key from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== 'INCOLLA_QUI_IL_JSON_DELLA_CHIAVE_DI_SERVIZIO') {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        appOptions = {
          credential: cert(serviceAccount),
        };
        console.log("Initializing Firebase Admin with Service Account...");
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Check your .env file.", e);
        // Fallback if JSON is invalid
        appOptions = { projectId: firebaseConfig.projectId };
      }
    } else {
        console.log("Initializing Firebase Admin with default project ID (dev environment).");
        // Fallback for local development or environments without the service key
        appOptions = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId,
        };
    }
  
    return initializeApp(appOptions, 'admin');
}
  
const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);
const auth = getAuth(adminApp);

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

    // 1. Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const allUsers = listUsersResult.users;
    checkedUsers = allUsers.length;

    console.log(`Found ${checkedUsers} users to check.`);

    // 2. Iterate over each user
    for (const userRecord of allUsers) {
      const { uid, email, displayName } = userRecord;
      if (!email) continue; // Cannot notify if there's no email

      // 3. Query for their active deadlines (simplified query)
      const deadlinesRef = db.collection(`users/${uid}/deadlines`);
      // Simpler query: just get all non-completed deadlines. We'll filter in code.
      const q = deadlinesRef.where('isCompleted', '==', false);

      const deadlinesSnapshot = await q.get();
      if (deadlinesSnapshot.empty) {
        continue;
      }
      
      foundDeadlines += deadlinesSnapshot.size;

      // 4. For each relevant deadline, filter in code and trigger the "Hammer"
      for (const doc of deadlinesSnapshot.docs) {
        const deadline = doc.data() as Deadline;

        const notificationStartDate = new Date(deadline.notificationStartDate);
        const shouldNotify = deadline.notificationStatus !== 'paused' && notificationStartDate <= today;

        if (shouldNotify) {
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
