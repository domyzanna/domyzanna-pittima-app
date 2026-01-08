'use server';
/**
 * @fileOverview The "Night's Watchman" for sending deadline notifications.
 *
 * - checkDeadlinesAndNotify - A scheduled flow that checks all deadlines and triggers notifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Deadline, User } from '@/lib/types';
import { sendPushNotificationTool } from '@/ai/tools/send-push-notification-tool';
import { sendEmailTool } from '@/ai/tools/send-email-tool';
import { credential } from 'firebase-admin';


// Firebase Admin SDK Initialization
function initializeAdminApp(): App {
  const adminAppName = 'admin-notifications';
  const existingApp = getApps().find((app) => app.name === adminAppName);
  if (existingApp) {
    return existingApp;
  }

  console.log('Initializing Firebase Admin for Notifications...');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The scheduled job cannot run.'
    );
  }

  let serviceAccount: ServiceAccount;
  try {
     serviceAccount = JSON.parse(serviceAccountKey);
  } catch (e) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.");
  }

  const appOptions = {
    credential: credential.cert(serviceAccount),
  };

  return initializeApp(appOptions, adminAppName);
}


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
        
        // Ignore deadlines that are explicitly marked as completed and not recurring
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
            const expDate = new Date(d.expirationDate);
            const formattedDate = expDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
            const daysRemaining = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let urgencyLabel = `Scade il: ${formattedDate}`;
            if (daysRemaining < 0) {
              urgencyLabel = `Scaduta da ${Math.abs(daysRemaining)} giorni!`;
            } else if (daysRemaining === 0) {
              urgencyLabel = `Scade OGGI!`;
            }

            body += `<li><strong>${d.name}</strong> - ${urgencyLabel}</li>`;
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
            const pushPromises = deadlinesToNotify.map(deadline => {
                const pushPayload = {
                    title: `Promemoria: ${deadline.name}`,
                    body: `La tua scadenza è prevista per il ${new Date(deadline.expirationDate).toLocaleDateString('it-IT')}. Non dimenticare!`,
                };
                // Return the promise from the tool
                return sendPushNotificationTool({
                    subscription: userData.pushSubscription!,
                    payload: pushPayload,
                }).catch(e => { // Catch errors individually
                    console.error(`-> Failed to send push notification for ${deadline.name} to ${email}:`, e);
                });
            });
            // Wait for all push notifications to be sent
            await Promise.all(pushPromises);
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
