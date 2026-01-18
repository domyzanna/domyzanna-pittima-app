'use server';

import { ai } from '@/ai/genkit';
import { Resend } from 'resend';
import { z } from 'zod';

export const sendEmailTool = ai.defineTool(
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
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      const errorMsg = 'Resend API key not found in environment variables (RESEND_API_KEY).';
      console.warn(errorMsg);
      return { success: false, message: errorMsg };
    }
    
    console.log(`Attempting to send email to ${payload.to} with subject "${payload.subject}"`);

    const resend = new Resend(resendApiKey);

    try {
      const { data, error } = await resend.emails.send({
        from: 'Pittima App <infopittima@zannalabs.com>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.body.replace(/\n/g, '<br>'), // Convert newlines to <br> for HTML
      });

      if (error) {
        console.error('Error sending email with Resend:', error);
        return { success: false, message: JSON.stringify(error) };
      }

      console.log('Email sent successfully, ID:', data?.id);
      return { success: true, message: `Email successfully dispatched to ${payload.to}` };

    } catch (e: any) {
      console.error('Exception while sending email:', e);
      return { success: false, message: e.message || 'A generic exception occurred while trying to send the email.' };
    }
  }
);
