import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/send-push";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getTestAdminApp() {
  const name = "admin-test";
  const existing = getApps().find((a) => a.name === name);
  if (existing) return existing;
  return initializeApp({
    projectId: "studio-1765347057-3bb5c",
  }, name);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "OwWmDkIda2Ql6MJFU0gVesHwHfT2";

  try {
    // Test 1: Direct Firestore read
    const app = getTestAdminApp();
    const db = getFirestore(app);
    
    // List all docs in users collection
    const usersSnap = await db.collection("users").limit(3).get();
    const userIds = usersSnap.docs.map(d => d.id);
    console.log("[TEST] First 3 user IDs:", userIds);
    
    // Try to read the specific user
    const userDoc = await db.doc("users/" + userId).get();
    console.log("[TEST] Direct read exists:", userDoc.exists);
    
    // Test 2: Try sendPushToUser
    const count = await sendPushToUser(userId, {
      title: "Test Pittima",
      body: "Se vedi questa notifica, le push funzionano!",
      url: "https://rememberapp.zannalabs.com/dashboard",
    });

    return NextResponse.json({
      success: true,
      pushSent: count,
      debug: {
        firstUserIds: userIds,
        directReadExists: userDoc.exists,
        directReadData: userDoc.exists ? Object.keys(userDoc.data() || {}) : null,
      }
    });
  } catch (error: any) {
    console.error("[TEST] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
