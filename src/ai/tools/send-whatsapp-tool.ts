'use server';

import twilio from 'twilio';

export async function sendWhatsApp({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    const errorMsg = 'Twilio credentials missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM).';
    console.error(errorMsg);
    return { success: false, message: errorMsg };
  }

  console.log(`Attempting to send WhatsApp to ${to}`);

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from,
      to,
      body,
    });

    console.log(`WhatsApp sent successfully, SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('WhatsApp send failed:', error.message);
    return { success: false, message: error.message };
  }
}
