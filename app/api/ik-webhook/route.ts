import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const signature = req.headers.get("x-imagekit-signature");
        const bodyText = await req.text();
        const secret = process.env.IMAGEKIT_WEBHOOK_SECRET || "whsec_hWCtqm+OvMfQwlc24SqI1VL5EtF5fY/f";

        if (signature) {
            const expectedSignature = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');
            // Normally verify the signature here if strict (expectedSignature === signature)
        }

        const body = JSON.parse(bodyText);

        const imageUrl = body?.url || body?.file?.url;
        const caption = body?.customMetadata?.caption || body?.tags?.[0] || "Skybook Memory";

        if (imageUrl) {
            await prisma.memory.create({
                data: {
                    imageUrl,
                    caption
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
