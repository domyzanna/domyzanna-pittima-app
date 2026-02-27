import { NextResponse } from 'next/server';
import { sendWhatsApp } from '@/ai/tools/send-whatsapp-tool';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

function getAdminApp() {
  const appName = 'admin-whatsapp-verify';
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return existing;
  return initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-1765347057-3bb5c',
  }, appName);
}

// POST: Send OTP or Verify OTP
export async function POST(req: Request) {
  try {
    const { action, uid, phoneNumber, code } = await req.json();

    if (!uid) {
      return NextResponse.json({ success: false, message: 'UID mancante' }, { status: 400 });
    }

    const db = getFirestore(getAdminApp());
    const userRef = db.collection('users').doc(uid);

    if (action === 'send') {
      // Generate 4-digit code
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Save OTP to Firestore
      await userRef.set({
        whatsappOtp: otp,
        whatsappOtpExpiresAt: expiresAt,
        whatsappOtpAttempts: 0,
      }, { merge: true });

      // Send via WhatsApp
      const result = await sendWhatsApp({
        to: `whatsapp:${phoneNumber}`,
        body: `\u{1F510} Il tuo codice di verifica Pittima è: ${otp}\n\nInserisci questo codice nell'app per verificare il tuo numero.\nIl codice scade tra 10 minuti.`,
      });

      if (result.success) {
        return NextResponse.json({ success: true, message: 'Codice inviato' });
      } else {
        return NextResponse.json({ success: false, message: result.message || 'Invio fallito' });
      }

    } else if (action === 'verify') {
      // Get stored OTP
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};

      const storedOtp = userData.whatsappOtp;
      const expiresAt = userData.whatsappOtpExpiresAt || 0;
      const attempts = userData.whatsappOtpAttempts || 0;

      // Max 5 attempts
      if (attempts >= 5) {
        return NextResponse.json({ success: false, message: 'Troppi tentativi. Richiedi un nuovo codice.' });
      }

      // Check expiry
      if (Date.now() > expiresAt) {
        return NextResponse.json({ success: false, message: 'Codice scaduto. Richiedi un nuovo codice.' });
      }

      // Increment attempts
      await userRef.set({ whatsappOtpAttempts: attempts + 1 }, { merge: true });

      // Verify
      if (code === storedOtp) {
        await userRef.set({
          whatsappVerified: true,
          whatsappVerifiedAt: new Date().toISOString(),
          whatsappOtp: null,
          whatsappOtpExpiresAt: null,
          whatsappOtpAttempts: null,
        }, { merge: true });

        return NextResponse.json({ success: true, message: 'Numero verificato!' });
      } else {
        return NextResponse.json({ success: false, message: `Codice errato. ${4 - attempts} tentativi rimasti.` });
      }

    } else {
      return NextResponse.json({ success: false, message: 'Azione non valida' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('WhatsApp verify error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
