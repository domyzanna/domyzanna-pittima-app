import { NextResponse } from 'next/server';
import { sendWhatsApp } from '@/ai/tools/send-whatsapp-tool';

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    const result = await sendWhatsApp({
      to: `whatsapp:${to}`,
      body: '\u{1F4C5} Test da Pittima App!\nSe ricevi questo messaggio, WhatsApp funziona correttamente.',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to test WhatsApp' });
}
