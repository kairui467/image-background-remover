export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    
    const credits = 3; 
    if (credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    return NextResponse.json({ 
      success: true, 
      url: "https://example.com/demo-processed-image.png",
      remainingCredits: credits - 1 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
