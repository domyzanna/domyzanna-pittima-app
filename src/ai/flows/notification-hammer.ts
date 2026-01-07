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
import type { Deadline, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';
import { sendPushNotificationTool } from '@/ai/tools/send-push-notification-tool';
import { sendEmailTool } from '@/ai/tools/send-email-tool';


// Firebase Admin SDK Initialization
function initializeAdminApp(): App {
    const adminAppName = 'admin-notifications';
    const existingApp = getApps().find((app) => app.name === adminAppName);
    if (existingApp) {
      return existingApp;
    }
  
    let appOptions: any = {};
  
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== 'INCOLLA_QUI_IL_JSON_DELLA_CHIAVE_DI_SERVIZIO') {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        appOptions = {
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || firebaseConfig.projectId,
        };
        console.log('Initializing Firebase Admin for Notifications with Service Account...');
      } catch (e) {
        console.error(
          'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Check your .env file.',
          e
        );
        // Fallback if parsing fails but key exists
        appOptions = { projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId };
      }
    } else {
        console.log(
            'Initializing Firebase Admin for Notifications with default project ID (dev environment).'
        );
        // Fallback for dev or environments without the service account key
        appOptions = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId,
        };
    }
  
    return initializeApp(appOptions, adminAppName);
}

// Define Zod schemas for our flow inputs/outputs for type safety.

const NotificationPayloadSchema = z.object({
  userEmail: z.string().email(),
  userName: z.string(),
  user: z.custom<User>(),
  deadlineName: z.string(),
  deadlineExpiration: z.string(),
});

/**
 * The "Hammer": Sends a single notification by calling the email tool.
 */
export const sendNotification = ai.defineFlow(
  {
    name: 'sendNotification',
    inputSchema: NotificationPayloadSchema,
    outputSchema: z.object({ emailSuccess: z.boolean(), pushSuccess: z.boolean() }),
    tools: [sendEmailTool, sendPushNotificationTool],
  },
  async (payload) => {
    console.log(
      `🔔 HAMMER: Preparing to send notification to ${payload.userEmail} for deadline "${payload.deadlineName}"`
    );

    let emailSuccess = false;
    let pushSuccess = false;

    // --- Send Email ---
    const subject = `Promemoria Scadenza: ${payload.deadlineName}`;
    const body = `Ciao ${payload.userName},

Ti ricordiamo che la tua scadenza "${payload.deadlineName}" è in arrivo.

**Data di scadenza:** ${payload.deadlineExpiration}

Questo è un promemoria automatico per aiutarti a ricordare. Puoi vedere tutti i dettagli e gestire le tue scadenze direttamente dall'app.

Grazie per usare Pittima App,
Il tuo assistente per le scadenze.`;

    try {
      const emailResult = await sendEmailTool( {
          to: payload.userEmail,
          subject: subject,
          body: body,
        });
      emailSuccess = emailResult.success;
      if (!emailSuccess) {
          console.warn(`Email sending failed for ${payload.userEmail}: ${emailResult.message}`);
      }
    } catch (e: any) {
        console.error(`Exception during email sending for ${payload.userEmail}:`, e);
        emailSuccess = false;
    }


    // --- Send Push Notification ---
    if (payload.user.pushSubscription) {
      console.log(`-> Found push subscription for user ${payload.userEmail}. Sending push notification.`);
      const pushPayload = {
        title: `Promemoria: ${payload.deadlineName}`,
        body: `La tua scadenza è prevista per il ${payload.deadlineExpiration}. Non dimenticare!`,
      };
      try {
        const pushResult = await sendPushNotificationTool({
            subscription: payload.user.pushSubscription,
            payload: pushPayload,
          });
        pushSuccess = pushResult.success;
        if(!pushSuccess) {
            console.warn(`Push notification failed for ${payload.userEmail}: ${pushResult.message}`);
        }
      } catch (e: any) {
        console.error(`Exception during push notification for ${payload.userEmail}:`, e);
        pushSuccess = false;
      }

    } else {
        console.log(`-> No push subscription for user ${payload.userEmail}. Skipping push notification.`);
    }


    return { emailSuccess, pushSuccess };
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
    
    // Initialize admin app and services here, only when the flow is run
    const adminApp = initializeAdminApp();
    const db = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    let checkedUsers = 0;
    let foundDeadlines = 0;
    let notificationsTriggered = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const listUsersResult = await auth.listUsers();
    const allUsers = listUsersResult.users;
    checkedUsers = allUsers.length;
    console.log(`Found ${checkedUsers} users to check.`);

    for (const userRecord of allUsers) {
      const { uid, email, displayName, emailVerified } = userRecord;

      if (!email) {
        console.log(`Skipping user ${uid} - no email.`);
        continue;
      }
      
      const userDocRef = db.doc(`users/${uid}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data() as User | undefined;

      const deadlinesRef = db.collection(`users/${uid}/deadlines`);
      const q = deadlinesRef.where('isCompleted', '==', false);
      const deadlinesSnapshot = await q.get();

      if (deadlinesSnapshot.empty) {
        continue;
      }
      
      foundDeadlines += deadlinesSnapshot.size;

      for (const doc of deadlinesSnapshot.docs) {
        const deadline = doc.data() as Deadline;
        
        // We only send emails to verified accounts
        const shouldSendEmail = emailVerified;
        // We only send push if there's a subscription
        const shouldSendPush = !!userData?.pushSubscription;

        const notificationStartDate = new Date(deadline.notificationStartDate);
        
        const isActiveForNotifications = deadline.notificationStatus === 'pending' || deadline.notificationStatus === 'active';
        const isPastNotificationStartDate = notificationStartDate <= today;

        if (isActiveForNotifications && isPastNotificationStartDate && (shouldSendEmail || shouldSendPush)) {
          console.log(
            `-> Found active deadline "${deadline.name}" for user ${email}. Triggering hammer.`
          );
          
          await sendNotification({
            userEmail: email,
            userName: displayName || email.split('@')[0],
            user: { ...userData, id: uid, email, displayName } as User,
            deadlineName: deadline.name,
            deadlineExpiration: new Date(
              deadline.expirationDate
            ).toLocaleDateString('it-IT'),
          });
          notificationsTriggered++;
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
