import { NextResponse } from "next/server";
import { checkDeadlinesAndNotify } from "@/ai/flows/notification-hammer";

export async function POST(request: Request) {
  console.log("🔔 Cron job triggered: checkDeadlinesAndNotify");
  
  try {
    const result = await checkDeadlinesAndNotify();
    console.log("✅ Cron job completed:", result);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ message: "Use POST to trigger the cron job" });
}
