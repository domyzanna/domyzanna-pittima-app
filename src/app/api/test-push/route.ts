import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/send-push";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    console.log('[TEST-PUSH] Sending test push to user:', userId);
    console.log('[TEST-PUSH] VAPID_PUBLIC_KEY present:', !!process.env.VAPID_PUBLIC_KEY);
    console.log('[TEST-PUSH] VAPID_PRIVATE_KEY present:', !!process.env.VAPID_PRIVATE_KEY);
    console.log('[TEST-PUSH] NEXT_PUBLIC_VAPID_PUBLIC_KEY present:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
    
    const count = await sendPushToUser(userId, {
      title: "Test Pittima App",
      body: "Se vedi questa notifica, le push funzionano!",
      url: "https://rememberapp.zannalabs.com/dashboard",
    });
    
    return NextResponse.json({ success: true, pushSent: count });
  } catch (error: any) {
    console.error('[TEST-PUSH] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
