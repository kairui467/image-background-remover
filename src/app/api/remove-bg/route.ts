import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. 验证用户是否登录
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. 获取用户状态
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. 校验额度和订阅有效性
    const isProValid = user.planType === "PRO" && user.planExpiresAt && user.planExpiresAt > new Date();
    const hasEnoughCredits = user.credits > 0;

    if (!isProValid && !hasEnoughCredits) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase a credit pack or upgrade to Pro." },
        { status: 402 } 
      );
    }

    // ==========================================
    // 4. 在此处接入真实的 AI 背景去除 API
    // ==========================================
    // 假设 AI 成功返回了处理后的图片地址
    const processedImageUrl = "https://example.com/demo-processed-image.png"; 

    // 5. 扣减额度并写入使用记录
    if (!isProValid) {
      // 免费或流量包用户：扣减 1 次
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        }),
        prisma.imageRecord.create({
          data: { userId: user.id, status: "SUCCESS", cost: 1 },
        }),
      ]);
    } else {
      // 包月订阅用户：只记流水，不扣额度
      await prisma.imageRecord.create({
        data: { userId: user.id, status: "SUCCESS", cost: 0 },
      });
    }

    return NextResponse.json({ 
      success: true, 
      url: processedImageUrl,
      remainingCredits: isProValid ? "Unlimited" : user.credits - 1 
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
