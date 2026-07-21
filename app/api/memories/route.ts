import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const memories = await prisma.memory.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(memories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const caption = formData.get("caption") as string;
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64File = buffer.toString("base64");

        // Upload to ImageKit REST API
        const IK_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "private_QPhJ5jbb5VhlSUhHssMuPIggvQM=";
        const IK_URL = "https://upload.imagekit.io/api/v1/files/upload";

        const basicAuth = Buffer.from(`${IK_PRIVATE_KEY}:`).toString("base64");

        const ikFormData = new FormData();
        ikFormData.append("file", base64File);
        ikFormData.append("fileName", file.name || "skybook_memory.jpg");
        ikFormData.append("useUniqueFileName", "true");

        const ikResponse = await fetch(IK_URL, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${basicAuth}`
            },
            body: ikFormData
        });

        if (!ikResponse.ok) {
            const errRes = await ikResponse.json();
            console.error("Imagekit Error:", errRes);
            return NextResponse.json({ error: "Failed to upload to ImageKit" }, { status: 500 });
        }

        const ikData = await ikResponse.json();
        const imageUrl = ikData.url;

        // Save DB
        const memory = await prisma.memory.create({
            data: {
                caption,
                imageUrl,
            },
        });

        return NextResponse.json(memory);
    } catch (error) {
        console.error("Save Memory Error:", error);
        return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
    }
}
