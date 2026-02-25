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
import { sendEmailTool } from '@/ai/tools/send-email-tool';
import { sendPushToUser } from '@/lib/send-push';
import { sendWhatsApp } from '@/ai/tools/send-whatsapp-tool';
import { credential } from 'firebase-admin';


// Firebase Admin SDK Initialization
function initializeAdminApp(): App {
    const adminAppName = 'admin-notifications';
    const existingApp = getApps().find((app) => app.name === adminAppName);
    if (existingApp) {
      return existingApp;
    }
    
    console.log('Initializing Firebase Admin for Notifications using ADC...');
    
    // Usa Application Default Credentials (ADC)
    // Funziona automaticamente in Google Cloud quando i permessi IAM sono corretti.
    return initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-1765347057-3bb5c',
    }, adminAppName);
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

        // Send push notification
        try {
          const pushCount = await sendPushToUser(uid, {
            title: `📅 ${deadlinesToNotify.length} scadenze in avvicinamento!`,
            body: deadlinesToNotify.slice(0, 3).map(d => d.name).join(", ") + (deadlinesToNotify.length > 3 ? ` e altre ${deadlinesToNotify.length - 3}...` : ""),
            url: "https://rememberapp.zannalabs.com/dashboard",
          });
          console.log(`-> Push notifications sent to ${email}: ${pushCount} devices.`);
        } catch (pushError) {
          console.error(`-> Failed to send push to ${email}:`, pushError);
        }

        // --- WHATSAPP (solo Pro, solo giorno prima e giorno stesso) ---
        try {
          const userDoc = await db.collection("users").doc(uid).get();
          const userData = userDoc.data() || {};
          const whatsappEnabled = userData.whatsappEnabled === true;
          const whatsappNumber = userData.whatsappNumber;

          // Verifica Pro (subscription attiva)
          const subsSnap = await db
            .collection("customers").doc(uid)
            .collection("subscriptions")
            .where("status", "in", ["trialing", "active"])
            .limit(1).get();
          const isPro = !subsSnap.empty;

          if (isPro && whatsappEnabled && whatsappNumber) {
            const waDeadlines = deadlinesToNotify.filter(d => {
              const expiry = new Date(d.expirationDate);
              expiry.setHours(0, 0, 0, 0);
              const dayBefore = new Date(expiry);
              dayBefore.setDate(dayBefore.getDate() - 1);
              const isToday = today.getTime() === expiry.getTime();
              const isDayBefore = today.getTime() === dayBefore.getTime();
              return isToday || isDayBefore;
            });

            if (waDeadlines.length > 0) {
              let msg = "\u{1F4C5} Pittima - Promemoria Scadenze\n\n";
              for (const d of waDeadlines) {
                const expiry = new Date(d.expirationDate);
                expiry.setHours(0, 0, 0, 0);
                const isExpToday = today.getTime() === expiry.getTime();
                const prefix = isExpToday ? "\u{1F534} OGGI" : "\u26A0\uFE0F DOMANI";
                const formattedDate = expiry.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
                msg += `${prefix}: ${d.name} - scade ${formattedDate}\n`;
              }
              msg += "\nApri Pittima per aggiornare le tue scadenze.";

              await sendWhatsApp({
                to: `whatsapp:${whatsappNumber}`,
                body: msg,
              });
              console.log(`-> WhatsApp sent to ${whatsappNumber} (${waDeadlines.length} deadlines)`);
            }
          }
        } catch (waError) {
          console.error(`-> Failed to send WhatsApp for ${email}:`, waError);
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
