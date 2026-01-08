'use server';
/**
 * @fileOverview The "Night's Watchman" and the "Hammer" for sending deadline notifications.
 *
 * - checkDeadlinesAndNotify - A scheduled flow that checks all deadlines and triggers notifications.
 * - sendNotification - A flow that sends a single email notification for a deadline.
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
  
    let appOptions: any = { projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId };
  
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
      }
    } else {
        console.log(
            'Initializing Firebase Admin for Notifications with default project ID (dev environment or scheduled run).'
        );
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
type NotificationPayloadSchema = z.infer<typeof NotificationPayloadSchema>;


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
    
    const adminApp = initializeAdminApp();
    const db = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    let checkedUsers = 0;
    let foundDeadlines = 0;
    let totalNotifications = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const listUsersResult = await auth.listUsers();
    const allUsers = listUsersResult.users;
    checkedUsers = allUsers.length;
    console.log(`Found ${checkedUsers} users to check.`);

    for (const userRecord of allUsers) {
      const { uid, email, displayName, emailVerified } = userRecord;

      if (!email || !emailVerified) {
        console.log(`Skipping user ${uid} - no verified email.`);
        continue;
      }
      
      const userDocRef = db.doc(`users/${uid}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data() as User | undefined;

      const deadlinesRef = db.collection(`users/${uid}/deadlines`);
      const deadlinesSnapshot = await deadlinesRef.get();

      if (deadlinesSnapshot.empty) {
        continue;
      }
      
      foundDeadlines += deadlinesSnapshot.size;

      const deadlinesToNotify: Deadline[] = [];

      for (const doc of deadlinesSnapshot.docs) {
        const deadline = doc.data() as Deadline;

        if (deadline.isCompleted) {
          continue;
        }
        
        const notificationStartDate = new Date(deadline.notificationStartDate);
        const isActiveForNotifications = deadline.notificationStatus === 'pending' || deadline.notificationStatus === 'active';
        const isPastNotificationStartDate = notificationStartDate <= today;

        if (isActiveForNotifications && isPastNotificationStartDate) {
          deadlinesToNotify.push(deadline);
        }
      }

      if (deadlinesToNotify.length > 0) {
        totalNotifications += deadlinesToNotify.length;
        console.log(`-> User ${email} has ${deadlinesToNotify.length} deadlines to be notified about. Preparing summary email.`);

        // Construct one email with all deadlines
        const subject = `Hai ${deadlinesToNotify.length} scadenze in avvicinamento!`;
        let body = `Ciao ${displayName || email.split('@')[0]},<br><br>Questo è un promemoria per le tue prossime scadenze:<br><br>`;
        
        body += '<ul>';
        deadlinesToNotify
          .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
          .forEach(d => {
            body += `<li><strong>${d.name}</strong> - Scade il: ${new Date(d.expirationDate).toLocaleDateString('it-IT')}</li>`;
        });
        body += '</ul>';

        body += "<br>Controlla l'app per tutti i dettagli.<br><br>Grazie per usare Pittima App.";

        try {
          await sendEmailTool({ to: email, subject, body });
          console.log(`-> Summary email sent successfully to ${email}.`);
        } catch (e) {
          console.error(`-> Failed to send summary email to ${email}:`, e);
        }

        // We can also still send individual push notifications
        if (userData?.pushSubscription) {
            console.log(`-> Sending ${deadlinesToNotify.length} individual push notifications to ${email}.`);
            for (const deadline of deadlinesToNotify) {
                 const pushPayload = {
                    title: `Promemoria: ${deadline.name}`,
                    body: `La tua scadenza è prevista per il ${new Date(deadline.expirationDate).toLocaleDateString('it-IT')}. Non dimenticare!`,
                };
                try {
                    await sendPushNotificationTool({
                        subscription: userData.pushSubscription,
                        payload: pushPayload,
                    });
                } catch(e) {
                    console.error(`-> Failed to send push notification for ${deadline.name} to ${email}:`, e);
                }
            }
        }
      }
    }

    const summary = {
      checkedUsers,
      foundDeadlines,
      notificationsTriggered: totalNotifications,
    };

    console.log("✅ NIGHT'S WATCH: Daily check complete. Summary:", summary);

    return summary;
  }
);

    