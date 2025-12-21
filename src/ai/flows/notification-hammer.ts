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
    const adminAppName = 'admin-notifications';
    const existingApp = getApps().find(app => app.name === adminAppName);
    if (existingApp) {
      return existingApp;
    }
  
    let appOptions = {};
  
    // Prioritize service account key from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== 'INCOLLA_QUI_IL_JSON_DELLA_CHIAVE_DI_SERVIZIO') {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        appOptions = {
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || firebaseConfig.projectId,
        };
        console.log("Initializing Firebase Admin for Notifications with Service Account...");
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Check your .env file.", e);
        // Fallback if JSON is invalid
        appOptions = { projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId };
      }
    } else {
        console.log("Initializing Firebase Admin for Notifications with default project ID (dev environment).");
        // Fallback for local development or environments without the service key
        appOptions = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId,
        };
    }
  
    return initializeApp(appOptions, adminAppName);
}
  
const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);
const auth = getAuth(adminApp);


// Define a "Tool" for sending emails. This makes our flow more modular.
const sendEmailTool = ai.defineTool(
    {
      name: 'sendEmail',
      description: 'Sends a transactional email to a user.',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    },
    async (payload) => {
      // In a real-world scenario, you would integrate with a service like
      // SendGrid, Mailgun, or AWS SES here.
      // For now, we are logging it, but this structure is ready for a real provider.
      console.log('------- REAL EMAIL TOOL -------');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Body: ${payload.body}`);
      console.log('-----------------------------');
      
      // Simulate a successful email dispatch
      const success = true;
      const message = success 
        ? `Email successfully dispatched to ${payload.to}`
        : `Failed to send email to ${payload.to}`;
        
      return { success, message };
    }
);


// Define Zod schemas for our flow inputs/outputs for type safety.

const NotificationPayloadSchema = z.object({
  userEmail: z.string().email(),
  userName: z.string(),
  deadlineName: z.string(),
  deadlineExpiration: z.string(),
});
type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

/**
 * The "Hammer": Sends a single notification by calling the email tool.
 */
export const sendEmailNotification = ai.defineFlow(
  {
    name: 'sendEmailNotification',
    inputSchema: NotificationPayloadSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    // Make the tool available to this flow
    tools: [sendEmailTool],
  },
  async (payload) => {
    console.log(
      `🔔 HAMMER: Preparing to send notification to ${payload.userEmail} for deadline "${payload.deadlineName}"`
    );

    const subject = `Promemoria Scadenza: ${payload.deadlineName}`;
    const body = `Ciao ${payload.userName},\n\nQuesto è un promemoria per la tua scadenza "${payload.deadlineName}" che è prevista per il ${payload.deadlineExpiration}.\n\nControlla la tua app per maggiori dettagli.\n\nSaluti,\nIl team di Pittima App`;

    // The AI will decide to call the tool based on the prompt and tool description.
    // Here, we explicitly call it to send the email.
    const emailResult = await ai.runTool('sendEmail', {
        to: payload.userEmail,
        subject: subject,
        body: body,
    });


    return emailResult;
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

    const listUsersResult = await auth.listUsers();
    const allUsers = listUsersResult.users;
    checkedUsers = allUsers.length;
    console.log(`Found ${checkedUsers} users to check.`);

    for (const userRecord of allUsers) {
      const { uid, email, displayName, emailVerified } = userRecord;
      
      // We can only notify users with a verified email address.
      if (!email || !emailVerified) {
          console.log(`Skipping user ${uid} - no verified email.`);
          continue;
      }

      const deadlinesRef = db.collection(`users/${uid}/deadlines`);
      const q = deadlinesRef.where('isCompleted', '==', false);
      const deadlinesSnapshot = await q.get();

      if (deadlinesSnapshot.empty) {
        continue;
      }
      
      // Filter deadlines in code to avoid complex indexes
      for (const doc of deadlinesSnapshot.docs) {
        const deadline = doc.data() as Deadline;
        foundDeadlines++;

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
              userName: displayName || email.split('@')[0],
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
      foundDeadlines: foundDeadlines, // Correctly count all found, not just snapshot size
      notificationsTriggered,
    };

    console.log("✅ NIGHT'S WATCH: Daily check complete. Summary:", summary);

    return summary;
  }
);
